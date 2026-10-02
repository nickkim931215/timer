'use client';

import {
  createContext, useContext, useReducer, useEffect, useRef,
  ReactNode, Dispatch,
} from 'react';
import { TimerMode, SessionType, TimerSettings, Task, DEFAULT_SETTINGS } from '@/lib/types';
import {
  loadTasks, saveTasks, loadSettings, saveSettings,
  saveRecord, getTodayKey, loadRecords,
} from '@/lib/storage';

// ─── State ────────────────────────────────────────────────────────────────────

interface TimerState {
  mode: TimerMode;
  sessionType: SessionType;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
  settings: TimerSettings;
  todayMinutes: number;
  todayPomodoros: number;
}

interface AppState {
  timer: TimerState;
  tasks: Task[];
  showShare: boolean;
  showSettings: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_MODE'; mode: TimerMode }
  | { type: 'SET_SESSION'; session: SessionType }
  | { type: 'SET_TIMER_DURATION'; minutes: number }
  | { type: 'TICK' }
  | { type: 'TOGGLE_RUNNING' }
  | { type: 'RESET' }
  | { type: 'SESSION_COMPLETE' }
  | { type: 'TIMER_COMPLETE'; minutes: number }
  | { type: 'UPDATE_SETTINGS'; settings: TimerSettings }
  | { type: 'SET_TODAY_STATS'; minutes: number; pomodoros: number }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'SET_TASK_POMODORO'; id: string; n: number }
  | { type: 'SHOW_SHARE'; show: boolean }
  | { type: 'SHOW_SETTINGS'; show: boolean };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sessionDuration(session: SessionType, s: TimerSettings): number {
  if (session === 'work') return s.workMinutes * 60;
  if (session === 'shortBreak') return s.shortBreakMinutes * 60;
  return s.longBreakMinutes * 60;
}

function nextSession(current: SessionType, completed: number, s: TimerSettings): SessionType {
  if (current !== 'work') return 'work';
  if ((completed + 1) % s.longBreakInterval === 0) return 'longBreak';
  return 'shortBreak';
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function timerReducer(state: AppState, action: Action): AppState {
  const { timer } = state;

  switch (action.type) {
    case 'SET_MODE': {
      const timeLeft =
        action.mode === 'stopwatch' ? 0
        : action.mode === 'timer'   ? timer.settings.timerMinutes * 60
        : sessionDuration('work', timer.settings);
      return {
        ...state,
        timer: { ...timer, mode: action.mode, sessionType: 'work', timeLeft, isRunning: false, completedPomodoros: 0 },
      };
    }

    case 'SET_SESSION':
      return {
        ...state,
        timer: { ...timer, sessionType: action.session, timeLeft: sessionDuration(action.session, timer.settings), isRunning: false },
      };

    case 'SET_TIMER_DURATION':
      return {
        ...state,
        timer: {
          ...timer,
          settings: { ...timer.settings, timerMinutes: action.minutes },
          timeLeft: action.minutes * 60,
          isRunning: false,
        },
      };

    case 'TICK':
      if (timer.mode === 'stopwatch') return { ...state, timer: { ...timer, timeLeft: timer.timeLeft + 1 } };
      if (timer.timeLeft <= 1) return { ...state, timer: { ...timer, timeLeft: 0, isRunning: false } };
      return { ...state, timer: { ...timer, timeLeft: timer.timeLeft - 1 } };

    case 'TOGGLE_RUNNING':
      return { ...state, timer: { ...timer, isRunning: !timer.isRunning } };

    case 'RESET': {
      const timeLeft =
        timer.mode === 'stopwatch' ? 0
        : timer.mode === 'timer'   ? timer.settings.timerMinutes * 60
        : sessionDuration(timer.sessionType, timer.settings);
      return { ...state, timer: { ...timer, timeLeft, isRunning: false } };
    }

    case 'SESSION_COMPLETE': {
      const wasWork = timer.sessionType === 'work';
      const newCompleted = wasWork ? timer.completedPomodoros + 1 : timer.completedPomodoros;
      const next = nextSession(timer.sessionType, timer.completedPomodoros, timer.settings);
      return {
        ...state,
        timer: {
          ...timer,
          sessionType: next,
          timeLeft: sessionDuration(next, timer.settings),
          isRunning: timer.settings.autoLoop,
          completedPomodoros: newCompleted,
          todayMinutes: wasWork ? timer.todayMinutes + timer.settings.workMinutes : timer.todayMinutes,
          todayPomodoros: wasWork ? timer.todayPomodoros + 1 : timer.todayPomodoros,
        },
      };
    }

    case 'TIMER_COMPLETE':
      return {
        ...state,
        timer: {
          ...timer,
          todayMinutes: timer.todayMinutes + action.minutes,
        },
      };

    case 'UPDATE_SETTINGS': {
      const timeLeft =
        timer.mode === 'timer'   ? action.settings.timerMinutes * 60
        : timer.mode === 'stopwatch' ? timer.timeLeft
        : timer.isRunning ? timer.timeLeft : sessionDuration(timer.sessionType, action.settings);
      return { ...state, timer: { ...timer, settings: action.settings, timeLeft } };
    }

    case 'SET_TODAY_STATS':
      return { ...state, timer: { ...timer, todayMinutes: action.minutes, todayPomodoros: action.pomodoros } };

    case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.task] };
    case 'TOGGLE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, isDone: !t.isDone } : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    case 'SET_TASK_POMODORO':
      return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, completedPomodoros: action.n } : t) };
    case 'SHOW_SHARE': return { ...state, showShare: action.show };
    case 'SHOW_SETTINGS': return { ...state, showSettings: action.show };
    default: return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppCtx {
  state: AppState;
  dispatch: Dispatch<Action>;
  formattedTime: string;
}

const AppContext = createContext<AppCtx>({
  state: {
    timer: { mode: 'timer', sessionType: 'work', timeLeft: DEFAULT_SETTINGS.timerMinutes * 60, isRunning: false, completedPomodoros: 0, settings: DEFAULT_SETTINGS, todayMinutes: 0, todayPomodoros: 0 },
    tasks: [], showShare: false, showSettings: false,
  },
  dispatch: () => {},
  formattedTime: '25:00',
});

export function AppProvider({ children }: { children: ReactNode }) {
  const settings = loadSettings();
  const [state, dispatch] = useReducer(timerReducer, {
    timer: { mode: 'timer', sessionType: 'work', timeLeft: settings.timerMinutes * 60, isRunning: false, completedPomodoros: 0, settings, todayMinutes: 0, todayPomodoros: 0 },
    tasks: [], showShare: false, showSettings: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevRunning = useRef(false);

  useEffect(() => {
    loadTasks().forEach(t => dispatch({ type: 'ADD_TASK', task: t }));
    const todayRec = loadRecords().find(r => r.date === getTodayKey());
    if (todayRec) dispatch({ type: 'SET_TODAY_STATS', minutes: todayRec.minutes, pomodoros: todayRec.pomodoros });
  }, []);

  useEffect(() => { saveTasks(state.tasks); }, [state.tasks]);
  useEffect(() => { saveSettings(state.timer.settings); }, [state.timer.settings]);

  useEffect(() => {
    if (state.timer.isRunning) {
      intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.timer.isRunning]);

  useEffect(() => {
    const { timer } = state;
    const justFinished = timer.timeLeft === 0 && !timer.isRunning && prevRunning.current;
    if (justFinished) {
      const playBell = () => import('@/lib/sounds').then(m => {
        const saved = typeof window !== 'undefined'
          ? (JSON.parse(localStorage.getItem('timer_sound') ?? '{}').bell ?? 'bell')
          : 'bell';
        m.soundEngine?.playNotification(saved);
      });

      if (timer.mode === 'routine') {
        dispatch({ type: 'SESSION_COMPLETE' });
        if (timer.sessionType === 'work') saveRecord(getTodayKey(), timer.settings.workMinutes, 1);
        playBell();
      } else if (timer.mode === 'timer') {
        const mins = timer.settings.timerMinutes;
        dispatch({ type: 'TIMER_COMPLETE', minutes: mins });
        saveRecord(getTodayKey(), mins, 0);
        playBell();
      }
    }
    prevRunning.current = timer.isRunning;
  }, [state.timer.timeLeft, state.timer.isRunning]);

  useEffect(() => {
    const { timer } = state;
    if (timer.isRunning) {
      const m = Math.floor(timer.timeLeft / 60).toString().padStart(2, '0');
      const s = (timer.timeLeft % 60).toString().padStart(2, '0');
      document.title = `${m}:${s} — 가성비타이머`;
    } else {
      document.title = '가성비타이머';
    }
  }, [state.timer.timeLeft, state.timer.isRunning]);

  const { timeLeft } = state.timer;
  const formattedTime = `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <AppContext.Provider value={{ state, dispatch, formattedTime }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
