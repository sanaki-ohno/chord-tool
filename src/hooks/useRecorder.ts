// src/hooks/useRecorder.ts - 録音・再生・ダウンロード管理フック
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import type { Pad } from '../types/music';
import type {
  Recording,
  RecordingEvent,
  TimeSignature,
  TransportState,
} from '../types/recorder';

const DEFAULT_BPM = 120;
const DEFAULT_SIGNATURE: TimeSignature = { numerator: 4, denominator: 4 };
const TIME_SIGNATURE_OPTIONS: TimeSignature[] = [
  { numerator: 4, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 6, denominator: 8 },
  { numerator: 5, denominator: 4 },
];
const MAX_BARS = 16;
const MIN_NOTE_DENOMINATOR = 16; // 1/16 note minimum
const DEFAULT_COUNT_IN_BARS = 1;

const createRecordingSkeleton = (
  bpm: number,
  timeSignature: TimeSignature
): Recording => ({
  bpm,
  timeSignature,
  maxBars: MAX_BARS,
  totalTicks: 0,
  events: [],
});

type PendingEvent = {
  padId: string;
  chordName: string;
  notes: string[];
  startTicks: number;
};

type UseRecorderParams = {
  synth: Tone.PolySynth | null;
  startAudioContext: () => Promise<void>;
};

const triggerDownload = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const useRecorder = ({ synth, startAudioContext }: UseRecorderParams) => {
  const [transportState, setTransportState] = useState<TransportState>('idle');
  const [bpm, setBpmState] = useState(DEFAULT_BPM);
  const [timeSignature, setTimeSignatureState] = useState<TimeSignature>(
    DEFAULT_SIGNATURE
  );
  const [currentTake, setCurrentTake] = useState<Recording | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ bar: 1, beat: 1 });

  const tempRecordingRef = useRef<Recording | null>(null);
  const pendingEventsRef = useRef<Record<string, PendingEvent>>({});
  const scheduledEventsRef = useRef<number[]>([]);
  const metronomeSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const metronomeEventIdRef = useRef<number | null>(null);
  const beatCounterRef = useRef(0);
  const recordingOffsetRef = useRef(0);
  const countInEventIdRef = useRef<number | null>(null);
  const playbackOffsetRef = useRef(0);
  const activePlaybackNotesRef = useRef<Record<string, string[]>>({});

  const ticksPerBeat = useMemo(() => {
    const base = Tone.Transport.PPQ;
    return base * (4 / timeSignature.denominator);
  }, [timeSignature]);

  const ticksPerBar = useMemo(
    () => ticksPerBeat * timeSignature.numerator,
    [ticksPerBeat, timeSignature]
  );

  const countInTicks = useMemo(
    () => ticksPerBar * DEFAULT_COUNT_IN_BARS,
    [ticksPerBar]
  );

const minNoteTicks = useMemo(
    () => Tone.Transport.PPQ / (MIN_NOTE_DENOMINATOR / 4),
    []
  );

  const maxTicks = useMemo(() => ticksPerBar * MAX_BARS, [ticksPerBar]);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    Tone.Transport.timeSignature = [
      timeSignature.numerator,
      timeSignature.denominator,
    ];
  }, [timeSignature]);

  useEffect(() => {
    const synth = new Tone.MembraneSynth({
      volume: -8,
      envelope: { attack: 0.001, decay: 0.05, sustain: 0.1, release: 0.1 },
    }).toDestination();
    metronomeSynthRef.current = synth;
    return () => {
      synth.dispose();
    };
  }, []);

  const getEffectiveTicks = useCallback(
    () => Math.max(Tone.Transport.ticks - recordingOffsetRef.current, 0),
    []
  );

  const stopMetronome = useCallback(() => {
    if (metronomeEventIdRef.current !== null) {
      Tone.Transport.clear(metronomeEventIdRef.current);
      metronomeEventIdRef.current = null;
    }
  }, []);

  const releaseActivePlaybackNotes = useCallback(
    () => {
      if (!synth) return;
      Object.keys(activePlaybackNotesRef.current).forEach((key) => {
        const notes = activePlaybackNotesRef.current[key];
        synth.triggerRelease(notes, Tone.now());
        delete activePlaybackNotesRef.current[key];
      });
    },
    [synth]
  );

  const startMetronome = useCallback(() => {
    stopMetronome();
    beatCounterRef.current = 0;
    const id = Tone.Transport.scheduleRepeat((time) => {
      const beatIndex = beatCounterRef.current % timeSignature.numerator;
      const freq = beatIndex === 0 ? 1200 : 850;
      const duration = beatIndex === 0 ? '16n' : '32n';
      metronomeSynthRef.current?.triggerAttackRelease(freq, duration, time);
      beatCounterRef.current += 1;
    }, Tone.Ticks(ticksPerBeat));
    metronomeEventIdRef.current = id;
  }, [stopMetronome, timeSignature.numerator, ticksPerBeat]);

  const clearCountInEvent = useCallback(() => {
    if (countInEventIdRef.current !== null) {
      Tone.Transport.clear(countInEventIdRef.current);
      countInEventIdRef.current = null;
    }
  }, []);

  const finalizePendingEvents = useCallback(
    (endTicks: number) => {
      const tempRecording = tempRecordingRef.current;
      if (!tempRecording) return;
      const entries = pendingEventsRef.current;
      Object.keys(entries).forEach((padId) => {
        const pending = entries[padId];
        if (!pending) return;
        const durationTicks = Math.max(endTicks - pending.startTicks, minNoteTicks);
        const event: RecordingEvent = {
          padId,
          chordName: pending.chordName,
          notes: pending.notes,
          startTicks: pending.startTicks,
          durationTicks,
        };
        tempRecording.events.push(event);
      });
      pendingEventsRef.current = {};
    },
    [minNoteTicks]
  );

  const clearSchedules = useCallback(() => {
    scheduledEventsRef.current.forEach((id) => Tone.Transport.clear(id));
    scheduledEventsRef.current = [];
  }, []);

  const getPlaybackTicks = useCallback(
    () => playbackOffsetRef.current + Tone.Transport.ticks,
    []
  );

  const stopPlayback = useCallback(
    (resetPosition = false) => {
      const currentTicks = getPlaybackTicks();
      clearSchedules();
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      Tone.Transport.cancel(0);
      releaseActivePlaybackNotes();
      const total = currentTake?.totalTicks ?? maxTicks;
      playbackOffsetRef.current = resetPosition
        ? 0
        : Math.min(currentTicks, total);
      setTransportState('idle');
    },
    [clearSchedules, releaseActivePlaybackNotes, getPlaybackTicks, currentTake, maxTicks]
  );

  const stopRecording = useCallback(async () => {
    const isActivePhase =
      transportState === 'recording' || transportState === 'count-in';
    if (!isActivePhase) {
      setTransportState('idle');
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      return;
    }

    clearCountInEvent();
    stopMetronome();

    if (transportState === 'recording') {
      const endTicks = Math.min(getEffectiveTicks(), maxTicks);
      finalizePendingEvents(endTicks);
      const tempRecording = tempRecordingRef.current;
      if (tempRecording) {
        tempRecording.totalTicks = Math.min(endTicks, maxTicks);
        setCurrentTake({ ...tempRecording, events: [...tempRecording.events] });
      }
    } else {
      tempRecordingRef.current = null;
    }

    pendingEventsRef.current = {};
    tempRecordingRef.current = null;
    recordingOffsetRef.current = 0;
    playbackOffsetRef.current = 0;
    releaseActivePlaybackNotes();
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    setTransportState('idle');
  }, [
    transportState,
    finalizePendingEvents,
    maxTicks,
    getEffectiveTicks,
    clearCountInEvent,
    stopMetronome,
    releaseActivePlaybackNotes,
  ]);

  const startRecording = useCallback(async () => {
    if (!synth) return;
    await startAudioContext();
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    clearSchedules();
    releaseActivePlaybackNotes();
    clearCountInEvent();
    Tone.Transport.cancel(0);
    tempRecordingRef.current = createRecordingSkeleton(bpm, timeSignature);
    pendingEventsRef.current = {};
    setCurrentPosition({ bar: 1, beat: 1 });
    recordingOffsetRef.current = countInTicks;
    setTransportState('count-in');
    startMetronome();
    const countInId = Tone.Transport.schedule(() => {
      countInEventIdRef.current = null;
      setTransportState('recording');
    }, Tone.Ticks(recordingOffsetRef.current));
    countInEventIdRef.current = countInId;
    Tone.Transport.start();
  }, [
    bpm,
    timeSignature,
    synth,
    startAudioContext,
    clearSchedules,
    clearCountInEvent,
    startMetronome,
    releaseActivePlaybackNotes,
    countInTicks,
  ]);

  const startPlayback = useCallback(
    async (resume = false) => {
      if (!currentTake || !synth) return;
      await startAudioContext();
      const totalTicks = currentTake.totalTicks || maxTicks;
      if (!resume || playbackOffsetRef.current >= totalTicks) {
        playbackOffsetRef.current = 0;
      }
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      clearSchedules();
      releaseActivePlaybackNotes();
      Tone.Transport.cancel(0);
      const offset = playbackOffsetRef.current;
      currentTake.events.forEach((event) => {
        const start = event.startTicks;
        const end = event.startTicks + event.durationTicks;
        if (end <= offset) return;
        const effectiveStart = Math.max(start, offset);
        const delayTicks = effectiveStart - offset;
        const remainingDuration = end - effectiveStart;
        const eventKey = `${event.padId}-${event.startTicks}-${event.durationTicks}`;
        const attackId = Tone.Transport.schedule((time) => {
          synth.triggerAttack(event.notes, time);
          activePlaybackNotesRef.current[eventKey] = event.notes;
        }, Tone.Ticks(delayTicks));
        const releaseId = Tone.Transport.schedule((time) => {
          synth.triggerRelease(event.notes, time);
          delete activePlaybackNotesRef.current[eventKey];
        }, Tone.Ticks(delayTicks + remainingDuration));
        scheduledEventsRef.current.push(attackId, releaseId);
      });
      const remainingTicks = Math.max(totalTicks - offset, 0);
      const endId = Tone.Transport.schedule(() => {
        playbackOffsetRef.current = 0;
        stopPlayback(true);
      }, Tone.Ticks(remainingTicks));
      scheduledEventsRef.current.push(endId);
      setTransportState('playing');
      Tone.Transport.start();
    },
    [
      currentTake,
      synth,
      startAudioContext,
      stopPlayback,
      clearSchedules,
      maxTicks,
      releaseActivePlaybackNotes,
    ]
  );

  useEffect(() => {
    const updatePosition = () => {
      if (transportState === 'count-in') {
        const rawTicks = Tone.Transport.ticks;
        const bar = Math.min(
          DEFAULT_COUNT_IN_BARS,
          Math.max(1, Math.floor(rawTicks / ticksPerBar) + 1)
        );
        const beat = Math.min(
          timeSignature.numerator,
          Math.max(1, ((rawTicks % ticksPerBar) / ticksPerBeat) + 1)
        );
        setCurrentPosition({ bar, beat });
        return;
      }
      const isRecording = transportState === 'recording';
      const isPlaying = transportState === 'playing';
      let effectiveTicks = 0;
      if (isRecording) {
        effectiveTicks = getEffectiveTicks();
      } else if (isPlaying) {
        effectiveTicks = getPlaybackTicks();
      }
      const bar = Math.min(
        MAX_BARS,
        Math.max(1, Math.floor(effectiveTicks / ticksPerBar) + 1)
      );
      const beat = (isRecording || isPlaying)
        ? ((effectiveTicks % ticksPerBar) / ticksPerBeat) + 1
        : 1;
      setCurrentPosition({ bar, beat });
      if (transportState === 'recording' && effectiveTicks >= maxTicks) {
        void stopRecording();
      }
    };
    const id = window.setInterval(updatePosition, 120);
    return () => window.clearInterval(id);
  }, [
    transportState,
    ticksPerBar,
    ticksPerBeat,
    maxTicks,
    stopRecording,
    getEffectiveTicks,
    getPlaybackTicks,
  ]);

  useEffect(() => {
    const handleSpace = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT')) {
        return;
      }
      event.preventDefault();
      if (transportState === 'recording' || transportState === 'count-in') {
        void stopRecording();
      } else if (transportState === 'playing') {
        stopPlayback();
      } else if (transportState === 'armed') {
        void startRecording();
      } else if (transportState === 'idle' && currentTake) {
        const resume = playbackOffsetRef.current > 0;
        void startPlayback(resume);
      }
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [transportState, currentTake, startRecording, stopRecording, startPlayback, stopPlayback]);

  const handlePadPress = useCallback(
    (pad: Pad) => {
      if (transportState !== 'recording') return;
      const nowTicks = Math.min(getEffectiveTicks(), maxTicks);
      if (pendingEventsRef.current[pad.id]) return;
      pendingEventsRef.current[pad.id] = {
        padId: pad.id,
        chordName: pad.chordName,
        notes: pad.notes,
        startTicks: nowTicks,
      };
    },
    [transportState, maxTicks, getEffectiveTicks]
  );

  const handlePadRelease = useCallback(
    (pad: Pad) => {
      if (transportState !== 'recording') return;
      const pending = pendingEventsRef.current[pad.id];
      const tempRecording = tempRecordingRef.current;
      if (!pending || !tempRecording) return;
      const nowTicks = Math.min(getEffectiveTicks(), maxTicks);
      const durationTicks = Math.max(nowTicks - pending.startTicks, minNoteTicks);
      const event: RecordingEvent = {
        padId: pad.id,
        chordName: pad.chordName,
        notes: pad.notes,
        startTicks: pending.startTicks,
        durationTicks,
      };
      tempRecording.events.push(event);
      delete pendingEventsRef.current[pad.id];
    },
    [transportState, maxTicks, minNoteTicks, getEffectiveTicks]
  );

  const toggleArm = useCallback(() => {
    if (transportState === 'recording' || transportState === 'count-in') return;
    if (transportState === 'armed') {
      setTransportState('idle');
      tempRecordingRef.current = null;
      pendingEventsRef.current = {};
      return;
    }
    tempRecordingRef.current = createRecordingSkeleton(bpm, timeSignature);
    pendingEventsRef.current = {};
    setTransportState('armed');
  }, [transportState, bpm, timeSignature]);

  const handlePlayPressed = useCallback(async () => {
    if (transportState === 'armed') {
      await startRecording();
      return;
    }
    if (transportState === 'idle' && currentTake) {
      const resume = playbackOffsetRef.current > 0;
      await startPlayback(resume);
    }
  }, [transportState, startRecording, startPlayback, currentTake]);

  const handleStopPressed = useCallback(() => {
    if (transportState === 'recording' || transportState === 'count-in') {
      void stopRecording();
    } else if (transportState === 'playing') {
      stopPlayback();
    }
  }, [transportState, stopRecording, stopPlayback]);

  const handleBpmChange = useCallback(
    (nextBpm: number) => {
      if (transportState === 'recording' || transportState === 'count-in') return;
      const clamped = Math.min(200, Math.max(1, nextBpm));
      setBpmState(clamped);
      if (tempRecordingRef.current) {
        tempRecordingRef.current.bpm = clamped;
      }
    },
    [transportState]
  );

  const handleSignatureChange = useCallback(
    (next: TimeSignature) => {
      if (transportState === 'recording' || transportState === 'count-in') return;
      setTimeSignatureState(next);
      if (tempRecordingRef.current) {
        tempRecordingRef.current.timeSignature = next;
      }
    },
    [transportState]
  );

  const downloadCurrentTake = useCallback(() => {
    if (!currentTake) return;
    const midi = new Midi();
    midi.header.setTempo(currentTake.bpm);
    midi.header.timeSignatures = [
      {
        ticks: 0,
        measures: 0,
        timeSignature: [
          currentTake.timeSignature.numerator,
          currentTake.timeSignature.denominator,
        ],
      },
    ];
    const track = midi.addTrack();
    const secondsPerTick = 60 / (currentTake.bpm * Tone.Transport.PPQ);
    const toSeconds = (ticks: number) => ticks * secondsPerTick;
    currentTake.events.forEach((event) => {
      event.notes.forEach((note) => {
        const midiNumber = Tone.Frequency(note).toMidi();
        track.addNote({
          midi: midiNumber,
          time: toSeconds(event.startTicks),
          duration: toSeconds(event.durationTicks),
        });
      });
    });
    const midiArray = midi.toArray();
    const midiBuffer = midiArray.buffer.slice(
      midiArray.byteOffset,
      midiArray.byteOffset + midiArray.byteLength
    );
    const midiBlob = new Blob([midiBuffer], { type: 'audio/midi' });
    triggerDownload(`codesampler-${Date.now()}.mid`, midiBlob);
  }, [currentTake]);

  const hasTake = Boolean(currentTake);

  return {
    bpm,
    setBpm: handleBpmChange,
    timeSignature,
    setTimeSignature: handleSignatureChange,
    transportState,
    currentPosition,
    maxBars: MAX_BARS,
    hasTake,
    toggleArm,
    handlePlayPressed,
    handleStopPressed,
    downloadCurrentTake,
    handlePadPress,
    handlePadRelease,
    availableSignatures: TIME_SIGNATURE_OPTIONS,
  } as const;
};
