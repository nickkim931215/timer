'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLang } from '@/contexts/LanguageContext';
import { TimerSettings } from '@/lib/types';

export default function Settings() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const { settings } = state.timer;

  const [draft, setDraft] = useState<TimerSettings>({ ...settings });

  if (!state.showSettings) return null;

  const save = () => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: draft });
    dispatch({ type: 'SHOW_SETTINGS', show: false });
  };

  const field = (key: keyof TimerSettings, label: string, isMin = true) => (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium" style={{ color: 'var(--accent-dark)' }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        {typeof draft[key] === 'boolean' ? (
          <button
            onClick={() => setDraft(d => ({ ...d, [key]: !d[key] }))}
            className="w-10 h-6 rounded-full transition-all relative"
            style={{
              background: draft[key] ? 'var(--accent-brown)' : 'var(--divider)',
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
              style={{ left: draft[key] ? '18px' : '2px' }}
            />
          </button>
        ) : (
          <>
            <input
              type="number"
              min={1}
              max={isMin ? 120 : 10}
              value={draft[key] as number}
              onChange={e => setDraft(d => ({ ...d, [key]: Math.max(1, parseInt(e.target.value) || 1) }))}
              className="w-16 px-2 py-1.5 rounded-xl text-sm text-center outline-none"
              style={{
                background: 'var(--bg-primary)',
                border: '1.5px solid var(--divider)',
                color: 'var(--accent-dark)',
              }}
            />
            {isMin && (
              <span className="text-xs" style={{ color: 'var(--text-sub)' }}>
                {t('settings.minuteUnit')}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(44,31,20,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={() => dispatch({ type: 'SHOW_SETTINGS', show: false })}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 flex flex-col gap-5"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--divider)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base" style={{ color: 'var(--accent-dark)' }}>
            {t('settings.title')}
          </h2>
          <button
            onClick={() => dispatch({ type: 'SHOW_SETTINGS', show: false })}
            className="w-7 h-7 rounded-full flex items-center justify-center btn-ghost"
          >
            ×
          </button>
        </div>

        <div
          className="flex flex-col gap-4 p-4 rounded-xl"
          style={{ background: 'var(--bg-secondary)' }}
        >
          {field('workMinutes', t('settings.work'))}
          {field('shortBreakMinutes', t('settings.shortBreak'))}
          {field('longBreakMinutes', t('settings.longBreak'))}
          {field('longBreakInterval', t('settings.interval'), false)}
          {field('autoLoop', t('settings.autoLoop'))}
        </div>

        <button onClick={save} className="btn-primary py-3 rounded-xl font-semibold">
          {t('settings.save')}
        </button>
      </div>
    </div>
  );
}
