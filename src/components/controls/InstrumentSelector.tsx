// src/components/controls/InstrumentSelector.tsx - 楽器選択UIコンポーネント
import type { InstrumentId, InstrumentOption } from '../../types/music';
import styles from '../../styles/controls/ControlPanel.module.css';

type InstrumentSelectorProps = {
  instrument: InstrumentId;
  options: InstrumentOption[];
  activeLabel: string;
  onSelect: (instrument: InstrumentId) => void;
  disabled?: boolean;
};

export const InstrumentSelector = ({
  instrument,
  options,
  activeLabel,
  onSelect,
  disabled = false,
}: InstrumentSelectorProps) => {
  const cardClassName = `${styles.panelCard}${
    disabled ? ` ${styles.panelCardDisabled}` : ''
  }`;
  return (
    <div className={cardClassName}>
      <div className={styles.panelHeader}>
        <span className={styles.panelLabel}>Instrument</span>
        <span className={styles.panelValue}>{activeLabel}</span>
      </div>
      <div className={styles.pillGroup}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`${styles.pillButton}${
              instrument === option.id ? ` ${styles.pillButtonActive}` : ''
            }`}
            disabled={disabled}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
