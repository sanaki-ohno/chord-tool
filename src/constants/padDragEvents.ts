import type { PadDropSource, PadColor } from '../types/music';

export const PAD_DRAG_HOVER_EVENT = 'pad-external-drag-hover';
export const PAD_DRAG_DROP_EVENT = 'pad-external-drag-drop';
export const PAD_DRAG_PREVIEW_EVENT = 'pad-external-drag-preview';

export type PadDragHoverDetail = {
  padId: string | null;
};

export type PadDragDropDetail = {
  targetPadId?: string | null;
  source: PadDropSource;
};

export type PadDragPreviewDetail = {
  x: number;
  y: number;
  label: string;
  isActive: boolean;
  sourceType: 'pad' | 'library';
  padColor?: PadColor;
  isBlank?: boolean;
  padRoman?: string;
  padChordName?: string;
  padIndexLabel?: string;
};

export const dispatchPadDragHover = (padId: string | null) => {
  window.dispatchEvent(
    new CustomEvent<PadDragHoverDetail>(PAD_DRAG_HOVER_EVENT, {
      detail: { padId },
    })
  );
};

export const dispatchPadDragDrop = (
  targetPadId: string | null | undefined,
  source: PadDropSource
) => {
  window.dispatchEvent(
    new CustomEvent<PadDragDropDetail>(PAD_DRAG_DROP_EVENT, {
      detail: { targetPadId, source },
    })
  );
};

export const dispatchPadDragPreview = (
  detail: PadDragPreviewDetail
) => {
  window.dispatchEvent(
    new CustomEvent<PadDragPreviewDetail>(PAD_DRAG_PREVIEW_EVENT, {
      detail,
    })
  );
};
