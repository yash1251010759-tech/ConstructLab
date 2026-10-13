export type ComponentCategory =
  | 'inputs'
  | 'outputs'
  | 'gates'
  | 'combinational'
  | 'sequential'
  | 'misc';

export type ComponentType =
  // Inputs
  | 'INPUT_SWITCH'
  | 'PUSH_BUTTON'
  | 'CLOCK'
  | 'CONST_HIGH'
  | 'CONST_LOW'
  | 'HEX_INPUT'
  // Outputs
  | 'LED'
  | 'RGB_LED'
  | '7_SEGMENT'
  | 'HEX_DISPLAY'
  | 'BUZZER'
  // Gates
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'NAND'
  | 'NOR'
  | 'XOR'
  | 'XNOR'
  | 'BUFFER'
  | 'TRI_STATE'
  // Combinational
  | 'MUX_2_1'
  | 'MUX_4_1'
  | 'DEMUX_1_2'
  | 'DECODER_2_4'
  | 'ADDER_4BIT'
  | 'COMPARATOR'
  // Sequential
  | 'D_FLIP_FLOP'
  | 'JK_FLIP_FLOP'
  | 'SR_LATCH'
  | 'T_FLIP_FLOP'
  | 'COUNTER_4BIT'
  // Misc
  | 'WIRE_JUNCTION'
  | 'LABEL_TEXT'
  | 'VCC'
  | 'GND';

export type SignalState = 0 | 1 | 'Z' | 'X'; // 0: Low, 1: High, Z: High Impedance, X: Undefined

export interface Port {
  id: string; // unique port id within component (e.g. 'in0', 'in1', 'out')
  name: string; // user readable label ('A', 'B', 'CLK', 'Q', 'Q_BAR')
  type: 'input' | 'output';
  relX: number; // relative X offset from component origin
  relY: number; // relative Y offset from component origin
  value: SignalState;
  bitWidth?: number; // default 1 bit
}

export interface ComponentItem {
  id: string;
  type: ComponentType;
  label: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  ports: Port[];
  state: {
    isOn?: boolean;
    clockFreqHz?: number;
    clockCounter?: number;
    hexVal?: number;
    color?: string;
    bitWidth?: number;
    inputCount?: number;
    qState?: SignalState;
    qBarState?: SignalState;
    lastClk?: SignalState;
    countValue?: number;
    customText?: string;
    [key: string]: any;
  };
}

export interface Wire {
  id: string;
  fromCompId: string;
  fromPortId: string;
  toCompId: string;
  toPortId: string;
  value: SignalState;
  customColor?: string;
}

export interface CircuitData {
  id: string;
  title: string;
  description: string;
  components: ComponentItem[];
  wires: Wire[];
  zoom: number;
  pan: { x: number; y: number };
}

export interface WaveformSample {
  timestamp: number;
  signals: Record<string, SignalState>; // compId -> value
}

export interface PrebuiltTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  circuit: CircuitData;
}
