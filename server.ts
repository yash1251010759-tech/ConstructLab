import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client lazily or safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Chatbot API Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, circuitContext } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is missing. Please configure GEMINI_API_KEY in environment secrets.',
      });
    }

    const systemInstruction = `
You are the AI Electronics & Digital Logic Tutor for ConstructLab (a digital logic simulator).
You are friendly, highly knowledgeable, and specialize in:
1. Explaining logic gates, multiplexers, adders, decoders, flip-flops, counters, shift registers, and ALUs.
2. Analyzing and debugging circuits designed by the user on the ConstructLab canvas.
3. Teaching Boolean algebra, De Morgan's laws, Karnaugh maps (K-Maps), truth tables, timing diagrams, propagation delay, and finite state machines (FSM).
4. Assisting with Verilog HDL and digital circuit design homework/projects.
5. If the user asks you to design, build, create, wire, or synthesize ANY circuit (for example: "design a set up and gate for me such that it should get two inputs a and b and output as led" or "build a full adder" or "make an SR latch"):
   - ALWAYS explain clearly how the circuit operates, its truth table, and wiring connections.
   - ALWAYS include the complete executable circuit JSON inside a \`\`\`circuit-json code fence so that ConstructLab can render a "Load to Canvas" button for the user to load and simulate it instantly with 1 click!

IMPORTANT SCHEMA FOR \`\`\`circuit-json:
\`\`\`circuit-json
{
  "title": "Circuit Title",
  "description": "Short explanation of the circuit",
  "components": [
    { "id": "sw_a", "type": "INPUT_SWITCH", "label": "Switch A", "x": 100, "y": 120 },
    { "id": "sw_b", "type": "INPUT_SWITCH", "label": "Switch B", "x": 100, "y": 220 },
    { "id": "and_1", "type": "AND", "label": "AND Gate", "x": 300, "y": 170 },
    { "id": "led_1", "type": "LED", "label": "Output LED", "x": 500, "y": 170 }
  ],
  "wires": [
    { "id": "w1", "fromComp": "sw_a", "fromPort": "out", "toComp": "and_1", "toPort": "in0" },
    { "id": "w2", "fromComp": "sw_b", "fromPort": "out", "toComp": "and_1", "toPort": "in1" },
    { "id": "w3", "fromComp": "and_1", "fromPort": "out", "toComp": "led_1", "toPort": "in" }
  ]
}
\`\`\`

PORT REFERENCE GUIDE FOR COMPONENTS:
- "INPUT_SWITCH" / "PUSH_BUTTON" / "CLOCK" / "CONST_HIGH" / "CONST_LOW":
  - Output port: "out"
- "LED" / "BUZZER":
  - Input port: "in"
- "AND" / "OR" / "NAND" / "NOR" / "XOR" / "XNOR":
  - Input ports: "in0" (top), "in1" (bottom)
  - Output port: "out"
- "NOT" / "BUFFER":
  - Input port: "in0"
  - Output port: "out"
- "D_FLIP_FLOP":
  - Input ports: "d", "clk"
  - Output ports: "q", "qbar"
- "JK_FLIP_FLOP":
  - Input ports: "j", "clk", "k"
  - Output ports: "q", "qbar"
- "SR_LATCH":
  - Input ports: "s", "r"
  - Output ports: "q", "qbar"
- "T_FLIP_FLOP":
  - Input ports: "t", "clk"
  - Output ports: "q", "qbar"
- "MUX_2_1":
  - Input ports: "in0", "in1", "sel"
  - Output port: "out"
- "ADDER_4BIT":
  - Input ports: "a0", "a1", "a2", "a3", "b0", "b1", "b2", "b3", "cin"
  - Output ports: "s0", "s1", "s2", "s3", "cout"
- "7_SEGMENT":
  - Input ports: "a", "b", "c", "d", "e", "f", "g", "dp"

Keep coordinates spaced out nicely (e.g. inputs on x: 100, gates on x: 300, outputs on x: 500) so the diagram is clean and easy to read.
`;

    // Format chat history for contents
    const contents: any[] = [];

    // Add circuit context if available
    let contextHeader = '';
    if (circuitContext) {
      contextHeader = `[Current Canvas Circuit State: "${circuitContext.title || 'Untitled'}", Components Count: ${circuitContext.components?.length || 0}, Wires Count: ${circuitContext.wires?.length || 0}. Components: ${JSON.stringify(circuitContext.components?.map((c: any) => ({ id: c.id, type: c.type, label: c.label })))}, Wires: ${JSON.stringify(circuitContext.wires?.map((w: any) => `${w.fromComp}:${w.fromPort} -> ${w.toComp}:${w.toPort}`))}]\n\n`;
    }

    if (Array.isArray(messages)) {
      messages.forEach((msg, idx) => {
        const isLastUser = idx === messages.length - 1 && msg.role === 'user';
        const textContent = isLastUser && contextHeader ? contextHeader + msg.content : msg.content;

        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: textContent }],
        });
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: 'Hello!' }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error('Error in AI chat:', err);
    res.status(500).json({ error: err.message || 'Failed to process AI chat request' });
  }
});

// AI Circuit Explanation API
app.post('/api/ai/explain-circuit', async (req, res) => {
  try {
    const { components, wires, summary } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is missing. Please configure GEMINI_API_KEY in environment secrets.',
      });
    }

    const prompt = `
You are an expert Digital Electronics & Logic Design Professor.
Analyze the following digital logic circuit structure and explain it in clear, structured, educational terms for a student.

Circuit Information:
${JSON.stringify({ components, wireCount: wires?.length, summary }, null, 2)}

Please provide an educational response in Markdown format including:
1. **Circuit Purpose & Overview**: What does this circuit accomplish?
2. **Key Components & Function**: Role of each gate/flip-flop/input/output.
3. **Boolean Logic Expression**: Mathematical equations representing outputs in terms of inputs.
4. **Behavioral Analysis**: Walkthrough of how signals flow through the gates.
5. **Practical Applications**: Where is this circuit used in real computer engineering?
6. **Key Takeaway / Tips**: Study note for students.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ explanation: response.text });
  } catch (err: any) {
    console.error('Error in explain-circuit:', err);
    res.status(500).json({ error: err.message || 'Failed to explain circuit' });
  }
});

// AI Circuit Troubleshooting API
app.post('/api/ai/troubleshoot', async (req, res) => {
  try {
    const { components, wires } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is missing.',
      });
    }

    const prompt = `
You are a Digital Electronics QA engineer. Inspect this digital circuit topology for logic design issues:
Components: ${JSON.stringify(components)}
Wires: ${JSON.stringify(wires)}

Identify any:
- Unconnected input pins (floating inputs)
- Short circuits / outputs driving outputs
- Missing clock inputs or enable signals
- Infinite oscillation or feedback loops without state storage
- Unreachable logic states

Format output with bullet points:
- **Status**: [PASS / WARNING / ERROR]
- **Issues Found**:
- **Suggested Fixes**:
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (err: any) {
    console.error('Error in troubleshoot:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze circuit' });
  }
});

// AI Logic Circuit Synthesizer API
app.post('/api/ai/synthesize', async (req, res) => {
  try {
    const { prompt } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is missing.',
      });
    }

    const systemPrompt = `
You are a digital logic synthesizer. The user wants a circuit for: "${prompt}".
Respond ONLY with a valid JSON object describing the components and wiring layout on a 2D grid.

Supported Component Types:
- "INPUT_SWITCH" (label, x, y)
- "CLOCK" (label, x, y)
- "LED" (label, x, y)
- "7_SEGMENT" (label, x, y)
- "AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR" (x, y)
- "D_FLIP_FLOP", "JK_FLIP_FLOP" (x, y)
- "MULTIPLEXER_2_1", "ADDER_4BIT" (x, y)

Return JSON in format:
{
  "title": "Circuit Title",
  "description": "Short summary",
  "components": [
    { "id": "comp_1", "type": "INPUT_SWITCH", "label": "A", "x": 100, "y": 100 },
    { "id": "comp_2", "type": "INPUT_SWITCH", "label": "B", "x": 100, "y": 200 },
    { "id": "comp_3", "type": "AND", "label": "AND1", "x": 300, "y": 150 },
    { "id": "comp_4", "type": "LED", "label": "OUT", "x": 500, "y": 150 }
  ],
  "wires": [
    { "fromComp": "comp_1", "fromPort": "out", "toComp": "comp_3", "toPort": "in0" },
    { "fromComp": "comp_2", "fromPort": "out", "toComp": "comp_3", "toPort": "in1" },
    { "fromComp": "comp_3", "fromPort": "out", "toComp": "comp_4", "toPort": "in" }
  ]
}
Make sure x is between 100 and 900, y between 100 and 700 with clear spacing. Output ONLY JSON, no markdown formatting.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });

    const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(text);

    res.json(result);
  } catch (err: any) {
    console.error('Error in synthesize:', err);
    res.status(500).json({ error: err.message || 'Failed to synthesize circuit' });
  }
});

// Vite server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ⚡ ConstructLab Studio is ready!`);
    console.log(`  ➜ Local:   http://localhost:${PORT}`);
    console.log(`  ➜ Network: http://127.0.0.1:${PORT}\n`);
  });
}

startServer();
