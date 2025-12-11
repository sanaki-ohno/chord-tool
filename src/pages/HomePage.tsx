// src/pages/HomePage.tsx - コードパッド画面のページコンテナ
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeySelector } from '../components/controls/KeySelector';
import { InstrumentSelector } from '../components/controls/InstrumentSelector';
import { ChordLibraryPanel } from '../components/controls/ChordLibraryPanel';
import { AppShell } from '../components/layout/AppShell';
import { PadGrid } from '../components/pads/PadGrid';
import { RecorderPanel } from '../components/recorder/RecorderPanel';
import {
  DEFAULT_PAD_LAYOUT,
  KEY_OPTIONS,
  TONE_INSTRUMENTS,
} from '../config/keyOptions';
import {
  PAD_DEFINITIONS,
  getPadRowColor,
  buildCustomPadFromAssignment,
} from '../config/musicTheory';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useChordPads } from '../hooks/useChordPads';
import { useRecorder } from '../hooks/useRecorder';
import type {
  ChordLibrarySelection,
  InstrumentId,
  PadAssignment,
  PadAssignmentState,
  PadDropSource,
  Tonic,
} from '../types/music';
import layoutStyles from '../styles/layout/AppLayout.module.css';
import controlStyles from '../styles/controls/ControlPanel.module.css';

const createInitialAssignments = (): PadAssignmentState => {
  const assignments: PadAssignmentState = {};
  PAD_DEFINITIONS.forEach((definition, index) => {
    assignments[definition.id] =
      index < 16
        ? {
            type: 'default',
            definitionId: definition.id,
            mode: 'relative',
            color: getPadRowColor(definition.id),
          }
        : null;
  });
  return assignments;
};

const createInitialLibrarySelection = (): ChordLibrarySelection => ({
  rootNote: 'C',
  chordTypeId: 'maj',
  group: 'diatonic',
});

export const HomePage = () => {
  const [tonic, setTonic] = useState<Tonic>('C');
  const [instrument, setInstrument] = useState<InstrumentId>('piano');
  const [padAssignments, setPadAssignments] = useState<PadAssignmentState>(() =>
    createInitialAssignments()
  );
  const [prevPadAssignments, setPrevPadAssignments] =
    useState<PadAssignmentState | null>(null);
  const [librarySelection, setLibrarySelection] = useState<ChordLibrarySelection>(
    () => createInitialLibrarySelection()
  );
  const currentLibrarySelectionRef = useRef<ChordLibrarySelection | null>(
    librarySelection
  );
  const [padSize, setPadSize] = useState<number | null>(null);
  const libraryPreviewNotesRef = useRef<string[] | null>(null);

  const { synth, startAudioContext } = useAudioEngine(instrument);

  // ドラッグタイルのプレビューでも即時で音が鳴るよう、最初の操作でAudioContextを起動しておく
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const primeAudioContext = () => {
      void startAudioContext();
      window.removeEventListener('pointerdown', primeAudioContext);
      window.removeEventListener('touchstart', primeAudioContext);
    };

    window.addEventListener('pointerdown', primeAudioContext);
    window.addEventListener('touchstart', primeAudioContext);

    return () => {
      window.removeEventListener('pointerdown', primeAudioContext);
      window.removeEventListener('touchstart', primeAudioContext);
    };
  }, [startAudioContext]);

  const recorder = useRecorder({ synth, startAudioContext });

  const layoutConfig = useMemo(() => DEFAULT_PAD_LAYOUT, []);

  const updateAssignments = useCallback(
    (updater: (prev: PadAssignmentState) => PadAssignmentState) => {
      setPadAssignments((current) => {
        const next = updater(current);
        if (next === current) return current;
        setPrevPadAssignments(current);
        return next;
      });
    },
    []
  );

  const { pads, activePadIds, handlePadPress, handlePadRelease } =
    useChordPads({
      tonic,
      synth,
      startAudioContext,
      layoutConfig,
      padAssignments,
      padEventHandlers: {
        onPadPress: recorder.handlePadPress,
        onPadRelease: recorder.handlePadRelease,
      },
    });

  const activeInstrumentLabel =
    TONE_INSTRUMENTS.find((option) => option.id === instrument)?.label ?? '';

  const isRecordingLocked =
    recorder.transportState === 'recording' ||
    recorder.transportState === 'count-in';

  const handleTonicSelect = (nextTonic: Tonic) => {
    if (isRecordingLocked) return;
    setTonic(nextTonic);
  };

  const handleInstrumentSelect = (nextInstrument: InstrumentId) => {
    if (isRecordingLocked) return;
    setInstrument(nextInstrument);
  };

  useEffect(() => {
    currentLibrarySelectionRef.current = librarySelection;
  }, [librarySelection]);

  const handleLibraryPreviewStart = useCallback(async () => {
    if (isRecordingLocked || !synth || libraryPreviewNotesRef.current) return;
    await startAudioContext();

    const assignment = {
      type: 'custom' as const,
      baseTonic: tonic,
      rootNote: librarySelection.rootNote,
      chordTypeId: librarySelection.chordTypeId,
      bassNote: librarySelection.bassNote,
      group: librarySelection.group,
      mode: 'relative' as const,
    } satisfies Extract<PadAssignment, { type: 'custom' }>;

    const previewPad = buildCustomPadFromAssignment(
      assignment,
      tonic,
      'library-preview'
    );

    libraryPreviewNotesRef.current = previewPad.notes;
    previewPad.notes.forEach((note) => synth.triggerAttack(note));
  }, [
    isRecordingLocked,
    synth,
    startAudioContext,
    tonic,
    librarySelection,
  ]);

  const handleLibraryPreviewEnd = useCallback(() => {
    if (!synth || !libraryPreviewNotesRef.current) return;
    libraryPreviewNotesRef.current.forEach((note) => synth.triggerRelease(note));
    libraryPreviewNotesRef.current = null;
  }, [synth]);

  useEffect(() => {
    return () => {
      handleLibraryPreviewEnd();
    };
  }, [handleLibraryPreviewEnd]);

  useEffect(() => {
    handleLibraryPreviewEnd();
  }, [librarySelection, tonic, handleLibraryPreviewEnd]);

  const handlePadDrop = useCallback(
    (targetPadId: string, source: PadDropSource) => {
      updateAssignments((current) => {
        if (source.type === 'pad' && source.padId) {
          if (source.padId === targetPadId) return current;
          const next = { ...current };
          const fromPadId = source.padId;
          const temp = next[targetPadId] ?? null;
          next[targetPadId] = next[fromPadId] ?? null;
          next[fromPadId] = temp;
          return next;
        }
        if (source.type === 'library') {
          const selection = currentLibrarySelectionRef.current;
          if (!selection) return current;
          const next = { ...current };
          next[targetPadId] = {
            type: 'custom',
            baseTonic: tonic,
            rootNote: selection.rootNote,
            chordTypeId: selection.chordTypeId,
            bassNote: selection.bassNote,
            group: selection.group,
            mode: 'relative',
            color: getPadRowColor(targetPadId),
          };
          return next;
        }
        return current;
      });
    },
    [tonic, updateAssignments]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isUndoKey =
        (event.metaKey && event.key === 'z') ||
        (event.ctrlKey && event.key === 'z');
      if (!isUndoKey) return;
      if (!prevPadAssignments) return;
      event.preventDefault();
      setPadAssignments(prevPadAssignments);
      setPrevPadAssignments(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [prevPadAssignments]);

  return (
    <AppShell>
      <section className={layoutStyles.dashboard}>
        <aside className={controlStyles.controlPanel}>
          <KeySelector
            tonic={tonic}
            options={KEY_OPTIONS}
            onSelect={handleTonicSelect}
            disabled={isRecordingLocked}
          />
          <InstrumentSelector
            instrument={instrument}
            options={TONE_INSTRUMENTS}
            activeLabel={activeInstrumentLabel}
            onSelect={handleInstrumentSelect}
            disabled={isRecordingLocked}
          />
          <RecorderPanel
            bpm={recorder.bpm}
            timeSignature={recorder.timeSignature}
            availableSignatures={recorder.availableSignatures}
            transportState={recorder.transportState}
            currentPosition={recorder.currentPosition}
            maxBars={recorder.maxBars}
            hasTake={recorder.hasTake}
            onBpmChange={recorder.setBpm}
            onTimeSignatureChange={recorder.setTimeSignature}
            onToggleRec={recorder.toggleArm}
            onPlay={recorder.handlePlayPressed}
            onStop={recorder.handleStopPressed}
            onDownload={recorder.downloadCurrentTake}
            onClearRecording={recorder.clearRecording}
          />
        </aside>
        <section className={layoutStyles.padArea}>
          <PadGrid
            pads={pads}
            activePadIds={activePadIds}
            onPadPress={handlePadPress}
            onPadRelease={handlePadRelease}
            onPadDrop={handlePadDrop}
            onPadSizeChange={setPadSize}
          />
          <ChordLibraryPanel
            selection={librarySelection}
            onSelectionChange={setLibrarySelection}
            disabled={isRecordingLocked}
            padSize={padSize}
            onPreviewStart={handleLibraryPreviewStart}
            onPreviewEnd={handleLibraryPreviewEnd}
          />
        </section>
      </section>
    </AppShell>
  );
};
