import { ComponentItem, ComponentType, Port, SignalState, Wire } from '../types/circuit';

export interface ComponentMeta {
  type: ComponentType;
  name: string;
  category: string;
  description: string;
  width: number;
  height: number;
  defaultPorts: Port[];
  defaultState?: Record<string, any>;
}

export const COMPONENT_CATALOG: Record<ComponentType, ComponentMeta> = {
  // Inputs
  INPUT_SWITCH: {
    type: 'INPUT_SWITCH',
    name: 'Toggle Switch',
    category: 'inputs',
    description: 'Toggle input switch between logic 0 and 1',
    width: 60,
    height: 40,
    defaultPorts: [{ id: 'out', name: 'OUT', type: 'output', relX: 60, relY: 20, value: 0 }],
    defaultState: { isOn: false },
  },
  PUSH_BUTTON: {
    type: 'PUSH_BUTTON',
    name: 'Push Button',
    category: 'inputs',
    description: 'Momentary button (High 1 while pressed)',
    width: 60,
    height: 40,
    defaultPorts: [{ id: 'out', name: 'OUT', type: 'output', relX: 60, relY: 20, value: 0 }],
    defaultState: { isOn: false },
  },
  CLOCK: {
    type: 'CLOCK',
    name: 'Clock Generator',
    category: 'inputs',
    description: 'Generates continuous square wave pulse',
    width: 60,
    height: 40,
    defaultPorts: [{ id: 'out', name: 'CLK', type: 'output', relX: 60, relY: 20, value: 0 }],
    defaultState: { clockFreqHz: 2, clockCounter: 0 },
  },
  CONST_HIGH: {
    type: 'CONST_HIGH',
    name: 'VCC / High (1)',
    category: 'inputs',
    description: 'Constant logic high level (1)',
    width: 50,
    height: 40,
    defaultPorts: [{ id: 'out', name: '1', type: 'output', relX: 50, relY: 20, value: 1 }],
  },
  CONST_LOW: {
    type: 'CONST_LOW',
    name: 'GND / Low (0)',
    category: 'inputs',
    description: 'Constant logic low level (0)',
    width: 50,
    height: 40,
    defaultPorts: [{ id: 'out', name: '0', type: 'output', relX: 50, relY: 20, value: 0 }],
  },
  HEX_INPUT: {
    type: 'HEX_INPUT',
    name: '4-Bit Hex Input',
    category: 'inputs',
    description: '4-bit hexadecimal input dial (0 to F)',
    width: 70,
    height: 70,
    defaultPorts: [
      { id: 'b0', name: 'D0', type: 'output', relX: 70, relY: 15, value: 0 },
      { id: 'b1', name: 'D1', type: 'output', relX: 70, relY: 30, value: 0 },
      { id: 'b2', name: 'D2', type: 'output', relX: 70, relY: 45, value: 0 },
      { id: 'b3', name: 'D3', type: 'output', relX: 70, relY: 60, value: 0 },
    ],
    defaultState: { hexVal: 0 },
  },

  // Outputs
  LED: {
    type: 'LED',
    name: 'LED Light',
    category: 'outputs',
    description: 'Glows brightly when logic level is High (1)',
    width: 50,
    height: 50,
    defaultPorts: [{ id: 'in', name: 'IN', type: 'input', relX: 0, relY: 25, value: 0 }],
    defaultState: { color: '#10B981' }, // emerald green
  },
  RGB_LED: {
    type: 'RGB_LED',
    name: 'RGB LED',
    category: 'outputs',
    description: 'Multi-color LED controlled by Red, Green, Blue inputs',
    width: 60,
    height: 60,
    defaultPorts: [
      { id: 'r', name: 'R', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'g', name: 'G', type: 'input', relX: 0, relY: 30, value: 0 },
      { id: 'b', name: 'B', type: 'input', relX: 0, relY: 45, value: 0 },
    ],
  },
  '7_SEGMENT': {
    type: '7_SEGMENT',
    name: '7-Segment Display',
    category: 'outputs',
    description: '7-segment numeric display (a, b, c, d, e, f, g pins)',
    width: 70,
    height: 100,
    defaultPorts: [
      { id: 'a', name: 'a', type: 'input', relX: 0, relY: 10, value: 0 },
      { id: 'b', name: 'b', type: 'input', relX: 0, relY: 22, value: 0 },
      { id: 'c', name: 'c', type: 'input', relX: 0, relY: 34, value: 0 },
      { id: 'd', name: 'd', type: 'input', relX: 0, relY: 46, value: 0 },
      { id: 'e', name: 'e', type: 'input', relX: 0, relY: 58, value: 0 },
      { id: 'f', name: 'f', type: 'input', relX: 0, relY: 70, value: 0 },
      { id: 'g', name: 'g', type: 'input', relX: 0, relY: 82, value: 0 },
    ],
  },
  HEX_DISPLAY: {
    type: 'HEX_DISPLAY',
    name: 'Hex Digit Display',
    category: 'outputs',
    description: 'Displays 0-F digit from 4-bit binary input',
    width: 70,
    height: 90,
    defaultPorts: [
      { id: 'in0', name: 'D0', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'in1', name: 'D1', type: 'input', relX: 0, relY: 35, value: 0 },
      { id: 'in2', name: 'D2', type: 'input', relX: 0, relY: 55, value: 0 },
      { id: 'in3', name: 'D3', type: 'input', relX: 0, relY: 75, value: 0 },
    ],
  },
  BUZZER: {
    type: 'BUZZER',
    name: 'Buzzer / Audio Indicator',
    category: 'outputs',
    description: 'Sounds tone or visual signal when high',
    width: 50,
    height: 50,
    defaultPorts: [{ id: 'in', name: 'IN', type: 'input', relX: 0, relY: 25, value: 0 }],
  },

  // Gates
  AND: {
    type: 'AND',
    name: 'AND Gate',
    category: 'gates',
    description: 'Output 1 if ALL inputs are 1',
    width: 60,
    height: 50,
    defaultPorts: [
      { id: 'in0', name: 'A', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'in1', name: 'B', type: 'input', relX: 0, relY: 35, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 60, relY: 25, value: 0 },
    ],
  },
  OR: {
    type: 'OR',
    name: 'OR Gate',
    category: 'gates',
    description: 'Output 1 if ANY input is 1',
    width: 60,
    height: 50,
    defaultPorts: [
      { id: 'in0', name: 'A', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'in1', name: 'B', type: 'input', relX: 0, relY: 35, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 60, relY: 25, value: 0 },
    ],
  },
  NOT: {
    type: 'NOT',
    name: 'NOT Inverter',
    category: 'gates',
    description: 'Inverts the input signal (0->1, 1->0)',
    width: 60,
    height: 40,
    defaultPorts: [
      { id: 'in0', name: 'A', type: 'input', relX: 0, relY: 20, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 60, relY: 20, value: 1 },
    ],
  },
  NAND: {
    type: 'NAND',
    name: 'NAND Gate',
    category: 'gates',
    description: 'Inverted AND gate (0 if ALL inputs are 1)',
    width: 65,
    height: 50,
    defaultPorts: [
      { id: 'in0', name: 'A', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'in1', name: 'B', type: 'input', relX: 0, relY: 35, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 65, relY: 25, value: 1 },
    ],
  },
  NOR: {
    type: 'NOR',
    name: 'NOR Gate',
    category: 'gates',
    description: 'Inverted OR gate (1 if ALL inputs are 0)',
    width: 65,
    height: 50,
    defaultPorts: [
      { id: 'in0', name: 'A', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'in1', name: 'B', type: 'input', relX: 0, relY: 35, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 65, relY: 25, value: 1 },
    ],
  },
  XOR: {
    type: 'XOR',
    name: 'XOR Gate',
    category: 'gates',
    description: 'Exclusive OR (Output 1 if inputs are DIFFERENT)',
    width: 60,
    height: 50,
    defaultPorts: [
      { id: 'in0', name: 'A', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'in1', name: 'B', type: 'input', relX: 0, relY: 35, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 60, relY: 25, value: 0 },
    ],
  },
  XNOR: {
    type: 'XNOR',
    name: 'XNOR Gate',
    category: 'gates',
    description: 'Exclusive NOR (Output 1 if inputs are SAME)',
    width: 65,
    height: 50,
    defaultPorts: [
      { id: 'in0', name: 'A', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'in1', name: 'B', type: 'input', relX: 0, relY: 35, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 65, relY: 25, value: 1 },
    ],
  },
  BUFFER: {
    type: 'BUFFER',
    name: 'Buffer',
    category: 'gates',
    description: 'Passes signal unchanged with delay/amplification',
    width: 50,
    height: 40,
    defaultPorts: [
      { id: 'in0', name: 'A', type: 'input', relX: 0, relY: 20, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 50, relY: 20, value: 0 },
    ],
  },
  TRI_STATE: {
    type: 'TRI_STATE',
    name: 'Tri-State Buffer',
    category: 'gates',
    description: 'Passes input if Enable pin is High, else High-Z',
    width: 50,
    height: 50,
    defaultPorts: [
      { id: 'in0', name: 'A', type: 'input', relX: 0, relY: 25, value: 0 },
      { id: 'en', name: 'EN', type: 'input', relX: 25, relY: 50, value: 1 },
      { id: 'out', name: 'Y', type: 'output', relX: 50, relY: 25, value: 'Z' },
    ],
  },

  // Combinational
  MUX_2_1: {
    type: 'MUX_2_1',
    name: '2:1 Multiplexer',
    category: 'combinational',
    description: 'Routes D0 (if SEL=0) or D1 (if SEL=1) to Output',
    width: 60,
    height: 70,
    defaultPorts: [
      { id: 'd0', name: 'I0', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'd1', name: 'I1', type: 'input', relX: 0, relY: 45, value: 0 },
      { id: 'sel', name: 'S', type: 'input', relX: 30, relY: 70, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 60, relY: 30, value: 0 },
    ],
  },
  MUX_4_1: {
    type: 'MUX_4_1',
    name: '4:1 Multiplexer',
    category: 'combinational',
    description: '4-input multiplexer with S0 and S1 select pins',
    width: 70,
    height: 90,
    defaultPorts: [
      { id: 'i0', name: 'I0', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'i1', name: 'I1', type: 'input', relX: 0, relY: 35, value: 0 },
      { id: 'i2', name: 'I2', type: 'input', relX: 0, relY: 55, value: 0 },
      { id: 'i3', name: 'I3', type: 'input', relX: 0, relY: 75, value: 0 },
      { id: 's0', name: 'S0', type: 'input', relX: 20, relY: 90, value: 0 },
      { id: 's1', name: 'S1', type: 'input', relX: 50, relY: 90, value: 0 },
      { id: 'out', name: 'Y', type: 'output', relX: 70, relY: 45, value: 0 },
    ],
  },
  DEMUX_1_2: {
    type: 'DEMUX_1_2',
    name: '1:2 Demultiplexer',
    category: 'combinational',
    description: 'Routes 1 input to Y0 or Y1 based on Select pin',
    width: 60,
    height: 70,
    defaultPorts: [
      { id: 'in', name: 'I', type: 'input', relX: 0, relY: 30, value: 0 },
      { id: 'sel', name: 'S', type: 'input', relX: 30, relY: 70, value: 0 },
      { id: 'y0', name: 'Y0', type: 'output', relX: 60, relY: 15, value: 0 },
      { id: 'y1', name: 'Y1', type: 'output', relX: 60, relY: 45, value: 0 },
    ],
  },
  DECODER_2_4: {
    type: 'DECODER_2_4',
    name: '2-to-4 Decoder',
    category: 'combinational',
    description: 'Decodes 2-bit binary code to 1-of-4 active output',
    width: 80,
    height: 90,
    defaultPorts: [
      { id: 'a0', name: 'A0', type: 'input', relX: 0, relY: 30, value: 0 },
      { id: 'a1', name: 'A1', type: 'input', relX: 0, relY: 60, value: 0 },
      { id: 'y0', name: 'Y0', type: 'output', relX: 80, relY: 15, value: 1 },
      { id: 'y1', name: 'Y1', type: 'output', relX: 80, relY: 35, value: 0 },
      { id: 'y2', name: 'Y2', type: 'output', relX: 80, relY: 55, value: 0 },
      { id: 'y3', name: 'Y3', type: 'output', relX: 80, relY: 75, value: 0 },
    ],
  },
  ADDER_4BIT: {
    type: 'ADDER_4BIT',
    name: '4-Bit Ripple Carry Adder',
    category: 'combinational',
    description: 'Adds two 4-bit numbers A and B plus Carry-In',
    width: 100,
    height: 110,
    defaultPorts: [
      { id: 'a0', name: 'A0', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'a1', name: 'A1', type: 'input', relX: 0, relY: 30, value: 0 },
      { id: 'a2', name: 'A2', type: 'input', relX: 0, relY: 45, value: 0 },
      { id: 'a3', name: 'A3', type: 'input', relX: 0, relY: 60, value: 0 },
      { id: 'b0', name: 'B0', type: 'input', relX: 0, relY: 75, value: 0 },
      { id: 'b1', name: 'B1', type: 'input', relX: 0, relY: 90, value: 0 },
      { id: 'cin', name: 'Cin', type: 'input', relX: 50, relY: 0, value: 0 },
      { id: 's0', name: 'S0', type: 'output', relX: 100, relY: 15, value: 0 },
      { id: 's1', name: 'S1', type: 'output', relX: 100, relY: 30, value: 0 },
      { id: 's2', name: 'S2', type: 'output', relX: 100, relY: 45, value: 0 },
      { id: 's3', name: 'S3', type: 'output', relX: 100, relY: 60, value: 0 },
      { id: 'cout', name: 'Cout', type: 'output', relX: 100, relY: 85, value: 0 },
    ],
  },
  COMPARATOR: {
    type: 'COMPARATOR',
    name: '2-Bit Magnitude Comparator',
    category: 'combinational',
    description: 'Compares inputs A and B (Outputs A>B, A=B, A<B)',
    width: 80,
    height: 80,
    defaultPorts: [
      { id: 'a', name: 'A', type: 'input', relX: 0, relY: 25, value: 0 },
      { id: 'b', name: 'B', type: 'input', relX: 0, relY: 55, value: 0 },
      { id: 'gt', name: 'A>B', type: 'output', relX: 80, relY: 15, value: 0 },
      { id: 'eq', name: 'A=B', type: 'output', relX: 80, relY: 40, value: 1 },
      { id: 'lt', name: 'A<B', type: 'output', relX: 80, relY: 65, value: 0 },
    ],
  },

  // Sequential
  D_FLIP_FLOP: {
    type: 'D_FLIP_FLOP',
    name: 'D Flip-Flop',
    category: 'sequential',
    description: 'Data Flip-Flop (captures D on rising edge of CLK)',
    width: 70,
    height: 70,
    defaultPorts: [
      { id: 'd', name: 'D', type: 'input', relX: 0, relY: 20, value: 0 },
      { id: 'clk', name: 'CLK', type: 'input', relX: 0, relY: 50, value: 0 },
      { id: 'q', name: 'Q', type: 'output', relX: 70, relY: 20, value: 0 },
      { id: 'qbar', name: 'Q̄', type: 'output', relX: 70, relY: 50, value: 1 },
    ],
    defaultState: { qState: 0, qBarState: 1, lastClk: 0 },
  },
  JK_FLIP_FLOP: {
    type: 'JK_FLIP_FLOP',
    name: 'JK Flip-Flop',
    category: 'sequential',
    description: 'Universal JK Flip-Flop with toggle mode when J=1, K=1',
    width: 70,
    height: 80,
    defaultPorts: [
      { id: 'j', name: 'J', type: 'input', relX: 0, relY: 15, value: 0 },
      { id: 'clk', name: 'CLK', type: 'input', relX: 0, relY: 40, value: 0 },
      { id: 'k', name: 'K', type: 'input', relX: 0, relY: 65, value: 0 },
      { id: 'q', name: 'Q', type: 'output', relX: 70, relY: 20, value: 0 },
      { id: 'qbar', name: 'Q̄', type: 'output', relX: 70, relY: 60, value: 1 },
    ],
    defaultState: { qState: 0, qBarState: 1, lastClk: 0 },
  },
  SR_LATCH: {
    type: 'SR_LATCH',
    name: 'SR Latch',
    category: 'sequential',
    description: 'Set-Reset Latch (S=1 Sets Q=1, R=1 Resets Q=0)',
    width: 70,
    height: 70,
    defaultPorts: [
      { id: 's', name: 'S', type: 'input', relX: 0, relY: 20, value: 0 },
      { id: 'r', name: 'R', type: 'input', relX: 0, relY: 50, value: 0 },
      { id: 'q', name: 'Q', type: 'output', relX: 70, relY: 20, value: 0 },
      { id: 'qbar', name: 'Q̄', type: 'output', relX: 70, relY: 50, value: 1 },
    ],
    defaultState: { qState: 0, qBarState: 1 },
  },
  T_FLIP_FLOP: {
    type: 'T_FLIP_FLOP',
    name: 'T (Toggle) Flip-Flop',
    category: 'sequential',
    description: 'Toggles output state Q when T=1 on Clock edge',
    width: 70,
    height: 70,
    defaultPorts: [
      { id: 't', name: 'T', type: 'input', relX: 0, relY: 20, value: 0 },
      { id: 'clk', name: 'CLK', type: 'input', relX: 0, relY: 50, value: 0 },
      { id: 'q', name: 'Q', type: 'output', relX: 70, relY: 20, value: 0 },
      { id: 'qbar', name: 'Q̄', type: 'output', relX: 70, relY: 50, value: 1 },
    ],
    defaultState: { qState: 0, qBarState: 1, lastClk: 0 },
  },
  COUNTER_4BIT: {
    type: 'COUNTER_4BIT',
    name: '4-Bit Binary Counter',
    category: 'sequential',
    description: 'Counts 0..15 on rising clock pulses with Reset pin',
    width: 80,
    height: 90,
    defaultPorts: [
      { id: 'clk', name: 'CLK', type: 'input', relX: 0, relY: 25, value: 0 },
      { id: 'rst', name: 'RST', type: 'input', relX: 0, relY: 65, value: 0 },
      { id: 'q0', name: 'Q0', type: 'output', relX: 80, relY: 15, value: 0 },
      { id: 'q1', name: 'Q1', type: 'output', relX: 80, relY: 35, value: 0 },
      { id: 'q2', name: 'Q2', type: 'output', relX: 80, relY: 55, value: 0 },
      { id: 'q3', name: 'Q3', type: 'output', relX: 80, relY: 75, value: 0 },
    ],
    defaultState: { countValue: 0, lastClk: 0 },
  },

  // Misc
  WIRE_JUNCTION: {
    type: 'WIRE_JUNCTION',
    name: 'Wire Junction',
    category: 'misc',
    description: '4-way wire node junction point',
    width: 20,
    height: 20,
    defaultPorts: [
      { id: 'p0', name: 'P0', type: 'input', relX: 0, relY: 10, value: 0 },
      { id: 'p1', name: 'P1', type: 'output', relX: 20, relY: 10, value: 0 },
      { id: 'p2', name: 'P2', type: 'output', relX: 10, relY: 0, value: 0 },
      { id: 'p3', name: 'P3', type: 'output', relX: 10, relY: 20, value: 0 },
    ],
  },
  LABEL_TEXT: {
    type: 'LABEL_TEXT',
    name: 'Text Annotation',
    category: 'misc',
    description: 'Add custom educational label text or diagram notes',
    width: 100,
    height: 30,
    defaultPorts: [],
    defaultState: { customText: 'Label Text' },
  },
  VCC: {
    type: 'VCC',
    name: 'VCC Supply',
    category: 'misc',
    description: 'Power Rail High (1)',
    width: 30,
    height: 30,
    defaultPorts: [{ id: 'out', name: '+V', type: 'output', relX: 15, relY: 30, value: 1 }],
  },
  GND: {
    type: 'GND',
    name: 'GND Ground',
    category: 'misc',
    description: 'Ground Reference Low (0)',
    width: 30,
    height: 30,
    defaultPorts: [{ id: 'out', name: 'GND', type: 'output', relX: 15, relY: 0, value: 0 }],
  },
};

// Create a component item instance from Catalog metadata
export function createComponentInstance(
  type: ComponentType,
  x: number,
  y: number,
  idOverride?: string
): ComponentItem {
  const meta = COMPONENT_CATALOG[type];
  const id = idOverride || `comp_${type.toLowerCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  return {
    id,
    type,
    label: meta.name,
    x,
    y,
    rotation: 0,
    ports: meta.defaultPorts.map((p) => ({ ...p, value: p.value ?? 0 })),
    state: { ...(meta.defaultState || {}) },
  };
}

// SIMULATION ENGINE FUNCTION
export function evaluateCircuit(
  components: ComponentItem[],
  wires: Wire[],
  tickCount: number
): { components: ComponentItem[]; wires: Wire[] } {
  // Deep clone components to prevent mutation state bugs
  const compsMap = new Map<string, ComponentItem>();
  components.forEach((c) => {
    compsMap.set(c.id, JSON.parse(JSON.stringify(c)));
  });

  const wiresClone: Wire[] = JSON.parse(JSON.stringify(wires));

  // Iterative propagation solver (up to 10 iterations to settle logic loops)
  const maxIterations = 10;
  for (let iter = 0; iter < maxIterations; iter++) {
    // 1. Evaluate Output ports of all components based on their type & internal state
    compsMap.forEach((comp) => {
      evaluateComponentOutputs(comp, tickCount);
    });

    // 2. Propagate values across wires from source ports to target ports
    let stateChanged = false;

    wiresClone.forEach((wire) => {
      const sourceComp = compsMap.get(wire.fromCompId);
      const destComp = compsMap.get(wire.toCompId);

      if (sourceComp && destComp) {
        const sourcePort = sourceComp.ports.find((p) => p.id === wire.fromPortId);
        const destPort = destComp.ports.find((p) => p.id === wire.toPortId);

        if (sourcePort && destPort) {
          const val = sourcePort.value;
          wire.value = val;
          if (destPort.value !== val) {
            destPort.value = val;
            stateChanged = true;
          }
        }
      }
    });

    if (!stateChanged && iter > 0) {
      break; // Network settled
    }
  }

  return {
    components: Array.from(compsMap.values()),
    wires: wiresClone,
  };
}

function evaluateComponentOutputs(comp: ComponentItem, tickCount: number) {
  const getPortVal = (id: string): SignalState => {
    const p = comp.ports.find((pt) => pt.id === id);
    return p ? p.value : 0;
  };

  const setPortVal = (id: string, val: SignalState) => {
    const p = comp.ports.find((pt) => pt.id === id);
    if (p) {
      p.value = val;
    }
  };

  const toNum = (s: SignalState): number => (s === 1 ? 1 : 0);

  switch (comp.type) {
    case 'INPUT_SWITCH':
      setPortVal('out', comp.state.isOn ? 1 : 0);
      break;

    case 'PUSH_BUTTON':
      setPortVal('out', comp.state.isOn ? 1 : 0);
      break;

    case 'CLOCK':
      // Toggle signal based on tick count or frequency
      const freq = comp.state.clockFreqHz || 2;
      const periodInTicks = Math.max(1, Math.floor(10 / freq));
      const clkVal = Math.floor(tickCount / periodInTicks) % 2 === 0 ? 1 : 0;
      setPortVal('out', clkVal);
      break;

    case 'CONST_HIGH':
    case 'VCC':
      setPortVal('out', 1);
      break;

    case 'CONST_LOW':
    case 'GND':
      setPortVal('out', 0);
      break;

    case 'HEX_INPUT':
      const hVal = comp.state.hexVal || 0;
      setPortVal('b0', (hVal & 1) ? 1 : 0);
      setPortVal('b1', (hVal & 2) ? 1 : 0);
      setPortVal('b2', (hVal & 4) ? 1 : 0);
      setPortVal('b3', (hVal & 8) ? 1 : 0);
      break;

    // GATES
    case 'AND': {
      const a = toNum(getPortVal('in0'));
      const b = toNum(getPortVal('in1'));
      setPortVal('out', (a && b) ? 1 : 0);
      break;
    }
    case 'OR': {
      const a = toNum(getPortVal('in0'));
      const b = toNum(getPortVal('in1'));
      setPortVal('out', (a || b) ? 1 : 0);
      break;
    }
    case 'NOT': {
      const a = toNum(getPortVal('in0'));
      setPortVal('out', a ? 0 : 1);
      break;
    }
    case 'NAND': {
      const a = toNum(getPortVal('in0'));
      const b = toNum(getPortVal('in1'));
      setPortVal('out', !(a && b) ? 1 : 0);
      break;
    }
    case 'NOR': {
      const a = toNum(getPortVal('in0'));
      const b = toNum(getPortVal('in1'));
      setPortVal('out', !(a || b) ? 1 : 0);
      break;
    }
    case 'XOR': {
      const a = toNum(getPortVal('in0'));
      const b = toNum(getPortVal('in1'));
      setPortVal('out', (a ^ b) ? 1 : 0);
      break;
    }
    case 'XNOR': {
      const a = toNum(getPortVal('in0'));
      const b = toNum(getPortVal('in1'));
      setPortVal('out', (a ^ b) ? 0 : 1);
      break;
    }
    case 'BUFFER': {
      setPortVal('out', getPortVal('in0'));
      break;
    }
    case 'TRI_STATE': {
      const en = getPortVal('en');
      if (en === 1) {
        setPortVal('out', getPortVal('in0'));
      } else {
        setPortVal('out', 'Z');
      }
      break;
    }

    // COMBINATIONAL
    case 'MUX_2_1': {
      const s = getPortVal('sel');
      setPortVal('out', s === 1 ? getPortVal('d1') : getPortVal('d0'));
      break;
    }
    case 'MUX_4_1': {
      const s0 = toNum(getPortVal('s0'));
      const s1 = toNum(getPortVal('s1'));
      const sel = (s1 << 1) | s0;
      const inputs = [getPortVal('i0'), getPortVal('i1'), getPortVal('i2'), getPortVal('i3')];
      setPortVal('out', inputs[sel]);
      break;
    }
    case 'DEMUX_1_2': {
      const inVal = getPortVal('in');
      const s = getPortVal('sel');
      setPortVal('y0', s === 0 ? inVal : 0);
      setPortVal('y1', s === 1 ? inVal : 0);
      break;
    }
    case 'DECODER_2_4': {
      const a0 = toNum(getPortVal('a0'));
      const a1 = toNum(getPortVal('a1'));
      const code = (a1 << 1) | a0;
      setPortVal('y0', code === 0 ? 1 : 0);
      setPortVal('y1', code === 1 ? 1 : 0);
      setPortVal('y2', code === 2 ? 1 : 0);
      setPortVal('y3', code === 3 ? 1 : 0);
      break;
    }
    case 'ADDER_4BIT': {
      const a = toNum(getPortVal('a0')) | (toNum(getPortVal('a1')) << 1) | (toNum(getPortVal('a2')) << 2) | (toNum(getPortVal('a3')) << 3);
      const b = toNum(getPortVal('b0')) | (toNum(getPortVal('b1')) << 1) | (toNum(getPortVal('b2')) << 2) | (toNum(getPortVal('b3')) << 3);
      const cin = toNum(getPortVal('cin'));
      const sum = a + b + cin;
      setPortVal('s0', (sum & 1) ? 1 : 0);
      setPortVal('s1', (sum & 2) ? 1 : 0);
      setPortVal('s2', (sum & 4) ? 1 : 0);
      setPortVal('s3', (sum & 8) ? 1 : 0);
      setPortVal('cout', (sum & 16) ? 1 : 0);
      break;
    }
    case 'COMPARATOR': {
      const a = toNum(getPortVal('a'));
      const b = toNum(getPortVal('b'));
      setPortVal('gt', a > b ? 1 : 0);
      setPortVal('eq', a === b ? 1 : 0);
      setPortVal('lt', a < b ? 1 : 0);
      break;
    }

    // SEQUENTIAL
    case 'D_FLIP_FLOP': {
      const currentClk = getPortVal('clk');
      const lastClk = comp.state.lastClk || 0;
      let q = comp.state.qState ?? 0;

      // Detect rising edge (0 -> 1)
      if (lastClk === 0 && currentClk === 1) {
        q = getPortVal('d');
        comp.state.qState = q;
        comp.state.qBarState = q === 1 ? 0 : 1;
      }
      comp.state.lastClk = currentClk;
      setPortVal('q', q);
      setPortVal('qbar', q === 1 ? 0 : 1);
      break;
    }
    case 'JK_FLIP_FLOP': {
      const currentClk = getPortVal('clk');
      const lastClk = comp.state.lastClk || 0;
      let q = comp.state.qState ?? 0;

      if (lastClk === 0 && currentClk === 1) {
        const j = toNum(getPortVal('j'));
        const k = toNum(getPortVal('k'));
        if (j === 0 && k === 0) {
          // No change
        } else if (j === 1 && k === 0) {
          q = 1;
        } else if (j === 0 && k === 1) {
          q = 0;
        } else if (j === 1 && k === 1) {
          q = q === 1 ? 0 : 1; // Toggle
        }
        comp.state.qState = q;
        comp.state.qBarState = q === 1 ? 0 : 1;
      }
      comp.state.lastClk = currentClk;
      setPortVal('q', q);
      setPortVal('qbar', q === 1 ? 0 : 1);
      break;
    }
    case 'SR_LATCH': {
      const s = toNum(getPortVal('s'));
      const r = toNum(getPortVal('r'));
      let q = comp.state.qState ?? 0;
      if (s === 1 && r === 0) {
        q = 1;
      } else if (s === 0 && r === 1) {
        q = 0;
      } else if (s === 1 && r === 1) {
        // Invalid state in SR latch
        q = 'X';
      }
      comp.state.qState = q;
      setPortVal('q', q);
      setPortVal('qbar', q === 1 ? 0 : 1);
      break;
    }
    case 'T_FLIP_FLOP': {
      const currentClk = getPortVal('clk');
      const lastClk = comp.state.lastClk || 0;
      let q = comp.state.qState ?? 0;

      if (lastClk === 0 && currentClk === 1) {
        const t = toNum(getPortVal('t'));
        if (t === 1) {
          q = q === 1 ? 0 : 1;
        }
        comp.state.qState = q;
      }
      comp.state.lastClk = currentClk;
      setPortVal('q', q);
      setPortVal('qbar', q === 1 ? 0 : 1);
      break;
    }
    case 'COUNTER_4BIT': {
      const currentClk = getPortVal('clk');
      const rst = toNum(getPortVal('rst'));
      const lastClk = comp.state.lastClk || 0;
      let count = comp.state.countValue ?? 0;

      if (rst === 1) {
        count = 0;
      } else if (lastClk === 0 && currentClk === 1) {
        count = (count + 1) % 16;
      }
      comp.state.countValue = count;
      comp.state.lastClk = currentClk;

      setPortVal('q0', (count & 1) ? 1 : 0);
      setPortVal('q1', (count & 2) ? 1 : 0);
      setPortVal('q2', (count & 4) ? 1 : 0);
      setPortVal('q3', (count & 8) ? 1 : 0);
      break;
    }

    case 'WIRE_JUNCTION': {
      // Junction passes input to all output ports
      const val = getPortVal('p0');
      setPortVal('p1', val);
      setPortVal('p2', val);
      setPortVal('p3', val);
      break;
    }
  }
}

// AUTOMATIC TRUTH TABLE GENERATOR
export interface TruthTableRow {
  inputs: Record<string, number>;
  outputs: Record<string, SignalState>;
}

export function generateTruthTable(
  components: ComponentItem[],
  wires: Wire[]
): {
  inputNames: string[];
  outputNames: string[];
  rows: TruthTableRow[];
} {
  const inputComps = components.filter((c) =>
    ['INPUT_SWITCH', 'PUSH_BUTTON', 'CONST_HIGH', 'CONST_LOW'].includes(c.type)
  );
  const outputComps = components.filter((c) =>
    ['LED', 'BUZZER', '7_SEGMENT', 'HEX_DISPLAY'].includes(c.type)
  );

  const inputNames = inputComps.map((c) => c.label || c.id);
  const outputNames = outputComps.map((c) => c.label || c.id);

  if (inputComps.length === 0 || outputComps.length === 0) {
    return { inputNames: [], outputNames: [], rows: [] };
  }

  // Cap at 8 inputs for performance (256 combinations)
  const n = Math.min(inputComps.length, 8);
  const totalRows = Math.pow(2, n);
  const rows: TruthTableRow[] = [];

  for (let i = 0; i < totalRows; i++) {
    // Clone components for sandbox evaluation
    const testComps: ComponentItem[] = JSON.parse(JSON.stringify(components));
    const testWires: Wire[] = JSON.parse(JSON.stringify(wires));

    const inputVals: Record<string, number> = {};

    // Set binary values for each input component
    inputComps.slice(0, n).forEach((inp, idx) => {
      const bit = (i >> (n - 1 - idx)) & 1;
      const target = testComps.find((c) => c.id === inp.id);
      if (target) {
        target.state.isOn = bit === 1;
        if (target.ports[0]) target.ports[0].value = bit as SignalState;
      }
      inputVals[inp.label || inp.id] = bit;
    });

    // Evaluate circuit multiple ticks until stable
    let evaluated = { components: testComps, wires: testWires };
    for (let tick = 0; tick < 5; tick++) {
      evaluated = evaluateCircuit(evaluated.components, evaluated.wires, tick);
    }

    // Read outputs
    const outputVals: Record<string, SignalState> = {};
    outputComps.forEach((outC) => {
      const evaluatedComp = evaluated.components.find((c) => c.id === outC.id);
      if (evaluatedComp && evaluatedComp.ports[0]) {
        outputVals[outC.label || outC.id] = evaluatedComp.ports[0].value;
      } else {
        outputVals[outC.label || outC.id] = 0;
      }
    });

    rows.push({
      inputs: inputVals,
      outputs: outputVals,
    });
  }

  return { inputNames, outputNames, rows };
}

// VERILOG HDL CODE GENERATOR
export function generateVerilogHDL(
  title: string,
  components: ComponentItem[],
  wires: Wire[]
): string {
  const moduleName = (title || 'digital_circuit').toLowerCase().replace(/[^a-z0-9_]/g, '_');

  const inputComps = components.filter((c) =>
    ['INPUT_SWITCH', 'PUSH_BUTTON', 'CLOCK', 'CONST_HIGH', 'CONST_LOW'].includes(c.type)
  );
  const outputComps = components.filter((c) =>
    ['LED', 'BUZZER'].includes(c.type)
  );

  const inputs = inputComps.map((c) => (c.label || c.id).replace(/[^a-zA-Z0-9_]/g, '_'));
  const outputs = outputComps.map((c) => (c.label || c.id).replace(/[^a-zA-Z0-9_]/g, '_'));

  let verilog = `// Auto-generated Verilog HDL Module by CircuitVerse Studio\n`;
  verilog += `// Circuit Title: ${title || 'Digital Circuit'}\n\n`;
  verilog += `module ${moduleName} (\n`;

  const portsList = [...inputs.map((i) => `  input wire ${i}`), ...outputs.map((o) => `  output wire ${o}`)];
  verilog += portsList.join(',\n') + '\n);\n\n';

  // Internal wire declarations
  const internalWires = new Set<string>();
  wires.forEach((w) => {
    internalWires.add(`wire w_${w.id.replace(/[^a-zA-Z0-9_]/g, '_')};`);
  });

  if (internalWires.size > 0) {
    verilog += `  // Internal wire connections\n  ` + Array.from(internalWires).join('\n  ') + '\n\n';
  }

  verilog += `  // Gate instantiations\n`;
  components.forEach((c) => {
    const instanceName = `${c.type.toLowerCase()}_${c.id.substring(0, 6)}`;
    const compLabel = (c.label || c.id).replace(/[^a-zA-Z0-9_]/g, '_');

    if (['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].includes(c.type)) {
      verilog += `  ${c.type.toLowerCase()} ${instanceName} (${compLabel}_out, ${compLabel}_in0, ${compLabel}_in1);\n`;
    } else if (c.type === 'NOT') {
      verilog += `  not ${instanceName} (${compLabel}_out, ${compLabel}_in0);\n`;
    }
  });

  verilog += `\nendmodule\n`;
  return verilog;
}
