'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { fetchMonthSessions } from '@/lib/supabase';
import { getWeekRecords } from '@/lib/storage';
import html2canvas from 'html2canvas';

interface DayData {
  date: string;
  minutes: number;
}

function buildCalendar(year: number, month: number, data: DayData[]): (DayData | null)[][] {
  const map = Object.fromEntries(data.map(d => [d.date, d.minutes]));
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (DayData | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { date, minutes: map[date] ?? 0 };
    }),
  ];

  const weeks: (DayData | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function getColor(minutes: number): string {
  if (minutes === 0) return 'var(--divider)';
  if (minutes < 30) return '#D4C4B0';
  if (minutes < 60) return '#B8976C';
  if (minutes < 120) return '#8B6F4E';
  return '#4A3B2A';
}

export default function CalendarHeatmap() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const cardRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user) {
      // Use localStorage data
      const records = getWeekRecords();
      setData(records.map(r => ({ date: r.date, minutes: r.minutes })));
      return;
    }
    setLoading(true);
    fetchMonthSessions(user.id, year, month).then(sessions => {
      const byDay: Record<string, number> = {};
      sessions.forEach((s: { started_at: string; duration_minutes: number }) => {
        const d = s.started_at.slice(0, 10);
        byDay[d] = (byDay[d] ?? 0) + s.duration_minutes;
      });
      setData(Object.entries(byDay).map(([date, minutes]) => ({ date, minutes })));
      setLoading(false);
    });
  }, [user, year, month]);

  const weeks = buildCalendar(year, month, data);
  const totalMinutes = data.filter(d => d.date.startsWith(`${year}-${String(month).padStart(2, '0')}`))
    .reduce((s, d) => s + d.minutes, 0);
  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;

  const DAY_LABELS: Record<string, string[]> = {
    ko: ['일', '월', '화', '수', '목', '금', '토'],
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    ja: ['日', '月', '火', '水', '木', '金', '土'],
    zh: ['日', '一', '二', '三', '四', '五', '六'],
  };
  const dayLabels = DAY_LABELS[lang] ?? DAY_LABELS.en;

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(
    lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : 'en-US',
    { year: 'numeric', month: 'long' }
  );

  const shareCalendar = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `focus-calendar-${year}-${month}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base" style={{ color: 'var(--accent-dark)' }}>
          캘린더
        </h2>
        {user && (
          <button
            onClick={shareCalendar}
            disabled={exporting}
            className="text-xs px-3 py-1.5 rounded-lg btn-ghost"
          >
            {exporting ? '...' : t('share.download')}
          </button>
        )}
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }}
          className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center text-sm"
        >‹</button>
        <span className="text-sm font-semibold" style={{ color: 'var(--accent-dark)' }}>
          {monthLabel}
        </span>
        <button
          onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }}
          className="w-7 h-7 rounded-lg btn-ghost flex items-center justify-center text-sm"
        >›</button>
      </div>

      <div ref={cardRef} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 12 }}>
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-1">
          {dayLabels.map(d => (
            <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'var(--text-sub)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-sub)' }}>로딩 중...</div>
        ) : (
          <div className="flex flex-col gap-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="aspect-square rounded-md flex flex-col items-center justify-center"
                    style={{ background: day ? getColor(day.minutes) : 'transparent' }}
                    title={day ? `${day.date}: ${day.minutes}분` : ''}
                  >
                    {day && (
                      <span className="text-xs" style={{
                        color: day.minutes >= 60 ? '#fff' : 'var(--accent-dark)',
                        fontSize: '0.65rem',
                        fontWeight: day.minutes > 0 ? '600' : '400',
                      }}>
                        {parseInt(day.date.slice(8))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Monthly summary */}
        <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--divider)' }}>
          <span className="text-xs" style={{ color: 'var(--text-sub)' }}>이번 달 총 집중</span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent-brown)' }}>
            {totalH > 0 ? `${totalH}시간 ${totalM}분` : `${totalM}분`}
          </span>
        </div>
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs" style={{ color: 'var(--text-sub)' }}>적음</span>
        {['var(--divider)', '#D4C4B0', '#B8976C', '#8B6F4E', '#4A3B2A'].map(c => (
          <div key={c} className="w-4 h-4 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-xs" style={{ color: 'var(--text-sub)' }}>많음</span>
      </div>
    </div>
  );
}
