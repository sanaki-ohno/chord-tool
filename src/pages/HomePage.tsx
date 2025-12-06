// src/pages/HomePage.tsx - コードパッド画面のページコンテナ
import { useMemo, useState } from 'react';
import { KeySelector } from '../components/controls/KeySelector';
import { InstrumentSelector } from '../components/controls/InstrumentSelector';
import { AppShell } from '../components/layout/AppShell';
import { PadGrid } from '../components/pads/PadGrid';
import { RecorderPanel } from '../components/recorder/RecorderPanel';
import {
  DEFAULT_PAD_LAYOUT,
  KEY_OPTIONS,
  TONE_INSTRUMENTS,
} from '../config/keyOptions';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useChordPads } from '../hooks/useChordPads';
import { useRecorder } from '../hooks/useRecorder';
import type { InstrumentId, Tonic } from '../types/music';
import layoutStyles from '../styles/layout/AppLayout.module.css';
import controlStyles from '../styles/controls/ControlPanel.module.css';

export const HomePage = () => {
  const [tonic, setTonic] = useState<Tonic>('C');
  const [instrument, setInstrument] = useState<InstrumentId>('piano');

  const { synth, startAudioContext } = useAudioEngine(instrument);

  const recorder = useRecorder({ synth, startAudioContext });

  const layoutConfig = useMemo(() => DEFAULT_PAD_LAYOUT, []);

  const { pads, activePadIds, handlePadPress, handlePadRelease } =
    useChordPads({
      tonic,
      synth,
      startAudioContext,
      layoutConfig,
      padEventHandlers: {
        onPadPress: recorder.handlePadPress,
        onPadRelease: recorder.handlePadRelease,
      },
    });

  const activeInstrumentLabel =
    TONE_INSTRUMENTS.find((option) => option.id === instrument)?.label ?? '';

  const isRecordingLocked =
    recorder.transportState === 'recording' ||
    recorder.transportState === 'count-in';

  const handleTonicSelect = (nextTonic: Tonic) => {
    if (isRecordingLocked) return;
    setTonic(nextTonic);
  };

  const handleInstrumentSelect = (nextInstrument: InstrumentId) => {
    if (isRecordingLocked) return;
    setInstrument(nextInstrument);
  };

  return (
    <AppShell>
      <section className={layoutStyles.dashboard}>
        <aside className={controlStyles.controlPanel}>
          <KeySelector
            tonic={tonic}
            options={KEY_OPTIONS}
            onSelect={handleTonicSelect}
            disabled={isRecordingLocked}
          />
          <InstrumentSelector
            instrument={instrument}
            options={TONE_INSTRUMENTS}
            activeLabel={activeInstrumentLabel}
            onSelect={handleInstrumentSelect}
            disabled={isRecordingLocked}
          />
          <RecorderPanel
            bpm={recorder.bpm}
            timeSignature={recorder.timeSignature}
            availableSignatures={recorder.availableSignatures}
            transportState={recorder.transportState}
            currentPosition={recorder.currentPosition}
            maxBars={recorder.maxBars}
            hasTake={recorder.hasTake}
            onBpmChange={recorder.setBpm}
            onTimeSignatureChange={recorder.setTimeSignature}
            onToggleRec={recorder.toggleArm}
            onPlay={recorder.handlePlayPressed}
            onStop={recorder.handleStopPressed}
            onDownload={recorder.downloadCurrentTake}
          />
        </aside>
        <section className={layoutStyles.padArea}>
          <PadGrid
            pads={pads}
            activePadIds={activePadIds}
            onPadPress={handlePadPress}
            onPadRelease={handlePadRelease}
          />
        </section>
      </section>
    </AppShell>
  );
};
