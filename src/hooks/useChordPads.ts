// src/hooks/useChordPads.ts - パッド生成と入力管理ロジック
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Tone from 'tone';
import { KEY_BINDINGS } from '../config/keyOptions';
import {
  PAD_DEFINITIONS,
  buildPads,
  buildCustomPadFromAssignment,
  getPadRowColor,
  getRomanNumeralForAssignmentNote,
} from '../config/musicTheory';
import type {
  Pad,
  PadLayoutConfig,
  KeyBinding,
  Tonic,
  PadAssignmentState,
  PadBase,
} from '../types/music';

const normalizeLayoutConfig = (
  layoutConfig?: PadLayoutConfig
): {
  keyBindings: KeyBinding[];
} => ({
  keyBindings: layoutConfig?.keyBindings ?? KEY_BINDINGS,
});

type UseChordPadsParams = {
  tonic: Tonic;
  synth: Tone.PolySynth | null;
  startAudioContext: () => Promise<void>;
  layoutConfig?: PadLayoutConfig;
  padAssignments: PadAssignmentState;
  padEventHandlers?: {
    onPadPress?: (pad: Pad) => void;
    onPadRelease?: (pad: Pad) => void;
  };
};

export const useChordPads = ({
  tonic,
  synth,
  startAudioContext,
  layoutConfig,
  padAssignments,
  padEventHandlers,
}: UseChordPadsParams) => {
  const { keyBindings } = useMemo(
    () => normalizeLayoutConfig(layoutConfig),
    [layoutConfig]
  );
  const [activePadIds, setActivePadIds] = useState<string[]>([]);
  const heldPadsRef = useRef<Record<string, boolean>>({});

  const defaultPadMap = useMemo(() => {
    return buildPads(tonic).reduce<Record<string, PadBase>>((map, pad) => {
      map[pad.id] = pad;
      return map;
    }, {});
  }, [tonic]);

  const pads = useMemo(() => {
    return PAD_DEFINITIONS.map((definition, index) => {
      const padId = definition.id;
      const assignment = padAssignments[padId];

      let padBase: PadBase;
      if (!assignment) {
        padBase = {
          id: padId,
          roman: definition.roman,
          group: 'diatonic',
          chordName: '',
          notes: [],
          color: getPadRowColor(padId),
        };
      } else if (assignment.type === 'default') {
        const baseDefinition =
          defaultPadMap[assignment.definitionId] ?? defaultPadMap[padId];
        const assignmentColor = assignment.color ?? getPadRowColor(assignment.definitionId);
        const sourceDefinition = PAD_DEFINITIONS.find(
          (def) => def.id === assignment.definitionId
        );
        const roman =
          sourceDefinition?.roman ??
          baseDefinition?.roman ??
          definition.roman;
        if (baseDefinition) {
          padBase = {
            ...baseDefinition,
            id: padId,
            color: assignmentColor,
            roman,
          };
        } else {
          padBase = {
            id: padId,
            roman,
            group: 'diatonic',
            chordName: '',
            notes: [],
            color: assignmentColor,
          };
        }
      } else {
        const customBase = buildCustomPadFromAssignment(assignment, tonic, padId);
        const rootRoman = getRomanNumeralForAssignmentNote(assignment, tonic);
        const bassRoman =
          assignment.bassNote !== undefined
            ? getRomanNumeralForAssignmentNote(assignment, tonic, assignment.bassNote)
            : null;
        const customRoman = bassRoman ? `${rootRoman}/${bassRoman}` : rootRoman;
        padBase = { ...customBase, roman: customRoman };
      }

      const keyBinding = keyBindings[index] ?? { key: padId, label: padId };

      return {
        ...padBase,
        id: padId,
        keyBinding,
      };
    });
  }, [padAssignments, defaultPadMap, keyBindings, tonic]);

  useEffect(() => {
    if (PAD_DEFINITIONS.length !== keyBindings.length) {
      console.warn('Pad and key binding count mismatch.');
    }
  }, [keyBindings]);

  const padMap = useMemo(() => {
    return pads.reduce<Record<string, Pad>>((map, pad) => {
      map[pad.keyBinding.key] = pad;
      return map;
    }, {});
  }, [pads]);

  const handlePadPress = useCallback(
    async (pad: Pad) => {
      if (!synth || heldPadsRef.current[pad.id] || pad.notes.length === 0) {
        return;
      }

      await startAudioContext();
      pad.notes.forEach((note) => synth.triggerAttack(note, Tone.now()));
      heldPadsRef.current[pad.id] = true;
      setActivePadIds((prev) =>
        prev.includes(pad.id) ? prev : [...prev, pad.id]
      );
      padEventHandlers?.onPadPress?.(pad);
    },
    [synth, startAudioContext, padEventHandlers]
  );

  const handlePadRelease = useCallback(
    (pad: Pad) => {
      if (!synth || !heldPadsRef.current[pad.id] || pad.notes.length === 0) {
        return;
      }

      pad.notes.forEach((note) => synth.triggerRelease(note, Tone.now()));
      delete heldPadsRef.current[pad.id];
      setActivePadIds((prev) => prev.filter((id) => id !== pad.id));
      padEventHandlers?.onPadRelease?.(pad);
    },
    [synth, padEventHandlers]
  );

  useEffect(() => {
    const shouldBlockKeypress = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return target.dataset.padInputLock === 'true';
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldBlockKeypress(event.target)) return;
      const pressedKey =
        event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const pad = padMap[pressedKey];
      if (!pad) return;
      event.preventDefault();
      void handlePadPress(pad);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (shouldBlockKeypress(event.target)) return;
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
  }, [tonic, keyBindings, synth]);

  return {
    pads,
    activePadIds,
    handlePadPress,
    handlePadRelease,
  } as const;
};
