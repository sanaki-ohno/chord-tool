// src/components/pads/PadButton.tsx - 個別のコードパッドボタン
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useRef } from 'react';
import type { Pad, PadColor, PadDropSource } from '../../types/music';
import styles from '../../styles/pads/PadPanel.module.css';
import { dispatchPadDragPreview } from '../../constants/padDragEvents';

const PAD_COLOR_CLASS: Record<PadColor, string> = {
  row1: styles.padColorRow1,
  row2: styles.padColorRow2,
  row3: styles.padColorRow3,
  row4: styles.padColorRow4,
};

type PadButtonProps = {
  pad: Pad;
  isActive: boolean;
  isBlank?: boolean;
  isDragTarget?: boolean;
  onPress: (pad: Pad) => Promise<void> | void;
  onRelease: (pad: Pad) => void;
  onPadDrop?: (targetPadId: string, source: PadDropSource) => void;
  onDragHoverChange?: (padId: string | null) => void;
  resolvePadIdFromPoint?: (x: number, y: number) => string | null;
  padRow?: number;
};

export const PadButton = ({
  pad,
  isActive,
  isBlank,
  isDragTarget,
  onPress,
  onRelease,
  onPadDrop,
  onDragHoverChange,
  resolvePadIdFromPoint,
  padRow,
}: PadButtonProps) => {
  const pointerIdRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const noteOnRef = useRef(false);

  const DRAG_THRESHOLD_PX = 8;

  const dragLabel =
    pad.chordName || pad.roman || pad.keyBinding.label || pad.id;
  const dragRoman = pad.roman;
  const dragChordName = pad.chordName;
  const dragIndexLabel = pad.keyBinding.label;

  const triggerPress = () => {
    if (noteOnRef.current) return;
    noteOnRef.current = true;
    void onPress(pad);
  };

  const triggerRelease = () => {
    if (!noteOnRef.current) return;
    noteOnRef.current = false;
    onRelease(pad);
  };

  const clearDragState = () => {
    pointerIdRef.current = null;
    dragStartRef.current = null;
    isDraggingRef.current = false;
  };

  const resolvePadId = (event: ReactPointerEvent<HTMLButtonElement>) => {
    return resolvePadIdFromPoint?.(event.clientX, event.clientY) ?? null;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerIdRef.current = event.pointerId;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    isDraggingRef.current = false;
    triggerPress(); // 押した瞬間に音を鳴らす
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    if (!dragStartRef.current) return;

    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    const distance = Math.hypot(dx, dy);

    // 一定距離動いたらドラッグ開始扱いにして音を止める
    if (!isDraggingRef.current && distance > DRAG_THRESHOLD_PX) {
      isDraggingRef.current = true;
      triggerRelease();
    }

    if (isDraggingRef.current) {
      event.preventDefault();

      // ホバー中パッドをローカルに更新（入れ替え用）
      const targetPadId = resolvePadId(event);
      onDragHoverChange?.(targetPadId);

      // ゴーストの位置更新
      dispatchPadDragPreview({
        x: event.clientX,
        y: event.clientY,
        label: dragLabel,
        isActive: true,
        sourceType: 'pad',
        padColor: pad.color,
        isBlank: isBlank === true,
        padRoman: dragRoman,
        padChordName: dragChordName,
        padIndexLabel: dragIndexLabel,
      });
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;

    if (event.type === 'pointerup') {
      event.preventDefault();
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (isDraggingRef.current) {
      // ドラッグ終了：ホバーしているパッドにドロップ
      const targetPadId = resolvePadId(event);
      if (targetPadId) {
        onPadDrop?.(targetPadId, { type: 'pad', padId: pad.id });
      }
    } else {
      // 単なるタップ／クリック
      triggerRelease();
    }

    onDragHoverChange?.(null);

    // ゴーストを消す
    dispatchPadDragPreview({
      x: event.clientX,
      y: event.clientY,
      label: '',
      isActive: false,
      sourceType: 'pad',
      padColor: pad.color,
      isBlank: isBlank === true,
      padRoman: dragRoman,
      padChordName: dragChordName,
      padIndexLabel: dragIndexLabel,
    });

    clearDragState();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerPress();
    }
  };

  const handleKeyUp = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerRelease();
    }
  };

  const buttonClassName = [
    styles.pad,
    PAD_COLOR_CLASS[pad.color],
    isActive ? styles.padActive : '',
    isBlank ? styles.padBlank : '',
    isDragTarget ? styles.padDragTarget : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={buttonClassName}
      aria-pressed={isActive}
      data-pad-id={pad.id}
      data-pad-row={padRow}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <span className={styles.padIndex}>{pad.keyBinding.label}</span>
      <span className={styles.padLabel}>{isBlank ? '–' : pad.roman}</span>
      <span className={styles.padName}>{isBlank ? '—' : pad.chordName}</span>
    </button>
  );
};
