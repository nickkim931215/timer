export type TimerMode = 'timer' | 'routine' | 'stopwatch';
export type SessionType = 'work' | 'shortBreak' | 'longBreak';
export type Language = 'ko' | 'en' | 'zh' | 'ja' | 'de' | 'es' | 'pt' | 'fr' | 'ru';

export interface TimerSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoLoop: boolean;
  timerMinutes: number; // basic timer default duration
}

export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isDone: boolean;
  createdAt: number;
}

export interface FocusRecord {
  date: string;
  minutes: number;
  pomodoros: number;
}

export const DEFAULT_SETTINGS: TimerSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoLoop: false,
  timerMinutes: 25,
};

export const TIMER_PRESETS = [5, 10, 15, 25, 30, 45, 60];
