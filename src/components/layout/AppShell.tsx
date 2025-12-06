// src/components/layout/AppShell.tsx - 画面全体を包むレイアウトシェル
import type { PropsWithChildren } from 'react';
import styles from '../../styles/layout/AppLayout.module.css';

export const AppShell = ({ children }: PropsWithChildren) => {
  return (
    <div className={styles.app}>
      <div className={styles.appShell}>
        <header className={styles.appHero}>
          <div className={styles.heroBrand}>
            <div className={styles.logo}>CodeSampler</div>
            <div className={styles.heroMeta}>
              <span className={styles.heroChip}>Chord Lab</span>
              <span className={styles.heroChip}>32 Pad Grid</span>
            </div>
          </div>
          <div className={styles.heroStatus}>
            <span className={styles.statusDot} />
            <span>ONLINE</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};
