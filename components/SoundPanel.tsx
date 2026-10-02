'use client';

import { useState, useEffect } from 'react';
import { soundEngine, AmbientType, BellType } from '@/lib/sounds';
import { useLang } from '@/contexts/LanguageContext';

const AMBIENT_OPTIONS: { type: AmbientType; emoji: string; label: string }[] = [
  { type: 'none',   emoji: '🔇', label: '없음' },
  { type: 'rain',   emoji: '🌧️', label: '빗소리' },
  { type: 'cafe',   emoji: '☕', label: '카페' },
  { type: 'waves',  emoji: '🌊', label: '파도' },
  { type: 'forest', emoji: '🌲', label: '숲' },
];

const BELL_OPTIONS: { type: BellType; label: string }[] = [
  { type: 'bell',  label: '벨' },
  { type: 'chime', label: '차임' },
  { type: 'ding',  label: '딩' },
  { type: 'pop',   label: '팝' },
];

export default function SoundPanel() {
  const [open, setOpen] = useState(false);
  const [ambient, setAmbient] = useState<AmbientType>('none');
  const [bell, setBell] = useState<BellType>('bell');
  const [volume, setVolume] = useState(0.4);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('timer_sound');
    if (saved) {
      const s = JSON.parse(saved);
      setAmbient(s.ambient ?? 'none');
      setBell(s.bell ?? 'bell');
      setVolume(s.volume ?? 0.4);
      setMuted(s.muted ?? false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('timer_sound', JSON.stringify({ ambient, bell, volume, muted }));
  }, [ambient, bell, volume, muted]);

  const handleAmbient = (type: AmbientType) => {
    setAmbient(type);
    soundEngine?.setVolume(volume);
    soundEngine?.setMuted(muted);
    soundEngine?.playAmbient(type);
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    soundEngine?.setVolume(v);
  };

  const handleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine?.setMuted(next);
  };

  const handleBellPreview = (type: BellType) => {
    setBell(type);
    soundEngine?.playNotification(type);
  };

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full"
      >
        <h2 className="font-bold text-base" style={{ color: 'var(--accent-dark)' }}>
          🎵 사운드
        </h2>
        <div className="flex items-center gap-2">
          {ambient !== 'none' && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-brown)', color: '#fff' }}>
              {AMBIENT_OPTIONS.find(a => a.type === ambient)?.emoji}
            </span>
          )}
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s', color: 'var(--text-sub)' }}
          >
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {open && (
        <>
          {/* Ambient sounds */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-sub)' }}>배경음</p>
            <div className="flex gap-2 flex-wrap">
              {AMBIENT_OPTIONS.map(opt => (
                <button
                  key={opt.type}
                  onClick={() => handleAmbient(opt.type)}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all text-xs font-medium"
                  style={{
                    background: ambient === opt.type ? 'var(--accent-brown)' : 'var(--bg-primary)',
                    color: ambient === opt.type ? '#fff' : 'var(--accent-dark)',
                    border: `1.5px solid ${ambient === opt.type ? 'var(--accent-brown)' : 'var(--divider)'}`,
                  }}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <button onClick={handleMute} className="text-lg flex-shrink-0">
              {muted ? '🔇' : volume < 0.3 ? '🔈' : volume < 0.7 ? '🔉' : '🔊'}
            </button>
            <input
              type="range" min={0} max={1} step={0.01}
              value={muted ? 0 : volume}
              onChange={e => handleVolume(parseFloat(e.target.value))}
              className="flex-1 accent-amber-700"
              style={{ accentColor: 'var(--accent-brown)' }}
            />
            <span className="text-xs w-8 text-right" style={{ color: 'var(--text-sub)' }}>
              {Math.round((muted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Notification sound */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-sub)' }}>알림음 (클릭하면 미리듣기)</p>
            <div className="flex gap-2">
              {BELL_OPTIONS.map(opt => (
                <button
                  key={opt.type}
                  onClick={() => handleBellPreview(opt.type)}
                  className="flex-1 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: bell === opt.type ? 'var(--accent-brown)' : 'var(--bg-primary)',
                    color: bell === opt.type ? '#fff' : 'var(--accent-dark)',
                    border: `1.5px solid ${bell === opt.type ? 'var(--accent-brown)' : 'var(--divider)'}`,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Export selected bell type for AppContext to use
export function getSelectedBell(): BellType {
  try {
    const s = JSON.parse(localStorage.getItem('timer_sound') ?? '{}');
    return s.bell ?? 'bell';
  } catch { return 'bell'; }
}
