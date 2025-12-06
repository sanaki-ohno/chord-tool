// src/config/musicTheory.ts - 音楽理論関連の定数とユーティリティ
import type { PadBase, PadDefinition, Tonic } from '../types/music';

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
    } satisfies PadBase;
  });
};
