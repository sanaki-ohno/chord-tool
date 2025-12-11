// src/components/controls/ChordLibraryPanel.tsx - コードライブラリ選択とドラッグソース
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChordLibrarySelection,
  PadDropSource,
  Tonic,
} from '../../types/music';
import controlStyles from '../../styles/controls/ControlPanel.module.css';
import styles from '../../styles/controls/ChordLibraryPanel.module.css';
import {
  dispatchPadDragDrop,
  dispatchPadDragHover,
  dispatchPadDragPreview,
} from '../../constants/padDragEvents';

const ROOT_NOTES: Tonic[] = [
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

type BassOption = Tonic | 'none';

const BASS_NOTES: BassOption[] = ['none', ...ROOT_NOTES];

const CHORD_TYPE_OPTIONS: { id: string; label: string }[] = [
  { id: 'maj', label: 'Maj' },
  { id: '6', label: '6' },
  { id: 'maj7', label: 'Maj7' },
  { id: 'maj9', label: 'Maj9' },
  { id: 'add9', label: 'Add9' },
  { id: 'add11', label: 'Add11' },
  { id: 'sus2', label: 'Sus2' },
  { id: 'sus4', label: 'Sus4' },
  { id: 'aug', label: 'Aug' },
  { id: 'aug7', label: 'Aug7' },
  { id: '7', label: '7' },
  { id: '9', label: '9' },
  { id: '13', label: '13' },
  { id: '7sus4', label: '7sus4' },
  { id: '7b9', label: '7b9' },
  { id: '7#9', label: '7#9' },
  { id: 'm', label: 'Min' },
  { id: 'm6', label: 'm6' },
  { id: 'm7', label: 'm7' },
  { id: 'm9', label: 'm9' },
  { id: 'm11', label: 'm11' },
  { id: 'mMaj7', label: 'mMaj7' },
  { id: 'dim', label: 'Dim' },
  { id: 'm7b5', label: 'm7b5' },
];

type ChordLibraryPanelProps = {
  selection: ChordLibrarySelection;
  onSelectionChange: (selection: ChordLibrarySelection) => void;
  disabled?: boolean;
  padSize?: number | null;
  onPreviewStart?: () => Promise<void> | void;
  onPreviewEnd?: () => void;
};

export const ChordLibraryPanel = ({
  selection,
  onSelectionChange,
  disabled,
  padSize,
  onPreviewStart,
  onPreviewEnd,
}: ChordLibraryPanelProps) => {
  const [isBassOpen, setIsBassOpen] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const previewPointerIdRef = useRef<number | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragActiveRef = useRef(false);
  const [isTileDragging, setIsTileDragging] = useState(false);
  const DRAG_THRESHOLD_PX = 8;

  const handleRootSelect = (rootNote: Tonic) => {
    if (disabled) return;
    onSelectionChange({ ...selection, rootNote });
  };

  const handleChordTypeSelect = (chordTypeId: string) => {
    if (disabled) return;
    onSelectionChange({ ...selection, chordTypeId });
  };

  const handleBassSelect = (bass: BassOption) => {
    if (disabled) return;
    onSelectionChange({
      ...selection,
      bassNote: bass === 'none' ? undefined : bass,
    });
  };

  const sectionClass = styles.section;
  const choiceClass = (isActive: boolean) =>
    [
      styles.choiceButton,
      isActive ? styles.choiceButtonActive : '',
    ]
      .filter(Boolean)
      .join(' ');

  const chordLabel =
    CHORD_TYPE_OPTIONS.find(
      (option) => option.id === selection.chordTypeId
    )?.label ?? selection.chordTypeId;

  const dragLabel = selection.bassNote
    ? `${selection.rootNote}${chordLabel}/${selection.bassNote}`
    : `${selection.rootNote}${chordLabel}`;

  const startPreview = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || isPreviewActive) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    previewPointerIdRef.current = event.pointerId;
    setIsPreviewActive(true);
    void onPreviewStart?.();
  };

  const stopPreview = useCallback(() => {
    if (!isPreviewActive) return;
    previewPointerIdRef.current = null;
    setIsPreviewActive(false);
    onPreviewEnd?.();
  }, [isPreviewActive, onPreviewEnd]);

  useEffect(() => {
    const handleWindowPointerUp = (event: PointerEvent) => {
      if (previewPointerIdRef.current !== event.pointerId) return;
      stopPreview();
    };

    const handleWindowPointerCancel = (event: PointerEvent) => {
      if (previewPointerIdRef.current !== event.pointerId) return;
      stopPreview();
    };

    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerCancel);

    return () => {
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerCancel);
    };
  }, [stopPreview]);

  const resolvePadIdFromPoint = (clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY);
    if (!element) return null;
    const padElement = element.closest<HTMLElement>('[data-pad-id]');
    if (!padElement) return null;
    const padGrid = padElement.closest('[data-pad-grid="true"]');
    if (!padGrid) return null;
    return padElement.getAttribute('data-pad-id');
  };

  const handleTilePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragPointerIdRef.current = event.pointerId;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    dragActiveRef.current = false;
    startPreview(event);
  };

const beginTileDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
  dragActiveRef.current = true;
  setIsTileDragging(true);
  stopPreview();
  dispatchPadDragPreview({
    x: event.clientX,
    y: event.clientY,
    label: dragLabel,
    isActive: true,
    sourceType: 'library',
  });
  const padId = resolvePadIdFromPoint(event.clientX, event.clientY);
  dispatchPadDragHover(padId ?? null);
};

  const handleTilePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;
    if (!dragStartRef.current) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    const distance = Math.hypot(dx, dy);

    if (!dragActiveRef.current && distance > DRAG_THRESHOLD_PX) {
      beginTileDrag(event);
    }

  if (dragActiveRef.current) {
    event.preventDefault();
    dispatchPadDragPreview({
      x: event.clientX,
      y: event.clientY,
      label: dragLabel,
      isActive: true,
      sourceType: 'library',
    });
    const padId = resolvePadIdFromPoint(event.clientX, event.clientY);
    dispatchPadDragHover(padId ?? null);
  }
};

  const dispatchDrop = (targetPadId: string | null) => {
    if (!targetPadId) return;
    const source: PadDropSource = { type: 'library' };
    dispatchPadDragDrop(targetPadId, source);
  };

  const resetDragState = () => {
    dragPointerIdRef.current = null;
    dragStartRef.current = null;
    dragActiveRef.current = false;
    setIsTileDragging(false);
  };

  const handleTilePointerEnd = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (dragPointerIdRef.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const wasDragging = dragActiveRef.current;
  if (wasDragging) {
    const targetPadId = resolvePadIdFromPoint(event.clientX, event.clientY);
    dispatchDrop(targetPadId);
  } else {
    stopPreview();
  }
  dispatchPadDragPreview({
    x: event.clientX,
    y: event.clientY,
    label: '',
    isActive: false,
    sourceType: 'library',
  });
  dispatchPadDragHover(null);
  resetDragState();
};

  const handleTilePointerCancel = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (dragPointerIdRef.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  if (!dragActiveRef.current) {
    stopPreview();
  }
  dispatchPadDragPreview({
    x: event.clientX,
    y: event.clientY,
    label: '',
    isActive: false,
    sourceType: 'library',
  });
  dispatchPadDragHover(null);
  resetDragState();
};

  return (
    <section
      className={[
        controlStyles.panelCard,
        styles.libraryPanel,
        disabled ? controlStyles.panelCardDisabled : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={controlStyles.panelHeader}>
        <span className={controlStyles.panelLabel}>Chord Library</span>
        <span className={controlStyles.panelValue}>Drag to assign</span>
      </div>
      <div className={styles.libraryRow}>
        <div
          className={styles.dragTileWrapper}
          style={
            padSize
              ? ({ '--drag-tile-size': `${padSize}px` } as CSSProperties)
              : undefined
          }
        >
          <div
            className={[
              styles.dragTile,
              isTileDragging ? styles.dragTileDragging : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onPointerDown={handleTilePointerDown}
            onPointerMove={handleTilePointerMove}
            onPointerUp={handleTilePointerEnd}
            onPointerCancel={handleTilePointerCancel}
          >
            <span className={styles.dragTileHint}>Drag</span>
            <span className={styles.dragTileLabel}>{dragLabel}</span>
          </div>
        </div>
        <div className={sectionClass}>
          <span className={styles.sectionLabel}>Root</span>
          <div className={styles.buttonGrid} data-pad-input-lock="true">
            {ROOT_NOTES.map((note) => (
              <button
                key={note}
                type="button"
                className={choiceClass(selection.rootNote === note)}
                onClick={() => handleRootSelect(note)}
                disabled={disabled}
              >
                {note}
              </button>
            ))}
          </div>
          <div className={styles.bassSection}>
            <button
              type="button"
              className={[
                styles.bassToggle,
                isBassOpen ? styles.bassToggleActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (disabled) return;
                setIsBassOpen((open) => !open);
              }}
              disabled={disabled}
            >
              <span className={styles.bassToggleLabel}>Bass / Slash</span>
              <span className={styles.bassToggleCaret}>
                {isBassOpen ? '−' : '+'}
              </span>
            </button>
            {isBassOpen && (
              <div className={styles.buttonGrid} data-pad-input-lock="true">
                {BASS_NOTES.map((bass) => {
                  const isNone = bass === 'none';
                  const isActive =
                    (!selection.bassNote && isNone) ||
                    selection.bassNote === bass;

                  return (
                    <button
                      key={bass}
                      type="button"
                      className={choiceClass(isActive)}
                      onClick={() => handleBassSelect(bass)}
                      disabled={disabled}
                    >
                      {isNone ? 'None' : bass}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className={`${sectionClass} ${styles.chordSection}`}>
          <span className={styles.sectionLabel}>Chord</span>
          <div className={styles.buttonGrid} data-pad-input-lock="true">
            {CHORD_TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={choiceClass(selection.chordTypeId === option.id)}
                onClick={() => handleChordTypeSelect(option.id)}
                disabled={disabled}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
