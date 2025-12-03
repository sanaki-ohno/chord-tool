// src/components/controls/InstrumentSelector.tsx - 楽器選択UIコンポーネント
import type { InstrumentId, InstrumentOption } from '../../types/music';

type InstrumentSelectorProps = {
  instrument: InstrumentId;
  options: InstrumentOption[];
  activeLabel: string;
  onSelect: (instrument: InstrumentId) => void;
};

export const InstrumentSelector = ({
  instrument,
  options,
  activeLabel,
  onSelect,
}: InstrumentSelectorProps) => {
  return (
    <div className="panel-card">
      <div className="panel-header">
        <span className="panel-label">Instrument</span>
        <span className="panel-value">{activeLabel}</span>
      </div>
      <div className="pill-group">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`pill-button${
              instrument === option.id ? ' pill-button--active' : ''
            }`}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
