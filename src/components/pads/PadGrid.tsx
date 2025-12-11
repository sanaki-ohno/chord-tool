// src/components/pads/PadGrid.tsx - 32個のパッドを並べるラッパー
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Pad, PadColor, PadDropSource } from '../../types/music';
import styles from '../../styles/pads/PadPanel.module.css';
import libraryStyles from '../../styles/controls/ChordLibraryPanel.module.css';
import { PadButton } from './PadButton';
import {
  PAD_DRAG_DROP_EVENT,
  PAD_DRAG_HOVER_EVENT,
  PAD_DRAG_PREVIEW_EVENT,
  type PadDragDropDetail,
  type PadDragHoverDetail,
  type PadDragPreviewDetail,
} from '../../constants/padDragEvents';

const PAD_COLOR_CLASS: Record<PadColor, string> = {
  row1: styles.padColorRow1,
  row2: styles.padColorRow2,
  row3: styles.padColorRow3,
  row4: styles.padColorRow4,
};

type PadGridProps = {
  pads: Pad[];
  activePadIds: string[];
  onPadPress: (pad: Pad) => Promise<void> | void;
  onPadRelease: (pad: Pad) => void;
  onPadDrop?: (targetPadId: string, source: PadDropSource) => void;
  onPadSizeChange?: (size: number) => void;
};

export const PadGrid = ({
  pads,
  activePadIds,
  onPadPress,
  onPadRelease,
  onPadDrop,
  onPadSizeChange,
}: PadGridProps) => {
  const [dragOverPadId, setDragOverPadId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<PadDragPreviewDetail>({
    x: 0,
    y: 0,
    label: '',
    isActive: false,
    sourceType: 'pad',
    padColor: undefined,
    isBlank: false,
    padRoman: '',
    padChordName: '',
    padIndexLabel: '',
  });
  const [padSizePx, setPadSizePx] = useState<number | null>(null);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const dragOverPadIdRef = useRef<string | null>(null);

  useEffect(() => {
    dragOverPadIdRef.current = dragOverPadId;
  }, [dragOverPadId]);

  // パッドのサイズ計算（既存ロジック）
  useEffect(() => {
    if (!gridRef.current) return;
    const node = gridRef.current;

    const computePadSize = () => {
      const styles = getComputedStyle(node);
      const gap = parseFloat(styles.getPropertyValue('column-gap')) || 0;
      const template = styles.getPropertyValue('grid-template-columns');
      const columns =
        template
          .trim()
          .split(/\s+/)
          .filter((token) => token !== '/').length || 8;
      const width = node.clientWidth;
      const padWidth = (width - gap * (columns - 1)) / columns;
      if (!Number.isNaN(padWidth) && padWidth > 0) {
        setPadSizePx(padWidth);
        onPadSizeChange?.(padWidth);
      }
    };

    computePadSize();
    const observer = new ResizeObserver(() => {
      computePadSize();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [onPadSizeChange]);

  // 座標からパッドIDを引く（PadButton のドラッグにも使う）
  const resolvePadIdFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const element = document.elementFromPoint(clientX, clientY);
      if (!element) return null;
      const padElement = element.closest<HTMLElement>('[data-pad-id]');
      if (!padElement) return null;
      if (gridRef.current && !gridRef.current.contains(padElement)) {
        return null;
      }
      return padElement.dataset.padId ?? null;
    },
    []
  );

  // PadButton 経由の pad→pad ドロップ
  const handlePadDropInternal = useCallback(
    (padId: string, source: PadDropSource) => {
      setDragOverPadId(null);
      setDragPreview((prev) => ({ ...prev, isActive: false }));
      onPadDrop?.(padId, source);
    },
    [onPadDrop]
  );

  // ライブラリなど外部ソースからのドラッグイベント
  useEffect(() => {
    const handleExternalHover = (event: Event) => {
      const customEvent = event as CustomEvent<PadDragHoverDetail>;
      setDragOverPadId(customEvent.detail.padId ?? null);
    };

    const handleExternalDrop = (event: Event) => {
      const customEvent = event as CustomEvent<PadDragDropDetail>;
      const resolvedTarget =
        customEvent.detail.targetPadId ?? dragOverPadIdRef.current;
      if (!resolvedTarget) {
        setDragOverPadId(null);
        setDragPreview((prev) => ({ ...prev, isActive: false }));
        return;
      }
      setDragOverPadId(null);
      setDragPreview((prev) => ({ ...prev, isActive: false }));
      onPadDrop?.(resolvedTarget, customEvent.detail.source);
    };

    const handlePreview = (event: Event) => {
      const customEvent = event as CustomEvent<PadDragPreviewDetail>;
      setDragPreview(customEvent.detail);
      if (!customEvent.detail.isActive) {
        setDragOverPadId(null);
      }
    };

    window.addEventListener(
      PAD_DRAG_HOVER_EVENT,
      handleExternalHover as EventListener
    );
    window.addEventListener(
      PAD_DRAG_DROP_EVENT,
      handleExternalDrop as EventListener
    );
    window.addEventListener(
      PAD_DRAG_PREVIEW_EVENT,
      handlePreview as EventListener
    );

    return () => {
      window.removeEventListener(
        PAD_DRAG_HOVER_EVENT,
        handleExternalHover as EventListener
      );
      window.removeEventListener(
        PAD_DRAG_DROP_EVENT,
        handleExternalDrop as EventListener
      );
      window.removeEventListener(
        PAD_DRAG_PREVIEW_EVENT,
        handlePreview as EventListener
      );
    };
  }, [onPadDrop]);

  return (
    <section className={styles.padPanel}>
      <div className={styles.padPanelHeader}>
        <span className={styles.panelLabel}>Chord Pads</span>
        <span className={styles.panelValue}>{pads.length} slots</span>
      </div>
      <div className={styles.padGrid} ref={gridRef} data-pad-grid="true">
        {pads.map((pad, index) => (
          <PadButton
            key={pad.id}
            pad={pad}
            isActive={activePadIds.includes(pad.id)}
            isBlank={pad.notes.length === 0}
            isDragTarget={dragOverPadId === pad.id}
            onPress={onPadPress}
            onRelease={onPadRelease}
            onPadDrop={handlePadDropInternal}
            onDragHoverChange={setDragOverPadId}
            resolvePadIdFromPoint={resolvePadIdFromPoint}
            padRow={Math.floor(index / 8) + 1}
          />
        ))}
      </div>
      {dragPreview.isActive && (
        <div
          className={styles.padDragPreview}
          style={{
            left: `${dragPreview.x}px`,
            top: `${dragPreview.y}px`,
          }}
        >
          {dragPreview.sourceType === 'pad' ? (
            <div
              className={[
                styles.pad,
                dragPreview.padColor
                  ? PAD_COLOR_CLASS[dragPreview.padColor]
                  : '',
                dragPreview.isBlank ? styles.padBlank : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                padSizePx
                  ? { width: `${padSizePx}px`, height: `${padSizePx}px` }
                  : undefined
              }
            >
              <span className={styles.padIndex}>
                {dragPreview.padIndexLabel ?? ''}
              </span>
              <span className={styles.padLabel}>
                {dragPreview.isBlank
                  ? '–'
                  : dragPreview.padRoman ?? dragPreview.label}
              </span>
              <span className={styles.padName}>
                {dragPreview.isBlank
                  ? '—'
                  : dragPreview.padChordName ?? dragPreview.label}
              </span>
            </div>
          ) : (
            <div
              className={[
                libraryStyles.dragTile,
                dragPreview.isActive ? libraryStyles.dragTileDragging : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                padSizePx
                  ? { width: `${padSizePx}px`, height: `${padSizePx}px` }
                  : undefined
              }
            >
              <span className={libraryStyles.dragTileHint}>Drag</span>
              <span className={libraryStyles.dragTileLabel}>
                {dragPreview.label}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
