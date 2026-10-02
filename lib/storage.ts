import { Task, TimerSettings, FocusRecord, DEFAULT_SETTINGS } from './types';

const KEYS = {
  tasks: 'timer_tasks',
  settings: 'timer_settings',
  records: 'timer_records',
  language: 'timer_language',
};

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.tasks) || '[]');
  } catch { return []; }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
}

export function loadSettings(): TimerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEYS.settings) || '{}') };
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(settings: TimerSettings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function loadRecords(): FocusRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.records) || '[]');
  } catch { return []; }
}

export function saveRecord(date: string, minutes: number, pomodoros: number) {
  const records = loadRecords();
  const existing = records.find(r => r.date === date);
  if (existing) {
    existing.minutes += minutes;
    existing.pomodoros += pomodoros;
  } else {
    records.push({ date, minutes, pomodoros });
  }
  localStorage.setItem(KEYS.records, JSON.stringify(records.slice(-30)));
}

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getWeekRecords(): FocusRecord[] {
  const records = loadRecords();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  return records.filter(r => r.date >= weekAgoStr);
}

export function loadLanguage(): string {
  if (typeof window === 'undefined') return 'ko';
  return localStorage.getItem(KEYS.language) || 'ko';
}

export function saveLanguage(lang: string) {
  localStorage.setItem(KEYS.language, lang);
}
