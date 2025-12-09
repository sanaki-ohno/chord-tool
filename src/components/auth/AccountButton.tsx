// src/components/auth/AccountButton.tsx - ヘッダー右上のアカウントボタン
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import userIcon from '../../assets/cons_user.svg';
import styles from '../../styles/auth/AccountButton.module.css';
import googleIcon from '../../assets/icon_google.svg';

export const AccountButton = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [actionPending, setActionPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const busy = loading || actionPending;

  const initials = useMemo(() => {
    if (!user) return '';
    const name: string =
      (user.user_metadata?.full_name as string | undefined)?.trim() ||
      user.email ||
      '';
    return name.charAt(0).toUpperCase();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (event.target instanceof Node && containerRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (loading) return;
    setOpen((prev) => !prev);
  };

  const handleSignIn = async () => {
    if (busy) return;
    setActionPending(true);
    try {
      await signInWithGoogle();
      setOpen(false);
    } finally {
      setActionPending(false);
    }
  };

  const handleSignOut = async () => {
    if (busy) return;
    setActionPending(true);
    try {
      await signOut();
      setOpen(false);
    } finally {
      setActionPending(false);
    }
  };

  return (
    <div className={styles.accountWrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.accountButton}
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={user ? 'Account menu' : 'Sign in'}
        disabled={loading}
      >
        {user ? (
          <span className={styles.initials}>{initials}</span>
        ) : (
          <img src={userIcon} alt="" className={styles.icon} aria-hidden />
        )}
      </button>
      {open && (
        <div className={styles.popover} role="menu">
          <div className={styles.popoverAura} aria-hidden="true" />
          {user ? (
            <>
              <div className={styles.popoverHeader}>
                <span className={styles.popoverLabel}>Signed in</span>
                <span className={styles.popoverValue}>{user.email}</span>
                <span className={styles.popoverSupporting}>
                  MIDI download stays enabled while you are signed in.
                </span>
              </div>
              <div className={styles.popoverActions}>
                <button
                  type="button"
                  className={`${styles.popoverButton} ${styles.popoverButtonSecondary}`}
                  onClick={handleSignOut}
                  disabled={busy}
                >
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.popoverHeader}>
                <span className={styles.popoverLabel}>Google sign-in</span>
                <span className={styles.popoverValue}>
                  Connect your Google account to unlock MIDI downloads.
                </span>
                <ul className={styles.popoverChecklist}>
                  <li>Export recorded takes as MIDI</li>
                  <li>Keep download access between sessions</li>
                </ul>
              </div>
              <div className={styles.popoverActions}>
                <button
                  type="button"
                  className={`${styles.popoverButton} ${styles.googleButton}`}
                  onClick={handleSignIn}
                  disabled={busy}
                >
                  <img src={googleIcon} alt="" aria-hidden className={styles.googleButtonIcon} />
                  <span className={styles.googleButtonLabel}>Sign in with Google</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
