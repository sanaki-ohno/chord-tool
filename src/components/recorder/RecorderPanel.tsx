// src/components/recorder/RecorderPanel.tsx - 録音制御パネル
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { TimeSignature, TransportState } from '../../types/recorder';
import styles from '../../styles/recorder/RecorderPanel.module.css';
import googleIcon from '../../assets/icon_google.svg';

const formatTimeSignature = (sig: TimeSignature) => `${sig.numerator}/${sig.denominator}`;
const BPM_MIN = 1;
const BPM_MAX = 200;
const BPM_ERROR_MESSAGE = 'Please enter a BPM value between 1 and 200.';

type RecorderPanelProps = {
  bpm: number;
  timeSignature: TimeSignature;
  availableSignatures: TimeSignature[];
  transportState: TransportState;
  currentPosition: { bar: number; beat: number };
  maxBars: number;
  hasTake: boolean;
  onBpmChange: (value: number) => void;
  onTimeSignatureChange: (sig: TimeSignature) => void;
  onToggleRec: () => void;
  onPlay: () => void;
  onStop: () => void;
  onDownload: () => void;
  onClearRecording?: () => void;
};

export const RecorderPanel = ({
  bpm,
  timeSignature,
  availableSignatures,
  transportState,
  currentPosition,
  maxBars,
  hasTake,
  onBpmChange,
  onTimeSignatureChange,
  onToggleRec,
  onPlay,
  onStop,
  onDownload,
  onClearRecording,
}: RecorderPanelProps) => {
  const { user, signInWithGoogle } = useAuth();
  const isCapturing =
    transportState === 'recording' || transportState === 'count-in';
  const disableTempoControls = isCapturing;
  const playDisabled =
    (transportState === 'idle' && !hasTake) ||
    transportState === 'playing' ||
    isCapturing;
  const stopDisabled = transportState === 'idle';
  const downloadDisabled = !hasTake || transportState !== 'idle';
  const recArmed = transportState === 'armed' || isCapturing;
  const stateClassName =
    transportState === 'recording' || transportState === 'count-in'
      ? styles.stateRecording
      : transportState === 'playing'
        ? styles.statePlaying
        : transportState === 'armed'
          ? styles.stateArmed
          : '';
  const isPlayingBack = transportState === 'playing';
  const [bpmInput, setBpmInput] = useState(() => bpm.toString());
  const [bpmError, setBpmError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setBpmInput(bpm.toString());
    setBpmError(null);
  }, [bpm]);

  const handleBpmInput = (event: ChangeEvent<HTMLInputElement>) => {
    setBpmInput(event.target.value);
    if (bpmError) setBpmError(null);
  };

  const commitBpmInput = () => {
    if (disableTempoControls) return;
    const trimmed = bpmInput.trim();
    if (trimmed === '') {
      setBpmError(BPM_ERROR_MESSAGE);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setBpmError(BPM_ERROR_MESSAGE);
      return;
    }
    const clamped = Math.min(BPM_MAX, Math.max(BPM_MIN, parsed));
    if (clamped !== parsed) {
      setBpmError(BPM_ERROR_MESSAGE);
    } else {
      setBpmError(null);
    }
    setBpmInput(clamped.toString());
    onBpmChange(clamped);
  };

  const handleBpmKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitBpmInput();
    }
  };

  const handleSignatureInput = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const next = availableSignatures.find(
      (option) => formatTimeSignature(option) === value
    );
    if (next) onTimeSignatureChange(next);
  };

  const handleDownloadClick = () => {
    if (downloadDisabled) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    onDownload();
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
  };

  const handleModalSignIn = async () => {
    await signInWithGoogle();
    setShowLoginModal(false);
  };

  const prevUserRef = useRef(user);
  useEffect(() => {
    if (!user && prevUserRef.current) {
      onClearRecording?.();
    }
    prevUserRef.current = user;
  }, [user, onClearRecording]);

  return (
    <section className={styles.recorderPanel} aria-live="polite">
      <header className={styles.panelHeader}>
        <div className={styles.titleGroup}>
          <span className={styles.panelLabel}>Recorder</span>
          <span className={`${styles.stateBadge} ${stateClassName}`}>
            {transportState.toUpperCase()}
          </span>
        </div>
        <div className={styles.barCounter}>
          <span>BAR</span>
          <span className={styles.barCurrent}>
            {currentPosition.bar.toString().padStart(2, '0')}
          </span>
          <span>/ {maxBars}</span>
        </div>
      </header>

      <div className={styles.metricsRow}>
        <label className={styles.field}>
          <span>BPM</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={bpmInput}
            disabled={disableTempoControls}
            onChange={handleBpmInput}
            onBlur={commitBpmInput}
            onKeyDown={handleBpmKeyDown}
            aria-invalid={Boolean(bpmError)}
            className={bpmError ? styles.inputError : undefined}
            data-pad-input-lock="true"
          />
          <span
            className={`${styles.fieldHint} ${bpmError ? styles.fieldHintError : ''}`}
            role={bpmError ? 'alert' : undefined}
          >
            {bpmError ?? 'Range: 1 – 200 BPM'}
          </span>
        </label>
        <label className={styles.field}>
          <span>Time</span>
          <select
            value={formatTimeSignature(timeSignature)}
            onChange={handleSignatureInput}
            disabled={disableTempoControls}
          >
            {availableSignatures.map((option) => (
              <option key={formatTimeSignature(option)} value={formatTimeSignature(option)}>
                {formatTimeSignature(option)}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.barDisplay}>
          Beat {currentPosition.beat.toFixed(1)} / {timeSignature.numerator}
        </div>
      </div>

      <div className={styles.transportRow}>
        <button
          type="button"
          className={`${styles.controlButton} ${styles.controlRec} ${
            recArmed ? styles.controlButtonActive : ''
          }`}
          onClick={onToggleRec}
          aria-pressed={recArmed}
          disabled={isCapturing}
        >
          REC
        </button>
        <button
          type="button"
          className={`${styles.controlButton} ${styles.controlPlay} ${
            isPlayingBack ? styles.controlButtonActive : ''
          }`}
          onClick={onPlay}
          disabled={playDisabled}
        >
          PLAY
        </button>
        <button
          type="button"
          className={`${styles.controlButton} ${styles.controlStop}`}
          onClick={onStop}
          disabled={stopDisabled}
        >
          STOP
        </button>
      </div>
      <button
        type="button"
        className={styles.downloadButton}
        onClick={handleDownloadClick}
        disabled={downloadDisabled}
      >
        Download MIDI
      </button>
      {showLoginModal && (
        <div className={styles.loginModalOverlay} role="dialog" aria-modal="true">
          <div className={styles.loginModal}>
            <div className={styles.loginModalHero}>
              <div className={styles.loginModalBadge}>Recorder cloud</div>
            </div>
            <div className={styles.loginModalBody}>
              <p className={styles.loginModalEyebrow}>MIDI EXPORT</p>
              <h3>Sign in to download</h3>
              <p className={styles.loginModalCopy}>
                Connect your Google account to unlock the Download button and export this take as
                MIDI.
              </p>
              <p className={styles.loginModalFootnote}>
                Recording and editing remain available without signing in.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.modalButton} ${styles.googleButton}`}
                onClick={handleModalSignIn}
              >
                <img src={googleIcon} alt="" aria-hidden className={styles.googleButtonIcon} />
                <span className={styles.googleButtonLabel}>Sign in with Google</span>
              </button>
              <button
                type="button"
                className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                onClick={handleModalClose}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
