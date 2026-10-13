import { CircuitData } from '../types/circuit';
import { generateTruthTable, generateVerilogHDL } from './circuitEngine';

export interface ExportOptions {
  includeTitle?: boolean;
  includeGrid?: boolean;
  watermark?: boolean;
  backgroundColor?: string;
  dpiMultiplier?: number;
}

// Export SVG Element as formatted SVG File Download
export function downloadSVG(svgElement: SVGSVGElement, filename: string, options: ExportOptions = {}) {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  if (options.includeTitle) {
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', '20');
    titleText.setAttribute('y', '30');
    titleText.setAttribute('fill', '#1E293B');
    titleText.setAttribute('font-size', '18');
    titleText.setAttribute('font-weight', 'bold');
    titleText.textContent = filename.replace('.svg', '');
    clone.insertBefore(titleText, clone.firstChild);
  }

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clone);

  // Add XML declaration
  svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + svgString;

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Render SVG to High-Res PNG Image
export function downloadPNG(svgElement: SVGSVGElement, filename: string, options: ExportOptions = {}) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const scale = options.dpiMultiplier || 2;
    const width = svgElement.clientWidth || 1200;
    const height = svgElement.clientHeight || 800;

    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Background fill
    ctx.fillStyle = options.backgroundColor || '#0F172A'; // dark default
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(img, 0, 0, width, height);

    if (options.watermark) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '14px sans-serif';
      ctx.fillText('Created with CircuitVerse Studio', width - 230, height - 20);
    }

    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  img.src = url;
}

// Download Circuit as JSON project file
export function downloadJSON(circuit: CircuitData, filename: string) {
  const jsonStr = JSON.stringify(circuit, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download Verilog HDL File (.v)
export function downloadVerilog(circuit: CircuitData, filename: string) {
  const verilogCode = generateVerilogHDL(circuit.title, circuit.components, circuit.wires);
  const blob = new Blob([verilogCode], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.v') ? filename : `${filename}.v`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Educational PDF Printable Report
export function downloadPDFReport(circuit: CircuitData, filename: string) {
  const truthTable = generateTruthTable(circuit.components, circuit.wires);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${circuit.title} - Educational Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1E293B; line-height: 1.6; }
    h1 { color: #0F172A; border-bottom: 2px solid #3B82F6; padding-bottom: 8px; margin-bottom: 4px; }
    .meta { color: #64748B; font-size: 14px; margin-bottom: 24px; }
    .section { margin-top: 32px; }
    h2 { font-size: 18px; color: #1E293B; border-left: 4px solid #3B82F6; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #E2E8F0; padding: 8px 12px; text-align: center; font-size: 13px; }
    th { background-color: #F8FAFC; font-weight: 600; color: #334155; }
    .badge-1 { background-color: #DCFCE7; color: #166534; font-weight: bold; padding: 2px 6px; borderRadius: 4px; }
    .badge-0 { background-color: #F1F5F9; color: #475569; padding: 2px 6px; borderRadius: 4px; }
    .footer { margin-top: 60px; font-size: 12px; text-align: center; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>${circuit.title || 'Digital Circuit Diagram'}</h1>
  <div class="meta">Generated by CircuitVerse Studio • Educational Logic Diagram Report • Date: ${new Date().toLocaleDateString()}</div>

  <p><strong>Description:</strong> ${circuit.description || 'Digital logic circuit schematic and truth table analysis.'}</p>

  <div class="section">
    <h2>Circuit Overview</h2>
    <p>Total Components: <strong>${circuit.components.length}</strong> | Total Wire Connections: <strong>${circuit.wires.length}</strong></p>
  </div>

  ${
    truthTable.rows.length > 0
      ? `
  <div class="section">
    <h2>Truth Table Analysis</h2>
    <table>
      <thead>
        <tr>
          ${truthTable.inputNames.map((i) => `<th>Input: ${i}</th>`).join('')}
          ${truthTable.outputNames.map((o) => `<th>Output: ${o}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${truthTable.rows
          .map(
            (r) => `
          <tr>
            ${truthTable.inputNames
              .map((i) => `<td><span class="${r.inputs[i] === 1 ? 'badge-1' : 'badge-0'}">${r.inputs[i]}</span></td>`)
              .join('')}
            ${truthTable.outputNames
              .map((o) => `<td><span class="${r.outputs[o] === 1 ? 'badge-1' : 'badge-0'}">${r.outputs[o]}</span></td>`)
              .join('')}
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  </div>
  `
      : ''
  }

  <div class="footer">CircuitVerse Studio Educational Export • Print or Save as PDF</div>
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
`;

  printWindow.document.write(html);
  printWindow.document.close();
}
