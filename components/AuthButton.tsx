'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: 'var(--divider)' }} />;

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all btn-primary"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M13.2 7.15c0-.45-.04-.88-.11-1.3H7v2.46h3.48a2.97 2.97 0 01-1.29 1.95v1.62h2.09c1.22-1.12 1.92-2.77 1.92-4.73z" fill="white"/>
          <path d="M7 13.5c1.75 0 3.21-.58 4.28-1.57L9.19 10.3c-.58.39-1.32.62-2.19.62-1.69 0-3.12-1.14-3.63-2.67H1.4v1.68A6.5 6.5 0 007 13.5z" fill="white"/>
          <path d="M3.37 8.25A3.9 3.9 0 013.17 7c0-.43.08-.85.2-1.25V4.07H1.4A6.5 6.5 0 00.5 7c0 1.05.25 2.04.9 2.93l2.97-1.68z" fill="white"/>
          <path d="M7 3.58c.95 0 1.8.33 2.47.97l1.85-1.85A6.49 6.49 0 007 .5 6.5 6.5 0 001.4 4.07l2.97 1.68C4.88 4.72 6.31 3.58 7 3.58z" fill="white"/>
        </svg>
        Google 로그인
      </button>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2">
        {user.user_metadata?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.user_metadata.avatar_url}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
            style={{ border: '2px solid var(--accent-brown)' }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'var(--accent-brown)' }}
          >
            {(user.email ?? '?')[0].toUpperCase()}
          </div>
        )}
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 rounded-xl py-2 min-w-[160px] shadow-lg"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)' }}
          >
            <div className="px-4 py-2 text-xs" style={{ color: 'var(--text-sub)' }}>
              {user.email}
            </div>
            <div style={{ borderTop: '1px solid var(--divider)' }} />
            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm transition-colors"
              style={{ color: 'var(--accent-dark)' }}
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}
