// src/types/music.ts - 音階/楽器/パッドに関する型定義
export type Tonic =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B';

export type InstrumentId = 'piano' | 'epiano' | 'synth' | 'violin' | 'guitar';

export type InstrumentOption = {
  id: InstrumentId;
  label: string;
};

export type KeyOption = {
  id: Tonic;
  label: string;
};

export type PadGroup = 'diatonic' | 'secondary' | 'subMinor' | 'pop';

export type PadDefinition = {
  id: string;
  roman: string;
  group: PadGroup;
  rootOffset: number;
  intervals: number[];
  nameSuffix?: string;
  accidentalPreference?: 'flat' | 'sharp';
  nameTransform?: (root: string) => string;
};

export type PadBase = {
  id: string;
  roman: string;
  group: PadGroup;
  chordName: string;
  notes: string[];
};

export type KeyBinding = {
  key: string;
  label: string;
};

export type Pad = PadBase & {
  keyBinding: KeyBinding;
};

export type PadLayoutConfig = {
  padDefinitions?: PadDefinition[];
  keyBindings?: KeyBinding[];
};
