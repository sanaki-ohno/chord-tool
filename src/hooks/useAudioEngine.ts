import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import type { InstrumentId } from '../types/music';

export const createInstrument = (instrument: InstrumentId): Tone.PolySynth => {
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

export const useAudioEngine = (instrument: InstrumentId) => {
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);
  const audioStartedRef = useRef(false);

  useEffect(() => {
    const toneSynth = createInstrument(instrument);
    setSynth(toneSynth);

    return () => {
      toneSynth.dispose();
      setSynth(null);
      audioStartedRef.current = false;
    };
  }, [instrument]);

  const startAudioContext = useCallback(async () => {
    if (audioStartedRef.current) return;
    await Tone.start();
    audioStartedRef.current = true;
  }, []);

  return {
    synth,
    startAudioContext,
  } as const;
};
