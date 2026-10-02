'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/lib/types';
import { loadLanguage, saveLanguage } from '@/lib/storage';

import ko from '@/locales/ko.json';
import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';
import de from '@/locales/de.json';
import es from '@/locales/es.json';
import pt from '@/locales/pt.json';
import fr from '@/locales/fr.json';
import ru from '@/locales/ru.json';

const TRANSLATIONS: Record<Language, Record<string, unknown>> = { ko, en, zh, ja, de, es, pt, fr, ru };

export const LANGUAGE_LABELS: Record<Language, string> = {
  ko: '한국어', en: 'English', zh: '中文', ja: '日本語',
  de: 'Deutsch', es: 'Español', pt: 'Português', fr: 'Français', ru: 'Русский',
};

type NestedRecord = Record<string, unknown>;

function getPath(obj: NestedRecord, path: string): string {
  const keys = path.split('.');
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return path;
    cur = (cur as NestedRecord)[k];
  }
  return typeof cur === 'string' ? cur : path;
}

interface LangCtx {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LangCtx>({
  lang: 'ko',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ko');

  useEffect(() => {
    const saved = loadLanguage() as Language;
    if (TRANSLATIONS[saved]) setLangState(saved);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    saveLanguage(l);
  };

  const t = (key: string) => getPath(TRANSLATIONS[lang] as NestedRecord, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
