// src/App.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
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

type InstrumentId = 'piano' | 'synth' | 'epiano';

type Chord = {
  id: string;
  label: string; // I, ii など
  name: string; // Cmaj, Dm...
  notes: string[]; // ["C4", "E4", "G4"] など
  keyLabel: string; // 表示用キー (A,S,D...)
  keyCode: string; // 実際に押すキー
};

type KeyOption = {
  id: Tonic; // 内部的に使うトニック
  label: string; // 表示用 "C", "Db" など
};

type InstrumentOption = {
  id: InstrumentId;
  label: string; // 表示用
};

const KEY_CENTER: KeyOption = { id: 'C', label: 'C' };

const KEY_RIGHT_SIDE: KeyOption[] = [
  { id: 'C#', label: 'Db' },
  { id: 'D', label: 'D' },
  { id: 'D#', label: 'Eb' },
  { id: 'E', label: 'E' },
  { id: 'F', label: 'F' },
];

const KEY_LEFT_SIDE: KeyOption[] = [
  { id: 'F#', label: 'Gb' },
  { id: 'G', label: 'G' },
  { id: 'G#', label: 'Ab' },
  { id: 'A', label: 'A' },
  { id: 'A#', label: 'Bb' },
];

const INSTRUMENT_OPTIONS: InstrumentOption[] = [
  { id: 'piano', label: 'Piano' },
  { id: 'epiano', label: 'E.Piano' },
  { id: 'synth', label: 'Synth' },
];

type ChordDef = {
  id: string;
  label: string;
  degreeIndex: number; // メジャースケールの何番目か（0〜7）
  quality: 'maj' | 'min' | 'dim';
  keyLabel: string;
  keyCode: string;
  octaveOffset?: number; // I↑ だけ +1 オクターブ など
};

// メジャースケール（全音・全音・半音…）の半音オフセット
const MAJOR_SCALE_OFFSETS = [0, 2, 4, 5, 7, 9, 11, 12];

// NOTE_NAMES と MIDI 変換
const NOTE_NAMES = [
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

// C4 を 60 とする
const TONIC_TO_MIDI4: Record<Tonic, number> = {
  C: 60,
  'C#': 61,
  D: 62,
  'D#': 63,
  E: 64,
  F: 65,
  'F#': 54,
  G: 55,
  'G#': 56,
  A: 57,
  'A#': 58,
  B: 59,
};

// 度数ごとの定義（ローマ数字・質・割り当てキー）
const CHORD_DEFS: ChordDef[] = [
  {
    id: 'I',
    label: 'I',
    degreeIndex: 0,
    quality: 'maj',
    keyLabel: 'A',
    keyCode: 'a',
  },
  {
    id: 'ii',
    label: 'ii',
    degreeIndex: 1,
    quality: 'min',
    keyLabel: 'S',
    keyCode: 's',
  },
  {
    id: 'iii',
    label: 'iii',
    degreeIndex: 2,
    quality: 'min',
    keyLabel: 'D',
    keyCode: 'd',
  },
  {
    id: 'IV',
    label: 'IV',
    degreeIndex: 3,
    quality: 'maj',
    keyLabel: 'F',
    keyCode: 'f',
  },
  {
    id: 'V',
    label: 'V',
    degreeIndex: 4,
    quality: 'maj',
    keyLabel: 'G',
    keyCode: 'g',
  },
  {
    id: 'vi',
    label: 'vi',
    degreeIndex: 5,
    quality: 'min',
    keyLabel: 'H',
    keyCode: 'h',
  },
  {
    id: 'vii°',
    label: 'vii°',
    degreeIndex: 6,
    quality: 'dim',
    keyLabel: 'J',
    keyCode: 'j',
  },
  {
    id: 'I8',
    label: 'I',
    degreeIndex: 7,
    quality: 'maj',
    keyLabel: 'K',
    keyCode: 'k',
    octaveOffset: 0,
  },
];

// ---- MIDI ユーティリティ ----
const midiToNote = (midi: number): string => {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
};

const buildTriad = (
  rootMidi: number,
  quality: 'maj' | 'min' | 'dim'
): string[] => {
  let intervals: number[];
  switch (quality) {
    case 'maj':
      intervals = [0, 4, 7];
      break;
    case 'min':
      intervals = [0, 3, 7];
      break;
    case 'dim':
      intervals = [0, 3, 6];
      break;
  }
  return intervals.map((i) => midiToNote(rootMidi + i));
};

const buildDiatonicChords = (tonic: Tonic): Chord[] => {
  const tonicMidi = TONIC_TO_MIDI4[tonic];

  return CHORD_DEFS.map((def) => {
    const baseOffset = MAJOR_SCALE_OFFSETS[def.degreeIndex];
    const rootMidi = tonicMidi + baseOffset + (def.octaveOffset ?? 0);
    const notes = buildTriad(rootMidi, def.quality);

    // 表示用のコード名（超ざっくり）
    const rootName = NOTE_NAMES[((rootMidi % 12) + 12) % 12];
    let suffix = '';
    if (def.quality === 'maj') suffix = 'maj';
    if (def.quality === 'min') suffix = 'm';
    if (def.quality === 'dim') suffix = 'dim';

    return {
      id: def.id,
      label: def.label,
      name: `${rootName}${suffix}`,
      notes,
      keyLabel: def.keyLabel,
      keyCode: def.keyCode,
    };
  });
};

// ---- シンセ生成 ----
const createPoly = (instrument: InstrumentId): Tone.PolySynth => {
  switch (instrument) {
    case 'piano':
      return new Tone.PolySynth(Tone.Synth, {
        volume: -8,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.5 },
      }).toDestination();

    case 'epiano':
      return new Tone.PolySynth(Tone.Synth, {
        volume: -10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.7, release: 1.2 },
      }).toDestination();

    case 'synth':
    default:
      return new Tone.PolySynth(Tone.Synth, {
        volume: -6,
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0.5, release: 0.3 },
      }).toDestination();
  }
};

function App() {
  const [activePadIds, setActivePadIds] = useState<string[]>([]);
  const [tonic, setTonic] = useState<Tonic>('C');
  const [instrument, setInstrument] = useState<InstrumentId>('piano');
  const activeInstrumentLabel =
    INSTRUMENT_OPTIONS.find((inst) => inst.id === instrument)?.label ?? '';

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const activeKeysRef = useRef<Record<string, string[]>>({}); // keyCode -> notes

  // キー変更に応じてコードを生成
  const chords = useMemo(() => buildDiatonicChords(tonic), [tonic]);

  // シンセの初期化 & 音色切り替え
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.dispose();
      synthRef.current = null;
    }
    synthRef.current = createPoly(instrument);

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, [instrument]);

  const playChord = (chord: Chord, fromKey?: string) => {
    if (!synthRef.current) return;
    if (fromKey && activeKeysRef.current[fromKey]) return; // 押しっぱなし対策

    chord.notes.forEach((note) => {
      synthRef.current!.triggerAttack(note, Tone.now());
    });

    setActivePadIds((prev) =>
      prev.includes(chord.id) ? prev : [...prev, chord.id]
    );

    if (fromKey) {
      activeKeysRef.current[fromKey] = chord.notes;
    }
  };

  const stopChord = (chord: Chord, fromKey?: string) => {
    if (!synthRef.current) return;

    const notes =
      fromKey && activeKeysRef.current[fromKey]
        ? activeKeysRef.current[fromKey]
        : chord.notes;

    notes.forEach((note) => {
      synthRef.current!.triggerRelease(note, Tone.now());
    });

    setActivePadIds((prev) => prev.filter((id) => id !== chord.id));

    if (fromKey) {
      delete activeKeysRef.current[fromKey];
    }
  };

  // キーボード入力（A, S, D...）に対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const chord = chords.find((c) => c.keyCode === key);
      if (!chord) return;
      playChord(chord, key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const chord = chords.find((c) => c.keyCode === key);
      if (!chord) return;
      stopChord(chord, key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [chords]);

  return (
    <div className="app">
      <div className="app-shell">
        <header className="app-hero">
          <div className="hero-brand">
            <div className="logo">CodeSampler</div>
            <div className="hero-meta">
              <span className="hero-chip">SESSION 01</span>
              <span className="hero-chip">NEBULA</span>
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
                <div className="key-side key-side--left">
                  {KEY_LEFT_SIDE.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      className={
                        'pill-button' +
                        (tonic === k.id ? ' pill-button--active' : '')
                      }
                      onClick={() => setTonic(k.id)}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
                <div className="key-center">
                  <button
                    type="button"
                    className={
                      'pill-button' +
                      (tonic === KEY_CENTER.id ? ' pill-button--active' : '')
                    }
                    onClick={() => setTonic(KEY_CENTER.id)}
                  >
                    {KEY_CENTER.label}
                  </button>
                </div>
                <div className="key-side key-side--right">
                  {KEY_RIGHT_SIDE.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      className={
                        'pill-button' +
                        (tonic === k.id ? ' pill-button--active' : '')
                      }
                      onClick={() => setTonic(k.id)}
                    >
                      {k.label}
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
                {INSTRUMENT_OPTIONS.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    className={
                      'pill-button' +
                      (instrument === inst.id ? ' pill-button--active' : '')
                    }
                    onClick={() => setInstrument(inst.id)}
                  >
                    {inst.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-card panel-card--compact">
              <div className="hint">
                <span>Keyboard</span>
                <span className="hint-keys">A S D F G H J K</span>
              </div>
            </div>
          </aside>

          <section className="pad-panel">
            <div className="pad-panel-header">
              <span className="panel-label">Chord Pads</span>
              <span className="panel-value">{chords.length} slots</span>
            </div>
            <div className="pad-grid">
              {chords.map((chord) => (
                <button
                  key={chord.id}
                  className={`pad ${
                    activePadIds.includes(chord.id) ? 'active' : ''
                  }`}
                  onMouseDown={() => playChord(chord)}
                  onMouseUp={() => stopChord(chord)}
                  onMouseLeave={() => stopChord(chord)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    playChord(chord);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    stopChord(chord);
                  }}
                >
                  <span className="pad-label">{chord.label}</span>
                  <span className="pad-name">{chord.name}</span>
                  <span className="pad-key">{chord.keyLabel}</span>
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
