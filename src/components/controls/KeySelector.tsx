// src/components/controls/KeySelector.tsx - 調選択ピルボタン群のコンポーネント
import type { KeyOption, Tonic } from '../../types/music';

type KeySelectorProps = {
  tonic: Tonic;
  options: KeyOption[];
  onSelect: (tonic: Tonic) => void;
};

export const KeySelector = ({ tonic, options, onSelect }: KeySelectorProps) => {
  return (
    <div className="panel-card">
      <div className="panel-header">
        <span className="panel-label">Key Matrix</span>
        <span className="panel-value">{tonic}</span>
      </div>
      <div className="key-selector">
        <div className="key-grid">
          {options.map((key) => (
            <button
              key={key.id}
              type="button"
              className={`pill-button${tonic === key.id ? ' pill-button--active' : ''}`}
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
