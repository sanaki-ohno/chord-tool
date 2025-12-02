// src/App.tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import * as Tone from 'tone';
import './App.css';

type Tonic =
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

type InstrumentId = 'piano' | 'epiano' | 'synth' | 'violin' | 'guitar';

type InstrumentOption = {
  id: InstrumentId;
  label: string;
};

type KeyOption = {
  id: Tonic;
  label: string;
};

type PadGroup = 'diatonic' | 'secondary' | 'subMinor' | 'pop';

type PadDefinition = {
  id: string;
  roman: string;
  group: PadGroup;
  rootOffset: number;
  intervals: number[];
  nameSuffix?: string;
  accidentalPreference?: 'flat' | 'sharp';
  nameTransform?: (root: string) => string;
};

type PadBase = {
  id: string;
  roman: string;
  group: PadGroup;
  chordName: string;
  notes: string[];
};

type Pad = PadBase & {
  keyBinding: KeyBinding;
};

type KeyBinding = {
  key: string;
  label: string;
};

const TONE_INSTRUMENTS: InstrumentOption[] = [
  { id: 'piano', label: 'Piano' },
  { id: 'epiano', label: 'E.Piano' },
  { id: 'synth', label: 'Synth' },
  { id: 'violin', label: 'Violin' },
  { id: 'guitar', label: 'Guitar' },
];

const KEY_OPTIONS: KeyOption[] = [
  { id: 'F#', label: 'F#' },
  { id: 'G', label: 'G' },
  { id: 'G#', label: 'G#' },
  { id: 'A', label: 'A' },
  { id: 'A#', label: 'A#' },
  { id: 'B', label: 'B' },
  { id: 'C', label: 'C' },
  { id: 'C#', label: 'C#' },
  { id: 'D', label: 'D' },
  { id: 'D#', label: 'D#' },
  { id: 'E', label: 'E' },
  { id: 'F', label: 'F' },
];

const KEY_BINDINGS: KeyBinding[] = [
  { key: '1', label: '1' },
  { key: '2', label: '2' },
  { key: '3', label: '3' },
  { key: '4', label: '4' },
  { key: '5', label: '5' },
  { key: '6', label: '6' },
  { key: '7', label: '7' },
  { key: '8', label: '8' },
  { key: 'q', label: 'Q' },
  { key: 'w', label: 'W' },
  { key: 'e', label: 'E' },
  { key: 'r', label: 'R' },
  { key: 't', label: 'T' },
  { key: 'y', label: 'Y' },
  { key: 'u', label: 'U' },
  { key: 'i', label: 'I' },
  { key: 'a', label: 'A' },
  { key: 's', label: 'S' },
  { key: 'd', label: 'D' },
  { key: 'f', label: 'F' },
  { key: 'g', label: 'G' },
  { key: 'h', label: 'H' },
  { key: 'j', label: 'J' },
  { key: 'k', label: 'K' },
  { key: 'z', label: 'Z' },
  { key: 'x', label: 'X' },
  { key: 'c', label: 'C' },
  { key: 'v', label: 'V' },
  { key: 'b', label: 'B' },
  { key: 'n', label: 'N' },
  { key: 'm', label: 'M' },
  { key: ',', label: ',' },
];

const NOTE_NAMES_SHARP = [
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
];
const NOTE_NAMES_FLAT = [
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
];

const TONIC_TO_MIDI4: Record<Tonic, number> = {
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

const PAD_DEFINITIONS: PadDefinition[] = [
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
    roman: 'V7',
    group: 'secondary',
    rootOffset: 7,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-10',
    roman: 'V/II',
    group: 'secondary',
    rootOffset: 9,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-11',
    roman: 'V/III',
    group: 'secondary',
    rootOffset: 11,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-12',
    roman: 'V/IV',
    group: 'secondary',
    rootOffset: 0,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-13',
    roman: 'V/V',
    group: 'secondary',
    rootOffset: 2,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-14',
    roman: 'V/VI',
    group: 'secondary',
    rootOffset: 4,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7',
  },
  {
    id: 'pad-15',
    roman: 'V/III(alt)',
    group: 'secondary',
    rootOffset: 11,
    intervals: [0, 4, 7, 10],
    nameSuffix: '7alt',
  },
  {
    id: 'pad-16',
    roman: 'V9',
    group: 'secondary',
    rootOffset: 7,
    intervals: [0, 4, 7, 10, 14],
    nameSuffix: '9',
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

const getNoteLetter = (
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

const midiToNoteId = (
  midi: number,
  preference: 'flat' | 'sharp' | 'neutral' = 'neutral'
): string => {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const letter = getNoteLetter(noteIndex, preference);
  return `${letter}${octave}`;
};

const LOW_TONIC_RANGE: Tonic[] = ['F#', 'G', 'G#', 'A', 'A#', 'B'];

const buildPads = (tonic: Tonic): PadBase[] => {
  const tonicBaseMidi = TONIC_TO_MIDI4[tonic];
  const octaveAdjust = LOW_TONIC_RANGE.includes(tonic) ? -12 : 0;
  const tonicMidi = tonicBaseMidi + octaveAdjust;
  return PAD_DEFINITIONS.map((definition) => {
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
    };
  });
};

const createInstrument = (instrument: InstrumentId): Tone.PolySynth => {
  switch (instrument) {
    case 'violin':
      return new Tone.PolySynth(Tone.Synth, {
        volume: -9,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.12, decay: 0.3, sustain: 0.8, release: 1.6 },
      }).toDestination();
    case 'guitar':
      return new Tone.PolySynth(Tone.Synth, {
        volume: -8,
        oscillator: { type: 'square' },
        envelope: { attack: 0.008, decay: 0.25, sustain: 0.4, release: 0.9 },
      }).toDestination();
    case 'epiano':
      return new Tone.PolySynth(Tone.Synth, {
        volume: -10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.7, release: 1.2 },
      }).toDestination();
    case 'synth':
      return new Tone.PolySynth(Tone.Synth, {
        volume: -6,
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0.5, release: 0.3 },
      }).toDestination();
    case 'piano':
    default:
      return new Tone.PolySynth(Tone.Synth, {
        volume: -8,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.6 },
      }).toDestination();
  }
};

function App() {
  const [tonic, setTonic] = useState<Tonic>('C');
  const [instrument, setInstrument] = useState<InstrumentId>('piano');
  const [activePadIds, setActivePadIds] = useState<string[]>([]);
  const pads = useMemo(() => {
    const basePads = buildPads(tonic);
    if (basePads.length !== KEY_BINDINGS.length) {
      console.warn('Pad and key binding count mismatch.');
    }
    return basePads.map((pad, index) => ({
      ...pad,
      keyBinding: KEY_BINDINGS[index] ?? { key: pad.id, label: pad.id },
    }));
  }, [tonic]);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const audioStartedRef = useRef(false);
  const heldPadsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const synth = createInstrument(instrument);
    synthRef.current = synth;
    return () => {
      synth.dispose();
      synthRef.current = null;
    };
  }, [instrument]);

  useEffect(() => {
    heldPadsRef.current = {};
    setActivePadIds([]);
  }, [tonic, instrument]);

  const startAudioContext = useCallback(async () => {
    if (audioStartedRef.current) return;
    await Tone.start();
    audioStartedRef.current = true;
  }, []);

  const handlePadPress = useCallback(
    async (pad: Pad) => {
      const synth = synthRef.current;
      if (!synth || heldPadsRef.current[pad.id]) return;

      await startAudioContext();

      pad.notes.forEach((note) => synth.triggerAttack(note, Tone.now()));
      heldPadsRef.current[pad.id] = true;
      setActivePadIds((prev) =>
        prev.includes(pad.id) ? prev : [...prev, pad.id]
      );
    },
    [startAudioContext]
  );

  const handlePadRelease = useCallback((pad: Pad) => {
    const synth = synthRef.current;
    if (!synth || !heldPadsRef.current[pad.id]) return;

    pad.notes.forEach((note) => synth.triggerRelease(note, Tone.now()));
    delete heldPadsRef.current[pad.id];
    setActivePadIds((prev) => prev.filter((id) => id !== pad.id));
  }, []);

  const handlePointerDown = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>,
    pad: Pad
  ) => {
    event.preventDefault();
    void handlePadPress(pad);
  };

  const handlePointerUp = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>,
    pad: Pad
  ) => {
    event.preventDefault();
    handlePadRelease(pad);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const pad = pads.find((item) => item.keyBinding.key === pressedKey);
      if (!pad) return;
      event.preventDefault();
      void handlePadPress(pad);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const releasedKey =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const pad = pads.find((item) => item.keyBinding.key === releasedKey);
      if (!pad) return;
      event.preventDefault();
      handlePadRelease(pad);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pads, handlePadPress, handlePadRelease]);

  const activeInstrumentLabel =
    TONE_INSTRUMENTS.find((option) => option.id === instrument)?.label ?? '';

  return (
    <div className="app">
      <div className="app-shell">
        <header className="app-hero">
          <div className="hero-brand">
            <div className="logo">CodeSampler</div>
            <div className="hero-meta">
              <span className="hero-chip">Chord Lab</span>
              <span className="hero-chip">32 Pad Grid</span>
            </div>
          </div>
          <div className="hero-status">
            <span className="status-dot" />
            <span>ONLINE</span>
          </div>
        </header>

        <section className="dashboard">
          <aside className="control-panel">
            <div className="panel-card">
              <div className="panel-header">
                <span className="panel-label">Key Matrix</span>
                <span className="panel-value">{tonic}</span>
              </div>
              <div className="key-selector">
                <div className="key-grid">
                  {KEY_OPTIONS.map((key) => (
                    <button
                      key={key.id}
                      type="button"
                      className={`pill-button${
                        tonic === key.id ? ' pill-button--active' : ''
                      }`}
                      onClick={() => setTonic(key.id)}
                    >
                      {key.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <span className="panel-label">Instrument</span>
                <span className="panel-value">{activeInstrumentLabel}</span>
              </div>
              <div className="pill-group">
                {TONE_INSTRUMENTS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`pill-button${
                      instrument === option.id ? ' pill-button--active' : ''
                    }`}
                    onClick={() => setInstrument(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="pad-panel">
            <div className="pad-panel-header">
              <span className="panel-label">Chord Pads</span>
              <span className="panel-value">{pads.length} slots</span>
            </div>
            <div className="pad-grid">
              {pads.map((pad) => (
                <button
                  key={pad.id}
                  type="button"
                  className={`pad pad--${pad.group}${
                    activePadIds.includes(pad.id) ? ' is-active' : ''
                  }`}
                  aria-pressed={activePadIds.includes(pad.id)}
                  onMouseDown={(event) => handlePointerDown(event, pad)}
                  onMouseUp={(event) => handlePointerUp(event, pad)}
                  onMouseLeave={() => handlePadRelease(pad)}
                  onTouchStart={(event) => handlePointerDown(event, pad)}
                  onTouchEnd={(event) => handlePointerUp(event, pad)}
                  onTouchCancel={() => handlePadRelease(pad)}
                  onKeyDown={(event: ReactKeyboardEvent<HTMLButtonElement>) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      void handlePadPress(pad);
                    }
                  }}
                  onKeyUp={(event: ReactKeyboardEvent<HTMLButtonElement>) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handlePadRelease(pad);
                    }
                  }}
                >
                  <span className="pad-index">{pad.keyBinding.label}</span>
                  <span className="pad-label">{pad.roman}</span>
                  <span className="pad-name">{pad.chordName}</span>
                </button>
              ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

export default App;
