'use client';

import { useApp } from '@/contexts/AppContext';
import { useLang } from '@/contexts/LanguageContext';
import { SessionType, TimerMode } from '@/lib/types';

const SESSION_COLORS: Record<SessionType, string> = {
  work:       'var(--accent-brown)',
  shortBreak: '#6B8F5E',
  longBreak:  '#5B7FA6',
};

export default function Timer() {
  const { state, dispatch, formattedTime } = useApp();
  const { t } = useLang();
  const { timer } = state;

  const radius = 100;
  const stroke = 6;
  const cx = 130;
  const size = cx * 2;
  const circumference = 2 * Math.PI * radius;

  const total =
    timer.mode === 'stopwatch' ? 3600
    : timer.sessionType === 'work'        ? timer.settings.workMinutes * 60
    : timer.sessionType === 'shortBreak'  ? timer.settings.shortBreakMinutes * 60
    : timer.settings.longBreakMinutes * 60;

  const progress =
    timer.mode === 'stopwatch'
      ? Math.min(timer.timeLeft / total, 1)
      : 1 - timer.timeLeft / total;

  const dashOffset = circumference * (1 - progress);
  const color = SESSION_COLORS[timer.sessionType];

  const SESSION_LABELS: Record<SessionType, string> = {
    work:       t('timer.work'),
    shortBreak: t('timer.shortBreak'),
    longBreak:  t('timer.longBreak'),
  };

  return (
    <div className="flex flex-col items-center gap-7 w-full">

      {/* Mode tabs */}
      <div
        className="flex rounded-2xl p-1 gap-0.5"
        style={{ background: 'rgba(139,111,78,0.08)', border: '1px solid var(--divider)' }}
      >
        {(['routine', 'stopwatch'] as TimerMode[]).map(m => (
          <button
            key={m}
            onClick={() => dispatch({ type: 'SET_MODE', mode: m })}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: timer.mode === m
                ? 'linear-gradient(135deg, var(--accent-brown) 0%, #6D5238 100%)'
                : 'transparent',
              color: timer.mode === m ? '#fff' : 'var(--text-sub)',
              boxShadow: timer.mode === m ? '0 2px 8px rgba(139,111,78,0.3)' : 'none',
              letterSpacing: '0.01em',
            }}
          >
            {t(`nav.${m}`)}
          </button>
        ))}
      </div>

      {/* Session type pills */}
      {timer.mode === 'routine' && (
        <div className="flex gap-2">
          {(['work', 'shortBreak', 'longBreak'] as SessionType[]).map(s => (
            <button
              key={s}
              onClick={() => dispatch({ type: 'SET_SESSION', session: s })}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: timer.sessionType === s
                  ? color
                  : 'rgba(139,111,78,0.06)',
                color: timer.sessionType === s ? '#fff' : 'var(--text-sub)',
                border: `1px solid ${timer.sessionType === s ? color : 'transparent'}`,
                letterSpacing: '0.02em',
              }}
            >
              {SESSION_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Ring + Time */}
      <div
        className={`relative flex items-center justify-center ${timer.isRunning ? 'timer-running' : ''}`}
        style={{ width: size, height: size }}
      >
        {/* Glow layer */}
        {timer.isRunning && (
          <div
            className="timer-glow absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
            }}
          />
        )}

        <svg
          width={size} height={size}
          className="absolute inset-0"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={cx} cy={cx} r={radius}
            fill="none"
            stroke="var(--divider)"
            strokeWidth={stroke}
          />
          {/* Track shadow for depth */}
          <circle
            cx={cx} cy={cx} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeOpacity="0.08"
          />
          {/* Progress arc */}
          <circle
            cx={cx} cy={cx} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease' }}
          />
        </svg>

        {/* Time display */}
        <div className="flex flex-col items-center select-none z-10">
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '4.2rem',
              color: 'var(--accent-dark)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formattedTime}
          </span>
          <span
            className="mt-2 text-xs font-semibold tracking-widest uppercase"
            style={{ color, letterSpacing: '0.12em', opacity: 0.85 }}
          >
            {timer.mode === 'routine' ? SESSION_LABELS[timer.sessionType] : t('nav.stopwatch')}
          </span>
          {timer.mode === 'routine' && (
            <span className="mt-0.5 text-xs" style={{ color: 'var(--text-sub)', letterSpacing: '0.04em' }}>
              Round {timer.completedPomodoros + 1}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Reset */}
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all btn-ghost"
        >
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M2.5 8.5a6 6 0 1 1 1.6 4.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            <path d="M2.5 5v3.5h3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Play/Pause — hero button */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_RUNNING' })}
          className="w-20 h-20 rounded-3xl flex items-center justify-center btn-primary"
          style={{ fontSize: '1.5rem' }}
        >
          {timer.isRunning ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="5.5" y="4" width="4.5" height="16" rx="2.5" fill="white"/>
              <rect x="14" y="4" width="4.5" height="16" rx="2.5" fill="white"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 4.8l12.5 7.2L7 19.2V4.8z" fill="white"/>
            </svg>
          )}
        </button>

        {/* Share */}
        <button
          onClick={() => dispatch({ type: 'SHOW_SHARE', show: true })}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all btn-ghost"
        >
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <circle cx="14" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="3" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4.9 7.6L12.1 4.2M4.9 9.4l7.2 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Pomodoro dots */}
      {timer.mode === 'routine' && (
        <div className="flex gap-2.5 items-center">
          {Array.from({ length: timer.settings.longBreakInterval }).map((_, i) => {
            const done = i < (timer.completedPomodoros % timer.settings.longBreakInterval);
            return (
              <div
                key={i}
                className="transition-all duration-300"
                style={{
                  width: done ? 28 : 8,
                  height: 8,
                  borderRadius: 99,
                  background: done ? 'var(--accent-brown)' : 'var(--divider)',
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
