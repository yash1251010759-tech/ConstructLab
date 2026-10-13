import { CircuitData, ComponentItem, Wire } from '../types/circuit';
import { COMPONENT_CATALOG } from './circuitEngine';

export interface SynthesizedResponse {
  reply: string;
  circuit?: CircuitData;
}

// Client-side and server-side fallback intelligent knowledge synthesizer
export function synthesizeLocalCircuit(prompt: string, currentCircuit?: CircuitData): SynthesizedResponse | null {
  const p = prompt.toLowerCase();

  // 1. AND Gate setup (inputs A, B -> AND -> LED)
  if (
    p.includes('and') &&
    (p.includes('input') || p.includes('gate') || p.includes('led') || p.includes('switch') || p.includes('setup') || p.includes('design'))
  ) {
    const components: ComponentItem[] = [
      {
        id: 'sw_a',
        type: 'INPUT_SWITCH',
        label: 'Switch A',
        x: 120,
        y: 130,
        rotation: 0,
        ports: COMPONENT_CATALOG.INPUT_SWITCH.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { isOn: true, value: 1 },
      },
      {
        id: 'sw_b',
        type: 'INPUT_SWITCH',
        label: 'Switch B',
        x: 120,
        y: 250,
        rotation: 0,
        ports: COMPONENT_CATALOG.INPUT_SWITCH.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { isOn: true, value: 1 },
      },
      {
        id: 'and_gate',
        type: 'AND',
        label: 'AND Gate',
        x: 320,
        y: 190,
        rotation: 0,
        ports: COMPONENT_CATALOG.AND.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: {},
      },
      {
        id: 'out_led',
        type: 'LED',
        label: 'Output LED',
        x: 520,
        y: 190,
        rotation: 0,
        ports: COMPONENT_CATALOG.LED.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { color: '#22c55e', label: 'OUT' },
      },
    ];

    const wires: Wire[] = [
      { id: 'w_a', fromCompId: 'sw_a', fromPortId: 'out', toCompId: 'and_gate', toPortId: 'in0', value: 0 },
      { id: 'w_b', fromCompId: 'sw_b', fromPortId: 'out', toCompId: 'and_gate', toPortId: 'in1', value: 0 },
      { id: 'w_out', fromCompId: 'and_gate', fromPortId: 'out', toCompId: 'out_led', toPortId: 'in', value: 0 },
    ];

    const circuit: CircuitData = {
      id: `circuit_and_${Date.now()}`,
      title: '2-Input AND Gate Setup',
      description: 'Two Inputs (A, B) driving an AND gate with an Output LED',
      components,
      wires,
      zoom: 1,
      pan: { x: 0, y: 0 },
    };

    return {
      reply: `### ✅ 2-Input AND Gate Circuit Setup Designed!

Here is the complete digital logic setup for your request:

#### 📋 Component Connections:
1. **Switch A** (Output) &rarr; **AND Gate** (Input 0)
2. **Switch B** (Output) &rarr; **AND Gate** (Input 1)
3. **AND Gate** (Output) &rarr; **Output LED** (Input)

#### 📊 Truth Table:
| Switch A | Switch B | Output LED State |
|:---:|:---:|:---:|
| 0 | 0 | 🌑 0 (OFF) |
| 0 | 1 | 🌑 0 (OFF) |
| 1 | 0 | 🌑 0 (OFF) |
| 1 | 1 | 💡 **1 (ON - High)** |

*Boolean Expression*: **$Y = A \\cdot B$**

Click **"Load to Canvas"** below to load this circuit onto your workspace and toggle the switches!`,
      circuit,
    };
  }

  // 2. OR Gate setup
  if (
    p.includes('or') &&
    !p.includes('xor') &&
    !p.includes('nor') &&
    (p.includes('input') || p.includes('gate') || p.includes('led') || p.includes('switch') || p.includes('setup') || p.includes('design'))
  ) {
    const components: ComponentItem[] = [
      {
        id: 'sw_a',
        type: 'INPUT_SWITCH',
        label: 'Switch A',
        x: 120,
        y: 130,
        rotation: 0,
        ports: COMPONENT_CATALOG.INPUT_SWITCH.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { isOn: true, value: 1 },
      },
      {
        id: 'sw_b',
        type: 'INPUT_SWITCH',
        label: 'Switch B',
        x: 120,
        y: 250,
        rotation: 0,
        ports: COMPONENT_CATALOG.INPUT_SWITCH.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { isOn: false, value: 0 },
      },
      {
        id: 'or_gate',
        type: 'OR',
        label: 'OR Gate',
        x: 320,
        y: 190,
        rotation: 0,
        ports: COMPONENT_CATALOG.OR.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: {},
      },
      {
        id: 'out_led',
        type: 'LED',
        label: 'Output LED',
        x: 520,
        y: 190,
        rotation: 0,
        ports: COMPONENT_CATALOG.LED.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { color: '#3b82f6', label: 'OUT' },
      },
    ];

    const wires: Wire[] = [
      { id: 'w_a', fromCompId: 'sw_a', fromPortId: 'out', toCompId: 'or_gate', toPortId: 'in0', value: 0 },
      { id: 'w_b', fromCompId: 'sw_b', fromPortId: 'out', toCompId: 'or_gate', toPortId: 'in1', value: 0 },
      { id: 'w_out', fromCompId: 'or_gate', fromPortId: 'out', toCompId: 'out_led', toPortId: 'in', value: 0 },
    ];

    const circuit: CircuitData = {
      id: `circuit_or_${Date.now()}`,
      title: '2-Input OR Gate Setup',
      description: 'Two Inputs (A, B) driving an OR gate with an Output LED',
      components,
      wires,
      zoom: 1,
      pan: { x: 0, y: 0 },
    };

    return {
      reply: `### ✅ 2-Input OR Gate Circuit Setup Designed!

An **OR Gate** outputs a HIGH logic (1) when **at least one of the inputs (A or B) is HIGH (1)**.

#### 📋 Component Connections:
1. **Switch A** (Output) &rarr; **OR Gate** (Input 0)
2. **Switch B** (Output) &rarr; **OR Gate** (Input 1)
3. **OR Gate** (Output) &rarr; **Output LED** (Input)

#### 📊 Truth Table:
| Switch A | Switch B | Output LED State |
|:---:|:---:|:---:|
| 0 | 0 | 0 (OFF) |
| 0 | 1 | 💡 **1 (ON)** |
| 1 | 0 | 💡 **1 (ON)** |
| 1 | 1 | 💡 **1 (ON)** |

*Boolean Expression*: **$Y = A + B$**

Click **"Load to Canvas"** below to place it on your workspace!`,
      circuit,
    };
  }

  // 3. XOR Gate setup
  if (p.includes('xor')) {
    const components: ComponentItem[] = [
      {
        id: 'sw_a',
        type: 'INPUT_SWITCH',
        label: 'Switch A',
        x: 120,
        y: 130,
        rotation: 0,
        ports: COMPONENT_CATALOG.INPUT_SWITCH.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { isOn: true, value: 1 },
      },
      {
        id: 'sw_b',
        type: 'INPUT_SWITCH',
        label: 'Switch B',
        x: 120,
        y: 250,
        rotation: 0,
        ports: COMPONENT_CATALOG.INPUT_SWITCH.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { isOn: false, value: 0 },
      },
      {
        id: 'xor_gate',
        type: 'XOR',
        label: 'XOR Gate',
        x: 320,
        y: 190,
        rotation: 0,
        ports: COMPONENT_CATALOG.XOR.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: {},
      },
      {
        id: 'out_led',
        type: 'LED',
        label: 'XOR LED',
        x: 520,
        y: 190,
        rotation: 0,
        ports: COMPONENT_CATALOG.LED.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { color: '#a855f7', label: 'OUT' },
      },
    ];

    const wires: Wire[] = [
      { id: 'w_a', fromCompId: 'sw_a', fromPortId: 'out', toCompId: 'xor_gate', toPortId: 'in0', value: 0 },
      { id: 'w_b', fromCompId: 'sw_b', fromPortId: 'out', toCompId: 'xor_gate', toPortId: 'in1', value: 0 },
      { id: 'w_out', fromCompId: 'xor_gate', fromPortId: 'out', toCompId: 'out_led', toPortId: 'in', value: 0 },
    ];

    return {
      reply: `### ✅ XOR (Exclusive OR) Gate Setup Designed!
An **XOR Gate** outputs HIGH (1) only when the two inputs are **different** ($A \\neq B$).

*Boolean Expression*: **$Y = A \\oplus B = A\\bar{B} + \\bar{A}B$**`,
      circuit: {
        id: `circuit_xor_${Date.now()}`,
        title: '2-Input XOR Gate Setup',
        description: 'Exclusive-OR logic gate with 2 switches and 1 LED',
        components,
        wires,
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
    };
  }

  // 4. Full Adder / Half Adder
  if (p.includes('adder') || p.includes('half adder') || p.includes('full adder')) {
    const components: ComponentItem[] = [
      {
        id: 'sw_a',
        type: 'INPUT_SWITCH',
        label: 'A',
        x: 100,
        y: 120,
        rotation: 0,
        ports: COMPONENT_CATALOG.INPUT_SWITCH.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { isOn: true, value: 1 },
      },
      {
        id: 'sw_b',
        type: 'INPUT_SWITCH',
        label: 'B',
        x: 100,
        y: 220,
        rotation: 0,
        ports: COMPONENT_CATALOG.INPUT_SWITCH.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { isOn: true, value: 1 },
      },
      {
        id: 'xor_gate',
        type: 'XOR',
        label: 'Sum (XOR)',
        x: 280,
        y: 130,
        rotation: 0,
        ports: COMPONENT_CATALOG.XOR.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: {},
      },
      {
        id: 'and_gate',
        type: 'AND',
        label: 'Carry (AND)',
        x: 280,
        y: 250,
        rotation: 0,
        ports: COMPONENT_CATALOG.AND.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: {},
      },
      {
        id: 'led_sum',
        type: 'LED',
        label: 'SUM (S)',
        x: 480,
        y: 130,
        rotation: 0,
        ports: COMPONENT_CATALOG.LED.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { color: '#22c55e' },
      },
      {
        id: 'led_carry',
        type: 'LED',
        label: 'CARRY (C)',
        x: 480,
        y: 250,
        rotation: 0,
        ports: COMPONENT_CATALOG.LED.defaultPorts.map((pt) => ({ ...pt, value: 0 })),
        state: { color: '#ef4444' },
      },
    ];

    const wires: Wire[] = [
      { id: 'w1', fromCompId: 'sw_a', fromPortId: 'out', toCompId: 'xor_gate', toPortId: 'in0', value: 0 },
      { id: 'w2', fromCompId: 'sw_b', fromPortId: 'out', toCompId: 'xor_gate', toPortId: 'in1', value: 0 },
      { id: 'w3', fromCompId: 'sw_a', fromPortId: 'out', toCompId: 'and_gate', toPortId: 'in0', value: 0 },
      { id: 'w4', fromCompId: 'sw_b', fromPortId: 'out', toCompId: 'and_gate', toPortId: 'in1', value: 0 },
      { id: 'w5', fromCompId: 'xor_gate', fromPortId: 'out', toCompId: 'led_sum', toPortId: 'in', value: 0 },
      { id: 'w6', fromCompId: 'and_gate', fromPortId: 'out', toCompId: 'led_carry', toPortId: 'in', value: 0 },
    ];

    return {
      reply: `### ✅ 1-Bit Half Adder Circuit Designed!

A **Half Adder** computes the binary sum of two bits $A$ and $B$:
- **Sum ($S$)** = $A \\oplus B$ (XOR Gate)
- **Carry ($C$)** = $A \\cdot B$ (AND Gate)

#### 📊 Truth Table:
| A | B | Sum ($S$) | Carry ($C$) | Decimal Result |
|:---:|:---:|:---:|:---:|:---:|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 1 | 0 | 1 |
| 1 | 1 | **0** | **1** | **2 (10 in binary)** |

Click **"Load to Canvas"** to simulate it!`,
      circuit: {
        id: `circuit_adder_${Date.now()}`,
        title: '1-Bit Half Adder Circuit',
        description: 'Half adder with XOR (Sum) and AND (Carry)',
        components,
        wires,
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
    };
  }

  // 5. Explain canvas circuit
  if (p.includes('explain') && currentCircuit && currentCircuit.components.length > 0) {
    const compTypes = currentCircuit.components.map((c) => c.label || c.type).join(', ');
    return {
      reply: `### 🔍 Circuit Analysis: "${currentCircuit.title || 'Current Canvas Circuit'}"

- **Total Components**: ${currentCircuit.components.length} (${compTypes})
- **Total Connections**: ${currentCircuit.wires.length} wires

#### How it works:
Your circuit routes signals from inputs through the logic elements and updates the output nodes dynamically. Click on any switch or pulse the clock to observe real-time signal propagation!`,
    };
  }

  return null;
}
