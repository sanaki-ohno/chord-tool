// src/components/pads/PadGrid.tsx - 32個のパッドを並べるラッパー
import type { Pad } from '../../types/music';
import styles from '../../styles/pads/PadPanel.module.css';
import { PadButton } from './PadButton';

type PadGridProps = {
  pads: Pad[];
  activePadIds: string[];
  onPadPress: (pad: Pad) => Promise<void> | void;
  onPadRelease: (pad: Pad) => void;
};

export const PadGrid = ({
  pads,
  activePadIds,
  onPadPress,
  onPadRelease,
}: PadGridProps) => {
  return (
    <section className={styles.padPanel}>
      <div className={styles.padPanelHeader}>
        <span className={styles.panelLabel}>Chord Pads</span>
        <span className={styles.panelValue}>{pads.length} slots</span>
      </div>
      <div className={styles.padGrid}>
        {pads.map((pad) => (
          <PadButton
            key={pad.id}
            pad={pad}
            isActive={activePadIds.includes(pad.id)}
            onPress={onPadPress}
            onRelease={onPadRelease}
          />
        ))}
      </div>
    </section>
  );
};
