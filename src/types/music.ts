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

export type PadColor = 'row1' | 'row2' | 'row3' | 'row4';

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
  color: PadColor;
};

export type KeyBinding = {
  key: string;
  label: string;
};

export type Pad = PadBase & {
  keyBinding: KeyBinding;
};

export type PadDropSource = {
  type: 'library' | 'pad';
  padId?: string;
};

export type PadMode = 'relative' | 'absolute';

export type PadAssignment =
  | {
      type: 'default';
      definitionId: string;
      mode?: PadMode;
      color?: PadColor;
    }
  | {
      type: 'custom';
      baseTonic: Tonic;
      rootNote: Tonic;
      chordTypeId: string;
      bassNote?: Tonic;
      group: PadGroup;
      mode?: PadMode;
      color?: PadColor;
    };

export type PadAssignmentState = {
  [padId: string]: PadAssignment | null;
};

export type ChordLibrarySelection = {
  rootNote: Tonic;
  chordTypeId: string;
  bassNote?: Tonic;
  group: PadGroup;
};

export type PadLayoutConfig = {
  padDefinitions?: PadDefinition[];
  keyBindings?: KeyBinding[];
};
