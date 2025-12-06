// src/types/recorder.ts - 録音機能で利用する型定義
import type { Pad } from './music';

export type TransportState = 'idle' | 'armed' | 'count-in' | 'recording' | 'playing';

export type TimeSignature = {
  numerator: number;
  denominator: number;
};

export type RecordingEvent = {
  padId: Pad['id'];
  chordName: string;
  notes: string[];
  startTicks: number;
  durationTicks: number;
};

export type Recording = {
  bpm: number;
  timeSignature: TimeSignature;
  maxBars: number;
  totalTicks: number;
  events: RecordingEvent[];
};
