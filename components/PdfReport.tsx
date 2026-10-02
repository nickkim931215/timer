'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { fetchMonthSessions } from '@/lib/supabase';
import { getWeekRecords } from '@/lib/storage';

interface SessionStats {
  totalMinutes: number;
  totalSessions: number;
  avgSessionMinutes: number;
  completionRate: number;
  topDay: string;
  topDayMinutes: number;
}

function buildStats(sessions: { duration_minutes: number; started_at: string }[]): SessionStats {
  if (sessions.length === 0) return { totalMinutes: 0, totalSessions: 0, avgSessionMinutes: 0, completionRate: 0, topDay: '-', topDayMinutes: 0 };
  const total = sessions.reduce((s, r) => s + r.duration_minutes, 0);
  const byDay: Record<string, number> = {};
  sessions.forEach(s => {
    const d = s.started_at.slice(0, 10);
    byDay[d] = (byDay[d] ?? 0) + s.duration_minutes;
  });
  const topEntry = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0] ?? ['-', 0];
  return {
    totalMinutes: total,
    totalSessions: sessions.length,
    avgSessionMinutes: Math.round(total / sessions.length),
    completionRate: 100,
    topDay: topEntry[0],
    topDayMinutes: topEntry[1],
  };
}

function getFeedback(stats: SessionStats): string[] {
  const fb: string[] = [];
  if (stats.avgSessionMinutes >= 25)
    fb.push('장시간 집중력을 안정적으로 유지하고 있어요. 포모도로 간격을 조금 늘려봐도 좋겠습니다.');
  else if (stats.avgSessionMinutes >= 15)
    fb.push('평균 집중 시간이 양호해요. 조금씩 늘려가면 더 깊은 집중이 가능해집니다.');
  else
    fb.push('짧은 집중 세션이 많아요. 환경 방해 요소를 점검하고 집중 시간을 늘려봐요.');

  if (stats.totalMinutes >= 600)
    fb.push('이번 기간 집중시간이 상위권이에요. 루틴이 잘 자리잡고 있습니다!');
  else if (stats.totalMinutes >= 300)
    fb.push('꾸준한 집중 기록을 만들고 있어요. 조금만 더 늘려볼까요?');
  else
    fb.push('집중 시간을 조금 더 늘려보세요. 하루 30분부터 시작해봐요.');

  return fb;
}

export default function PdfReport() {
  const { user } = useAuth();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month'>('month');

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { default: jsPDF } = await import('jspdf');

      let sessions: { duration_minutes: number; started_at: string }[] = [];
      if (user) {
        const now = new Date();
        sessions = await fetchMonthSessions(user.id, now.getFullYear(), now.getMonth() + 1);
      } else {
        const records = getWeekRecords();
        sessions = records.map(r => ({ duration_minutes: r.minutes, started_at: r.date + 'T00:00:00' }));
      }

      const stats = buildStats(sessions);
      const feedback = getFeedback(stats);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, pw = 20;

      // ── 표지 ──
      doc.setFillColor(245, 239, 230);
      doc.rect(0, 0, W, 297, 'F');

      doc.setFillColor(139, 111, 78);
      doc.rect(0, 0, W, 60, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Focus Report', pw, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pw, 42);
      doc.text(`Period: ${period === 'month' ? 'This Month' : 'This Week'}`, pw, 50);

      // ── 요약 수치 ──
      doc.setTextColor(74, 59, 42);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', pw, 80);

      const H = Math.floor(stats.totalMinutes / 60);
      const M = stats.totalMinutes % 60;
      const items = [
        ['Total Focus Time', H > 0 ? `${H}h ${M}m` : `${M}m`],
        ['Sessions', String(stats.totalSessions)],
        ['Avg Session', `${stats.avgSessionMinutes}min`],
        ['Best Day', stats.topDay !== '-' ? `${stats.topDay} (${stats.topDayMinutes}min)` : '-'],
      ];

      items.forEach(([label, value], i) => {
        const y = 92 + i * 14;
        doc.setFillColor(234, 223, 207);
        doc.roundedRect(pw, y - 7, W - pw * 2, 11, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140, 127, 110);
        doc.text(label, pw + 4, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(74, 59, 42);
        doc.text(value, W - pw - 4, y, { align: 'right' });
      });

      // ── 피드백 ──
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(74, 59, 42);
      doc.text('Feedback', pw, 162);

      feedback.forEach((fb, i) => {
        const y = 172 + i * 22;
        doc.setFillColor(245, 239, 230);
        doc.setDrawColor(139, 111, 78);
        doc.roundedRect(pw, y - 7, W - pw * 2, 18, 2, 2, 'FD');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(74, 59, 42);
        const lines = doc.splitTextToSize(fb, W - pw * 2 - 8);
        doc.text(lines, pw + 4, y);
      });

      // ── 워터마크 ──
      doc.setFontSize(8);
      doc.setTextColor(196, 181, 165);
      doc.text('gasung.bi/timer', W / 2, 290, { align: 'center' });

      doc.save(`focus-report-${new Date().toISOString().slice(0, 7)}.pdf`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 flex flex-col gap-4">
      <h2 className="font-bold text-base" style={{ color: 'var(--accent-dark)' }}>
        PDF 리포트
      </h2>

      <div className="flex gap-2">
        {(['week', 'month'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: period === p ? 'var(--accent-brown)' : 'var(--bg-primary)',
              color: period === p ? '#fff' : 'var(--text-sub)',
              border: `1.5px solid ${period === p ? 'var(--accent-brown)' : 'var(--divider)'}`,
            }}
          >
            {p === 'week' ? t('stats.thisWeek') : '이번 달'}
          </button>
        ))}
      </div>

      <p className="text-xs" style={{ color: 'var(--text-sub)' }}>
        집중 시간, 세션 통계, 규칙 기반 피드백이 담긴 PDF를 다운로드합니다.
      </p>

      <button
        onClick={handleDownload}
        disabled={loading}
        className="btn-primary py-2.5 rounded-xl text-sm font-semibold"
      >
        {loading ? '생성 중...' : 'PDF 다운로드'}
      </button>
    </div>
  );
}
