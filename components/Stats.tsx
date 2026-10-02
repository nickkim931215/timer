'use client';

import { useApp } from '@/contexts/AppContext';
import { useLang } from '@/contexts/LanguageContext';
import { getWeekRecords } from '@/lib/storage';
import { useMemo } from 'react';

function formatTime(minutes: number, t: (k: string) => string): string {
  if (minutes < 60) return `${minutes}${t('stats.minutes')}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}${t('stats.hours')} ${m}${t('stats.minutes')}` : `${h}${t('stats.hours')}`;
}

function getDayLabel(dateStr: string, lang: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days: Record<string, string[]> = {
    ko: ['일', '월', '화', '수', '목', '금', '토'],
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    ja: ['日', '月', '火', '水', '木', '金', '土'],
    zh: ['日', '一', '二', '三', '四', '五', '六'],
    de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    es: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
    pt: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá'],
    fr: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
    ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  };
  const d = days[lang] ?? days.en;
  return d[date.getDay()];
}

export default function Stats() {
  const { state } = useApp();
  const { t, lang } = useLang();
  const { timer } = state;

  const weekRecords = useMemo(() => getWeekRecords(), [timer.todayPomodoros]);
  const maxMinutes = Math.max(...weekRecords.map(r => r.minutes), 1);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="card p-5 flex flex-col gap-4">
      <h2 className="font-bold text-base" style={{ color: 'var(--accent-dark)' }}>
        {t('stats.title')}
      </h2>

      {/* Today summary */}
      <div className="flex gap-3">
        <div
          className="flex-1 rounded-xl p-3 flex flex-col items-center gap-1"
          style={{ background: 'var(--bg-primary)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-sub)' }}>{t('stats.today')}</span>
          <span className="font-bold text-lg" style={{ color: 'var(--accent-dark)' }}>
            {formatTime(timer.todayMinutes, t)}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-sub)' }}>{t('stats.focusTime')}</span>
        </div>
        <div
          className="flex-1 rounded-xl p-3 flex flex-col items-center gap-1"
          style={{ background: 'var(--bg-primary)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-sub)' }}>{t('stats.today')}</span>
          <span className="font-bold text-lg" style={{ color: 'var(--accent-brown)' }}>
            {timer.todayPomodoros}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-sub)' }}>{t('stats.pomodoros')}</span>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div>
        <p className="text-xs mb-3 font-medium" style={{ color: 'var(--text-sub)' }}>
          {t('stats.thisWeek')}
        </p>
        {weekRecords.length === 0 ? (
          <p className="text-sm text-center py-2" style={{ color: 'var(--text-sub)' }}>
            {t('stats.noData')}
          </p>
        ) : (
          <div className="flex items-end gap-1.5 h-20">
            {weekRecords.map(rec => {
              const height = Math.max((rec.minutes / maxMinutes) * 100, 4);
              const isToday = rec.date === today;
              return (
                <div key={rec.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${height}%`,
                      background: isToday ? 'var(--accent-brown)' : 'var(--divider)',
                    }}
                    title={`${rec.minutes}${t('stats.minutes')}`}
                  />
                  <span
                    className="text-xs"
                    style={{
                      color: isToday ? 'var(--accent-brown)' : 'var(--text-sub)',
                      fontWeight: isToday ? '700' : '400',
                    }}
                  >
                    {getDayLabel(rec.date, lang)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
