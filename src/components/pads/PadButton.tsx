// src/components/pads/PadButton.tsx - 個別のコードパッドボタン
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type TouchEvent,
} from 'react';
import type { Pad } from '../../types/music';
import styles from '../../styles/pads/PadPanel.module.css';

const PAD_GROUP_CLASS: Record<Pad['group'], string> = {
  diatonic: styles.padDiatonic,
  secondary: styles.padSecondary,
  subMinor: styles.padSubMinor,
  pop: styles.padPop,
};

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

  const buttonClassName = [
    styles.pad,
    PAD_GROUP_CLASS[pad.group],
    isActive ? styles.padActive : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={buttonClassName}
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
      <span className={styles.padIndex}>{pad.keyBinding.label}</span>
      <span className={styles.padLabel}>{pad.roman}</span>
      <span className={styles.padName}>{pad.chordName}</span>
    </button>
  );
};
