'use client';

import { useState } from 'react';
import { useLang, LANGUAGE_LABELS } from '@/contexts/LanguageContext';
import { Language } from '@/lib/types';

const LANGS = Object.keys(LANGUAGE_LABELS) as Language[];

export default function LanguageSelector() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{ color: 'var(--accent-brown)', border: '1.5px solid var(--divider)', background: 'var(--bg-primary)' }}
      >
        <span>{LANGUAGE_LABELS[lang]}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 rounded-xl overflow-hidden shadow-lg py-1"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider)', minWidth: '130px' }}
          >
            {LANGS.map(l => (
              <button
                key={l}
                onClick={() => { setLang(l); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm transition-colors"
                style={{
                  color: l === lang ? 'var(--accent-brown)' : 'var(--accent-dark)',
                  background: l === lang ? 'var(--bg-primary)' : 'transparent',
                  fontWeight: l === lang ? '600' : '400',
                }}
              >
                {LANGUAGE_LABELS[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
