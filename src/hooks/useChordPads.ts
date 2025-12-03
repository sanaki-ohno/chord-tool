import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Tone from 'tone';
import { KEY_BINDINGS } from '../config/keyOptions';
import { PAD_DEFINITIONS, buildPads } from '../config/musicTheory';
import type {
  Pad,
  PadLayoutConfig,
  PadDefinition,
  KeyBinding,
  Tonic,
} from '../types/music';

const normalizeLayoutConfig = (
  layoutConfig?: PadLayoutConfig
): {
  padDefinitions: PadDefinition[];
  keyBindings: KeyBinding[];
} => ({
  padDefinitions: layoutConfig?.padDefinitions ?? PAD_DEFINITIONS,
  keyBindings: layoutConfig?.keyBindings ?? KEY_BINDINGS,
});

type UseChordPadsParams = {
  tonic: Tonic;
  synth: Tone.PolySynth | null;
  startAudioContext: () => Promise<void>;
  layoutConfig?: PadLayoutConfig;
};

export const useChordPads = ({
  tonic,
  synth,
  startAudioContext,
  layoutConfig,
}: UseChordPadsParams) => {
  const { padDefinitions, keyBindings } = useMemo(
    () => normalizeLayoutConfig(layoutConfig),
    [layoutConfig]
  );
  const [activePadIds, setActivePadIds] = useState<string[]>([]);
  const heldPadsRef = useRef<Record<string, boolean>>({});

  const pads = useMemo(() => {
    const basePads = buildPads(tonic, { padDefinitions });
    if (basePads.length !== keyBindings.length) {
      console.warn('Pad and key binding count mismatch.');
    }

    return basePads.map((pad, index) => ({
      ...pad,
      keyBinding: keyBindings[index] ?? { key: pad.id, label: pad.id },
    }));
  }, [tonic, padDefinitions, keyBindings]);

  const padMap = useMemo(() => {
    return pads.reduce<Record<string, Pad>>((map, pad) => {
      map[pad.keyBinding.key] = pad;
      return map;
    }, {});
  }, [pads]);

  const handlePadPress = useCallback(
    async (pad: Pad) => {
      if (!synth || heldPadsRef.current[pad.id]) return;

      await startAudioContext();
      pad.notes.forEach((note) => synth.triggerAttack(note, Tone.now()));
      heldPadsRef.current[pad.id] = true;
      setActivePadIds((prev) =>
        prev.includes(pad.id) ? prev : [...prev, pad.id]
      );
    },
    [synth, startAudioContext]
  );

  const handlePadRelease = useCallback(
    (pad: Pad) => {
      if (!synth || !heldPadsRef.current[pad.id]) return;

      pad.notes.forEach((note) => synth.triggerRelease(note, Tone.now()));
      delete heldPadsRef.current[pad.id];
      setActivePadIds((prev) => prev.filter((id) => id !== pad.id));
    },
    [synth]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const pad = padMap[pressedKey];
      if (!pad) return;
      event.preventDefault();
      void handlePadPress(pad);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const releasedKey =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const pad = padMap[releasedKey];
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
  }, [padMap, handlePadPress, handlePadRelease]);

  useEffect(() => {
    heldPadsRef.current = {};
    setActivePadIds([]);
  }, [tonic, padDefinitions, keyBindings, synth]);

  return {
    pads,
    activePadIds,
    handlePadPress,
    handlePadRelease,
  } as const;
};
