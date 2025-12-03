// src/components/layout/AppShell.tsx - 画面全体を包むレイアウトシェル
import type { PropsWithChildren } from 'react';

export const AppShell = ({ children }: PropsWithChildren) => {
  return (
    <div className="app">
      <div className="app-shell">
        <header className="app-hero">
          <div className="hero-brand">
            <div className="logo">CodeSampler</div>
            <div className="hero-meta">
              <span className="hero-chip">Chord Lab</span>
              <span className="hero-chip">32 Pad Grid</span>
            </div>
          </div>
          <div className="hero-status">
            <span className="status-dot" />
            <span>ONLINE</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};
