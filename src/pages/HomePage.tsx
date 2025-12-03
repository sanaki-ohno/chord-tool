// src/pages/HomePage.tsx - コードパッド画面のページコンテナ
import { useMemo, useState } from 'react';
import { KeySelector } from '../components/controls/KeySelector';
import { InstrumentSelector } from '../components/controls/InstrumentSelector';
import { AppShell } from '../components/layout/AppShell';
import { PadGrid } from '../components/pads/PadGrid';
import {
  DEFAULT_PAD_LAYOUT,
  KEY_OPTIONS,
  TONE_INSTRUMENTS,
} from '../config/keyOptions';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useChordPads } from '../hooks/useChordPads';
import type { InstrumentId, Tonic } from '../types/music';

export const HomePage = () => {
  const [tonic, setTonic] = useState<Tonic>('C');
  const [instrument, setInstrument] = useState<InstrumentId>('piano');

  const { synth, startAudioContext } = useAudioEngine(instrument);

  const layoutConfig = useMemo(() => DEFAULT_PAD_LAYOUT, []);

  const { pads, activePadIds, handlePadPress, handlePadRelease } =
    useChordPads({
      tonic,
      synth,
      startAudioContext,
      layoutConfig,
    });

  const activeInstrumentLabel =
    TONE_INSTRUMENTS.find((option) => option.id === instrument)?.label ?? '';

  return (
    <AppShell>
      <section className="dashboard">
        <aside className="control-panel">
          <KeySelector
            tonic={tonic}
            options={KEY_OPTIONS}
            onSelect={setTonic}
          />
          <InstrumentSelector
            instrument={instrument}
            options={TONE_INSTRUMENTS}
            activeLabel={activeInstrumentLabel}
            onSelect={setInstrument}
          />
        </aside>
        <PadGrid
          pads={pads}
          activePadIds={activePadIds}
          onPadPress={handlePadPress}
          onPadRelease={handlePadRelease}
        />
      </section>
    </AppShell>
  );
};
