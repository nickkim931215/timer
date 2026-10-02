'use client';

import Timer from '@/components/Timer';
import TodoList from '@/components/TodoList';
import Stats from '@/components/Stats';
import ShareCard from '@/components/ShareCard';
import Settings from '@/components/Settings';
import LanguageSelector from '@/components/LanguageSelector';
import AuthButton from '@/components/AuthButton';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import PdfReport from '@/components/PdfReport';
import SoundPanel from '@/components/SoundPanel';
import { useApp } from '@/contexts/AppContext';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const { dispatch } = useApp();
  const { t } = useLang();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4"
        style={{
          background: theme === 'dark' ? 'rgba(17,17,17,0.85)' : 'rgba(247,242,235,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--divider)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-brown) 0%, #6D5238 100%)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.4"/>
              <path d="M7 4v3.5l2 1.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span
            className="font-semibold tracking-tight"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: 'var(--accent-dark)' }}
          >
            {t('app.name')}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-xl flex items-center justify-center btn-ghost"
            title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 007-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => dispatch({ type: 'SHOW_SETTINGS', show: true })}
            className="w-8 h-8 rounded-xl flex items-center justify-center btn-ghost"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>

          <LanguageSelector />
          <AuthButton />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-5">

        {/* Hero timer card */}
        <section
          className="card px-8 pt-10 pb-8 flex flex-col items-center"
          style={{
            background: 'var(--bg-card)',
            minHeight: 420,
          }}
        >
          <Timer />
        </section>

        {/* Todo + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TodoList />
          <Stats />
        </div>

        {/* Sound */}
        <SoundPanel />

        {/* Calendar */}
        <CalendarHeatmap />

        {/* PDF */}
        <PdfReport />

        {/* Login CTA */}
        {!user && (
          <div
            className="rounded-2xl px-5 py-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(139,111,78,0.07) 0%, rgba(139,111,78,0.03) 100%)',
              border: '1px dashed rgba(139,111,78,0.3)',
            }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,111,78,0.12)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="8" width="12" height="9" rx="2" stroke="var(--accent-brown)" strokeWidth="1.5"/>
                <path d="M6 8V5.5a3 3 0 016 0V8" stroke="var(--accent-brown)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: 'var(--accent-dark)' }}>
                Google 로그인으로 더 많은 기능 열기
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-sub)' }}>
                기기 간 동기화 · 월간 캘린더 · PDF 리포트
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <ShareCard />
      <Settings />
    </div>
  );
}
