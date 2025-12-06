// src/config/keyOptions.ts - キー/キーバインド/楽器オプション設定
import { PAD_DEFINITIONS } from './musicTheory';
import type {
  InstrumentOption,
  KeyBinding,
  KeyOption,
  PadLayoutConfig,
} from '../types/music';

export const TONE_INSTRUMENTS: InstrumentOption[] = [
  { id: 'piano', label: 'Piano' },
  { id: 'epiano', label: 'E.Piano' },
  { id: 'synth', label: 'Synth' },
  { id: 'violin', label: 'Violin' },
  { id: 'guitar', label: 'Guitar' },
];

export const KEY_OPTIONS: KeyOption[] = [
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

export const KEY_BINDINGS: KeyBinding[] = [
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

export const DEFAULT_PAD_LAYOUT: PadLayoutConfig = {
  padDefinitions: PAD_DEFINITIONS,
  keyBindings: KEY_BINDINGS,
};
