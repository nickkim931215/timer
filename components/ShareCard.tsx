'use client';

import { useRef, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLang } from '@/contexts/LanguageContext';

type Ratio = 'story' | 'feed' | 'card';

const RATIO_SIZES: Record<Ratio, { w: number; h: number }> = {
  story: { w: 540, h: 960 },
  feed:  { w: 540, h: 540 },
  card:  { w: 400, h: 400 },
};

function formatTimeText(minutes: number, t: (k: string) => string): string {
  if (minutes === 0) return `0${t('stats.minutes')}`;
  if (minutes < 60) return `${minutes}${t('stats.minutes')}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}${t('stats.hours')} ${m}${t('stats.minutes')}` : `${h}${t('stats.hours')}`;
}

export default function ShareCard() {
  const { state, dispatch } = useApp();
  const { t, lang } = useLang();
  const { timer } = state;
  const [ratio, setRatio] = useState<Ratio>('feed');
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  if (!state.showShare) return null;

  const size = RATIO_SIZES[ratio];
  const scale = 300 / size.w;
  const previewW = 300;
  const previewH = size.h * scale;

  const todayStr = new Date().toLocaleDateString(
    lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `focus-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
      if (!blob) return;
      const file = new File([blob], 'focus.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: t('share.title') });
      } else {
        handleDownload();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(44,31,20,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={() => dispatch({ type: 'SHOW_SHARE', show: false })}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--divider)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base" style={{ color: 'var(--accent-dark)' }}>
            {t('share.btn')}
          </h2>
          <button
            onClick={() => dispatch({ type: 'SHOW_SHARE', show: false })}
            className="w-7 h-7 rounded-full flex items-center justify-center btn-ghost"
          >
            ×
          </button>
        </div>

        {/* Ratio selector */}
        <div className="flex gap-2">
          {(['feed', 'story', 'card'] as Ratio[]).map(r => (
            <button
              key={r}
              onClick={() => setRatio(r)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: ratio === r ? 'var(--accent-brown)' : 'var(--bg-secondary)',
                color: ratio === r ? '#fff' : 'var(--text-sub)',
                border: `1.5px solid ${ratio === r ? 'var(--accent-brown)' : 'var(--divider)'}`,
              }}
            >
              {t(`share.${r}`)}
            </button>
          ))}
        </div>

        {/* Card preview (hidden real card) */}
        <div className="overflow-hidden rounded-xl" style={{ width: previewW, height: previewH, margin: '0 auto' }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: size.w, height: size.h }}>
            {/* The actual card that html2canvas captures */}
            <div
              ref={cardRef}
              style={{
                width: size.w,
                height: size.h,
                background: 'linear-gradient(145deg, #F5EFE6 0%, #EADFCF 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: ratio === 'story' ? 32 : 24,
                padding: 48,
                fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative circles */}
              <div style={{
                position: 'absolute', top: -80, right: -80,
                width: 280, height: 280, borderRadius: '50%',
                background: 'rgba(139,111,78,0.08)',
              }} />
              <div style={{
                position: 'absolute', bottom: -60, left: -60,
                width: 200, height: 200, borderRadius: '50%',
                background: 'rgba(139,111,78,0.06)',
              }} />

              {/* Logo */}
              <div style={{
                fontSize: ratio === 'story' ? 18 : 14,
                color: '#8C7F6E',
                letterSpacing: 2,
                fontWeight: 500,
              }}>
                가성비타이머
              </div>

              {/* Big time */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: ratio === 'story' ? 72 : 56,
                  fontWeight: 800,
                  color: '#4A3B2A',
                  lineHeight: 1,
                }}>
                  {formatTimeText(timer.todayMinutes, t)}
                </div>
                <div style={{
                  fontSize: ratio === 'story' ? 22 : 18,
                  color: '#8B6F4E',
                  marginTop: 8,
                  fontWeight: 500,
                }}>
                  {t('share.focused')}
                </div>
              </div>

              {/* Pomodoro count */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px',
                background: 'rgba(139,111,78,0.12)',
                borderRadius: 999,
              }}>
                <span style={{ fontSize: 20 }}>🍅</span>
                <span style={{ fontSize: ratio === 'story' ? 18 : 15, color: '#8B6F4E', fontWeight: 600 }}>
                  {timer.todayPomodoros} {t('share.pomodoroCount')}
                </span>
              </div>

              {/* Date */}
              <div style={{ fontSize: 13, color: '#8C7F6E' }}>
                {todayStr}
              </div>

              {/* Watermark */}
              <div style={{
                position: 'absolute', bottom: 24,
                fontSize: 11, color: '#C4B5A5', letterSpacing: 1,
              }}>
                gasung.bi/timer
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-ghost"
          >
            {loading ? '...' : t('share.download')}
          </button>
          <button
            onClick={handleShare}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold btn-primary"
          >
            {loading ? '...' : t('share.shareBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
