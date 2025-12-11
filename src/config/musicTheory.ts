// src/config/musicTheory.ts - 音楽理論関連の定数とユーティリティ
import type {
  PadAssignment,
  PadBase,
  PadColor,
  PadDefinition,
  Tonic,
} from '../types/music';

export const NOTE_NAMES_SHARP = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export const NOTE_NAMES_FLAT = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const;

export const TONIC_TO_MIDI4: Record<Tonic, number> = {
  C: 60,
  'C#': 61,
  D: 62,
  'D#': 63,
  E: 64,
  F: 65,
  'F#': 66,
  G: 67,
  'G#': 68,
  A: 69,
  'A#': 70,
  B: 71,
};

export const LOW_TONIC_RANGE: Tonic[] = ['F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CHORD_TYPE_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  '6': [0, 4, 7, 9],
  maj7: [0, 4, 7, 11],
  maj9: [0, 4, 7, 11, 14],
  add9: [0, 4, 7, 14],
  add11: [0, 4, 7, 17],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  aug: [0, 4, 8],
  aug7: [0, 4, 8, 10],
  '7': [0, 4, 7, 10],
  '9': [0, 4, 7, 10, 14],
  '13': [0, 4, 7, 10, 14, 17, 21],
  '7sus4': [0, 5, 7, 10],
  '7b9': [0, 4, 7, 10, 13],
  '7#9': [0, 4, 7, 10, 15],
  m: [0, 3, 7],
  m6: [0, 3, 7, 9],
  m7: [0, 3, 7, 10],
  m9: [0, 3, 7, 10, 14],
  m11: [0, 3, 7, 10, 14, 17],
  mMaj7: [0, 3, 7, 11],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],
};

const CHORD_TYPE_SUFFIX: Record<string, string> = {
  maj: '',
  '6': '6',
  maj7: 'maj7',
  maj9: 'maj9',
  add9: 'add9',
  add11: 'add11',
  sus2: 'sus2',
  sus4: 'sus4',
  aug: 'aug',
  aug7: 'aug7',
  '7': '7',
  '9': '9',
  '13': '13',
  '7sus4': '7sus4',
  '7b9': '7b9',
  '7#9': '7#9',
  m: 'm',
  m6: 'm6',
  m7: 'm7',
  m9: 'm9',
  m11: 'm11',
  mMaj7: 'mMaj7',
  dim: 'dim',
  dim7: 'dim7',
  m7b5: 'm7b5',
};

export const PAD_DEFINITIONS: PadDefinition[] = [
  {
    id: 'pad-01',
    roman: 'I',
    group: 'diatonic',
    rootOffset: 0,
    intervals: [0, 4, 7],
  },
  {
    id: 'pad-02',
    roman: 'II',
    group: 'diatonic',
    rootOffset: 2,
    intervals: [0, 3, 7],
    nameSuffix: 'm',
  },
  {
    id: 'pad-03',
    roman: 'III',
    group: 'diatonic',
    rootOffset: 4,
    intervals: [0, 3, 7],
    nameSuffix: 'm',
  },
  {
    id: 'pad-04',
    roman: 'IV',
    group: 'diatonic',
    rootOffset: 5,
    intervals: [0, 4, 7],
  },
  {
    id: 'pad-05',
    roman: 'V',
    group: 'diatonic',
    rootOffset: 7,
    intervals: [0, 4, 7],
  },
  {
    id: 'pad-06',
    roman: 'VI',
    group: 'diatonic',
    rootOffset: 9,
    intervals: [0, 3, 7],
    nameSuffix: 'm',
  },
  {
    id: 'pad-07',
    roman: 'VII°',
    group: 'diatonic',
    rootOffset: 11,
    intervals: [0, 3, 6],
    nameSuffix: '°',
  },
  {
    id: 'pad-08',
    roman: 'I↑',
    group: 'diatonic',
    rootOffset: 12,
    intervals: [0, 4, 7],
    nameTransform: (root) => `${root}↑`,
  },
  {
    id: 'pad-09',
    roman: 'Imaj7',
    group: 'secondary',
    rootOffset: 0,
    intervals: [0, 4, 7, 11],
    nameSuffix: 'maj7',
  },
  {
    id: 'pad-10',
    roman: 'II7',
    group: 'secondary',
    rootOffset: 2,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-11',
    roman: 'III7',
    group: 'secondary',
    rootOffset: 4,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-12',
    roman: 'IVm',
    group: 'secondary',
    rootOffset: 5,
    intervals: [0, 3, 7],
    nameSuffix: 'm',
  },
  {
    id: 'pad-13',
    roman: 'Vm7',
    group: 'secondary',
    rootOffset: 7,
    intervals: [0, 3, 7, 10],
    nameSuffix: 'm7',
  },
  {
    id: 'pad-14',
    roman: 'VI7',
    group: 'secondary',
    rootOffset: 9,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-15',
    roman: 'bVII',
    group: 'secondary',
    rootOffset: 10,
    intervals: [0, 4, 7],
    accidentalPreference: 'flat',
  },
  {
    id: 'pad-16',
    roman: 'I7',
    group: 'secondary',
    rootOffset: 0,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-17',
    roman: 'IV',
    group: 'subMinor',
    rootOffset: 5,
    intervals: [0, 3, 7],
    nameSuffix: 'm',
  },
  {
    id: 'pad-18',
    roman: 'IV6',
    group: 'subMinor',
    rootOffset: 5,
    intervals: [0, 3, 7, 9],
    nameSuffix: 'm6',
  },
  {
    id: 'pad-19',
    roman: 'bVI',
    group: 'subMinor',
    rootOffset: 8,
    intervals: [0, 4, 7],
    accidentalPreference: 'flat',
  },
  {
    id: 'pad-20',
    roman: 'bVII',
    group: 'subMinor',
    rootOffset: 10,
    intervals: [0, 4, 7],
    accidentalPreference: 'flat',
  },
  {
    id: 'pad-21',
    roman: '#I°',
    group: 'subMinor',
    rootOffset: 1,
    intervals: [0, 3, 6],
    nameSuffix: '°',
    accidentalPreference: 'sharp',
  },
  {
    id: 'pad-22',
    roman: 'II°',
    group: 'subMinor',
    rootOffset: 2,
    intervals: [0, 3, 6],
    nameSuffix: '°',
  },
  {
    id: 'pad-23',
    roman: '#IV°',
    group: 'subMinor',
    rootOffset: 6,
    intervals: [0, 3, 6],
    nameSuffix: '°',
    accidentalPreference: 'sharp',
  },
  {
    id: 'pad-24',
    roman: '#V°',
    group: 'subMinor',
    rootOffset: 8,
    intervals: [0, 3, 6],
    nameSuffix: '°',
    accidentalPreference: 'sharp',
  },
  {
    id: 'pad-25',
    roman: 'Isus4',
    group: 'pop',
    rootOffset: 0,
    intervals: [0, 5, 7],
    nameSuffix: 'sus4',
  },
  {
    id: 'pad-26',
    roman: 'IVsus2',
    group: 'pop',
    rootOffset: 5,
    intervals: [0, 2, 7],
    nameSuffix: 'sus2',
  },
  {
    id: 'pad-27',
    roman: 'Vsus4',
    group: 'pop',
    rootOffset: 7,
    intervals: [0, 5, 7],
    nameSuffix: 'sus4',
  },
  {
    id: 'pad-28',
    roman: 'Imaj7',
    group: 'pop',
    rootOffset: 0,
    intervals: [0, 4, 7, 11],
    nameSuffix: 'maj7',
  },
  {
    id: 'pad-29',
    roman: 'IVmaj7',
    group: 'pop',
    rootOffset: 5,
    intervals: [0, 4, 7, 11],
    nameSuffix: 'maj7',
  },
  {
    id: 'pad-30',
    roman: 'I6',
    group: 'pop',
    rootOffset: 0,
    intervals: [0, 4, 7, 9],
    nameSuffix: '6',
  },
  {
    id: 'pad-31',
    roman: 'Iadd9',
    group: 'pop',
    rootOffset: 0,
    intervals: [0, 4, 7, 14],
    nameSuffix: 'add9',
  },
  {
    id: 'pad-32',
    roman: 'VI(add11)',
    group: 'pop',
    rootOffset: 9,
    intervals: [0, 3, 5, 7],
    nameSuffix: 'm(add11)',
  },
];

export const getNoteLetter = (
  noteIndex: number,
  preference: 'flat' | 'sharp' | 'neutral' = 'neutral'
): string => {
  const normalized = ((noteIndex % 12) + 12) % 12;
  if (preference === 'flat') return NOTE_NAMES_FLAT[normalized];
  if (preference === 'sharp') return NOTE_NAMES_SHARP[normalized];
  const sharpName = NOTE_NAMES_SHARP[normalized];
  if (!sharpName.includes('#')) return sharpName;
  return NOTE_NAMES_FLAT[normalized];
};

export const midiToNoteId = (
  midi: number,
  preference: 'flat' | 'sharp' | 'neutral' = 'neutral'
): string => {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const letter = getNoteLetter(noteIndex, preference);
  return `${letter}${octave}`;
};

export const buildPads = (
  tonic: Tonic,
  options?: { padDefinitions?: PadDefinition[] }
): PadBase[] => {
  const tonicBaseMidi = TONIC_TO_MIDI4[tonic];
  const padDefinitions = options?.padDefinitions ?? PAD_DEFINITIONS;
  const octaveAdjust = LOW_TONIC_RANGE.includes(tonic) ? -12 : 0;
  const tonicMidi = tonicBaseMidi + octaveAdjust;

  return padDefinitions.map((definition) => {
    const rootMidi = tonicMidi + definition.rootOffset;
    const preference = definition.accidentalPreference ?? 'neutral';
    const notes = definition.intervals.map((interval) =>
      midiToNoteId(rootMidi + interval, preference)
    );
    const rootLabel = getNoteLetter(rootMidi, preference);
    const chordName = definition.nameTransform
      ? definition.nameTransform(rootLabel)
      : `${rootLabel}${definition.nameSuffix ?? ''}`;

    return {
      id: definition.id,
      roman: definition.roman,
      group: definition.group,
      chordName,
      notes,
      color: getPadRowColor(definition.id),
    } satisfies PadBase;
  });
};

const getBaseMidiForTonic = (tonic: Tonic) => {
  const base = TONIC_TO_MIDI4[tonic];
  const octaveAdjust = LOW_TONIC_RANGE.includes(tonic) ? -12 : 0;
  return base + octaveAdjust;
};

export const getRelativeSemitoneOffset = (base: Tonic, note: Tonic) => {
  const diff = TONIC_TO_MIDI4[note] - TONIC_TO_MIDI4[base];
  return ((diff % 12) + 12) % 12;
};

const resolveRootMidi = (
  assignment: Extract<PadAssignment, { type: 'custom' }>,
  currentTonic: Tonic
) => {
  const mode = assignment.mode ?? 'relative';
  if (mode === 'absolute') {
    return getBaseMidiForTonic(assignment.rootNote);
  }
  const offset = getRelativeSemitoneOffset(assignment.baseTonic, assignment.rootNote);
  return getBaseMidiForTonic(currentTonic) + offset;
};

const resolveBassMidi = (
  assignment: Extract<PadAssignment, { type: 'custom' }>,
  currentTonic: Tonic
) => {
  if (!assignment.bassNote) return null;
  const mode = assignment.mode ?? 'relative';
  if (mode === 'absolute') {
    return getBaseMidiForTonic(assignment.bassNote) - 12;
  }
  const offset = getRelativeSemitoneOffset(assignment.baseTonic, assignment.bassNote);
  const tonicBase = getBaseMidiForTonic(currentTonic);
  const bassBase = tonicBase - 12;
  return bassBase + offset;
};

export const buildCustomPadFromAssignment = (
  assignment: Extract<PadAssignment, { type: 'custom' }>,
  currentTonic: Tonic,
  padId: string
): PadBase => {
  const rootMidi = resolveRootMidi(assignment, currentTonic);
  const intervals = CHORD_TYPE_INTERVALS[assignment.chordTypeId] ?? CHORD_TYPE_INTERVALS.maj;
  const notes = intervals.map((interval) =>
    midiToNoteId(rootMidi + interval, 'neutral')
  );

  const bassMidi = resolveBassMidi(assignment, currentTonic);
  if (bassMidi !== null) {
    const bassNote = midiToNoteId(bassMidi, 'neutral');
    if (!notes.includes(bassNote)) {
      notes.unshift(bassNote);
    }
  }

  const rootLabel = getNoteLetter(rootMidi, 'neutral');
  const suffix = CHORD_TYPE_SUFFIX[assignment.chordTypeId] ?? assignment.chordTypeId;
  const chordName =
    bassMidi !== null
      ? `${rootLabel}${suffix}/${getNoteLetter(bassMidi, 'neutral')}`
      : `${rootLabel}${suffix}`;

  return {
    id: padId,
    roman: '',
    group: assignment.group,
    chordName,
    notes,
    color: assignment.color ?? getPadRowColor(padId),
  };
};

const ROW_COLORS: PadColor[] = ['row1', 'row2', 'row3', 'row4'];

export const getPadRowColor = (padId: string): PadColor => {
  const index = PAD_DEFINITIONS.findIndex((definition) => definition.id === padId);
  if (index < 0) return 'row1';
  const rowIndex = Math.min(3, Math.floor(index / 8));
  return ROW_COLORS[rowIndex];
};

const OFFSET_TO_ROMAN: Record<number, string> = {
  0: 'I',
  1: 'bII',
  2: 'II',
  3: 'bIII',
  4: 'III',
  5: 'IV',
  6: '#IV',
  7: 'V',
  8: 'bVI',
  9: 'VI',
  10: 'bVII',
  11: 'VII',
};

export const getRomanNumeralForOffset = (offset: number): string => {
  const normalized = ((offset % 12) + 12) % 12;
  return OFFSET_TO_ROMAN[normalized] ?? 'I';
};

export const getRomanNumeralForAssignmentNote = (
  assignment: Extract<PadAssignment, { type: 'custom' }>,
  currentTonic: Tonic,
  note?: Tonic
): string => {
  const mode = assignment.mode ?? 'relative';
  const targetNote = note ?? assignment.rootNote;
  const offset =
    mode === 'relative'
      ? getRelativeSemitoneOffset(assignment.baseTonic, targetNote)
      : getRelativeSemitoneOffset(currentTonic, targetNote);
  return getRomanNumeralForOffset(offset);
};
