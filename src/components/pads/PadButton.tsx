// src/components/pads/PadButton.tsx - 個別のコードパッドボタン
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import type { Pad } from '../../types/music';

type PadButtonProps = {
  pad: Pad;
  isActive: boolean;
  onPress: (pad: Pad) => Promise<void> | void;
  onRelease: (pad: Pad) => void;
};

export const PadButton = ({
  pad,
  isActive,
  onPress,
  onRelease,
}: PadButtonProps) => {
  const handlePointerDown = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    void onPress(pad);
  };

  const handlePointerUp = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    onRelease(pad);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void onPress(pad);
    }
  };

  const handleKeyUp = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRelease(pad);
    }
  };

  return (
    <button
      type="button"
      className={`pad pad--${pad.group}${isActive ? ' is-active' : ''}`}
      aria-pressed={isActive}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseLeave={() => onRelease(pad)}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onTouchCancel={() => onRelease(pad)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <span className="pad-index">{pad.keyBinding.label}</span>
      <span className="pad-label">{pad.roman}</span>
      <span className="pad-name">{pad.chordName}</span>
    </button>
  );
};
