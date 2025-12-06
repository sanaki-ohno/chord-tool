// src/components/controls/KeySelector.tsx - 調選択ピルボタン群のコンポーネント
import type { KeyOption, Tonic } from '../../types/music';
import styles from '../../styles/controls/ControlPanel.module.css';

type KeySelectorProps = {
  tonic: Tonic;
  options: KeyOption[];
  onSelect: (tonic: Tonic) => void;
  disabled?: boolean;
};

export const KeySelector = ({
  tonic,
  options,
  onSelect,
  disabled = false,
}: KeySelectorProps) => {
  const cardClassName = `${styles.panelCard}${
    disabled ? ` ${styles.panelCardDisabled}` : ''
  }`;
  return (
    <div className={cardClassName}>
      <div className={styles.panelHeader}>
        <span className={styles.panelLabel}>Key Matrix</span>
        <span className={styles.panelValue}>{tonic}</span>
      </div>
      <div className={styles.keySelector}>
        <div className={styles.keyGrid}>
          {options.map((key) => (
            <button
              key={key.id}
              type="button"
              className={`${styles.pillButton}${
                tonic === key.id ? ` ${styles.pillButtonActive}` : ''
              }`}
              disabled={disabled}
              onClick={() => onSelect(key.id)}
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
