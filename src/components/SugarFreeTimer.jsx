import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/timer.css';

export default function SugarFreeTimer() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const calculateElapsed = useCallback((start) => {
    const now = new Date();
    const diff = now - new Date(start);
    if (diff < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
  }, []);

  useEffect(() => {
    fetchTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (startTime) {
      setElapsed(calculateElapsed(startTime));
      intervalRef.current = setInterval(() => {
        setElapsed(calculateElapsed(startTime));
      }, 1000);
    } else {
      setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime, calculateElapsed]);

  async function fetchTimer() {
    try {
      const res = await fetch('/api/timer', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.timer?.start_time) {
          setStartTime(data.timer.start_time);
        }
      }
    } catch (err) {
      console.error('Fetch timer error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    try {
      const res = await fetch('/api/timer/start', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStartTime(data.timer.start_time);
      }
    } catch (err) {
      console.error('Start timer error:', err);
    }
  }

  async function handleReset() {
    if (!window.confirm(t('timer.resetConfirm'))) return;

    try {
      const res = await fetch('/api/timer/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStartTime(null);
      }
    } catch (err) {
      console.error('Reset timer error:', err);
    }
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  if (loading) {
    return (
      <div className="card timer-card">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="card timer-card">
      <h2>{t('dashboard.sugarFreeTimer')}</h2>

      {startTime ? (
        <>
          <p className="timer-subtitle">{t('dashboard.sugarFreeFor')}</p>
          <div className="timer-blocks">
            <div className="timer-block">
              <span className="timer-number">{pad(elapsed.days)}</span>
              <span className="timer-label">{t('dashboard.days')}</span>
            </div>
            <div className="timer-block">
              <span className="timer-number">{pad(elapsed.hours)}</span>
              <span className="timer-label">{t('dashboard.hours')}</span>
            </div>
            <div className="timer-block">
              <span className="timer-number">{pad(elapsed.minutes)}</span>
              <span className="timer-label">{t('dashboard.minutes')}</span>
            </div>
            <div className="timer-block">
              <span className="timer-number">{pad(elapsed.seconds)}</span>
              <span className="timer-label">{t('dashboard.seconds')}</span>
            </div>
          </div>
          <div className="timer-actions">
            <button className="btn btn-green" onClick={handleStart}>
              {t('dashboard.startSugarFree')}
            </button>
            <button className="btn btn-outline-gray" onClick={handleReset}>
              {t('dashboard.resetTimer')}
            </button>
          </div>
        </>
      ) : (
        <div className="timer-empty">
          <p>{t('dashboard.timerNotStarted')}</p>
          <p className="timer-encourage">{t('dashboard.startTracking')}</p>
          <button className="btn btn-green btn-full" onClick={handleStart}>
            {t('dashboard.startSugarFree')}
          </button>
        </div>
      )}
    </div>
  );
}
