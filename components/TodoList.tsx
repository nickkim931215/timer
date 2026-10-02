'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useLang } from '@/contexts/LanguageContext';
import { Task } from '@/lib/types';

export default function TodoList() {
  const { state, dispatch } = useApp();
  const { t } = useLang();
  const [input, setInput] = useState('');
  const [est, setEst] = useState(1);

  const addTask = () => {
    const title = input.trim();
    if (!title) return;
    const task: Task = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      estimatedPomodoros: est,
      completedPomodoros: 0,
      isDone: false,
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_TASK', task });
    setInput('');
    setEst(1);
  };

  const doneTasks = state.tasks.filter(t => t.isDone);
  const pendingTasks = state.tasks.filter(t => !t.isDone);

  return (
    <div className="card p-5 flex flex-col gap-4">
      <h2 className="font-bold text-base" style={{ color: 'var(--accent-dark)' }}>
        {t('todo.title')}
      </h2>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder={t('todo.placeholder')}
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--bg-primary)',
            border: '1.5px solid var(--divider)',
            color: 'var(--accent-dark)',
          }}
        />
        <div className="flex items-center gap-1">
          <span className="text-xs" style={{ color: 'var(--text-sub)' }}>{t('todo.estimatedLabel')}</span>
          <input
            type="number"
            min={1}
            max={20}
            value={est}
            onChange={e => setEst(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-10 px-1 py-2 rounded-xl text-sm text-center outline-none"
            style={{
              background: 'var(--bg-primary)',
              border: '1.5px solid var(--divider)',
              color: 'var(--accent-dark)',
            }}
          />
        </div>
        <button onClick={addTask} className="btn-primary px-3 py-2 text-sm">
          {t('todo.add')}
        </button>
      </div>

      {/* Tasks */}
      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
        {state.tasks.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-sub)' }}>
            {t('todo.empty')}
          </p>
        )}

        {pendingTasks.map(task => (
          <TaskRow key={task.id} task={task} dispatch={dispatch} t={t} />
        ))}

        {doneTasks.length > 0 && (
          <>
            <div className="text-xs pt-1" style={{ color: 'var(--text-sub)' }}>
              ✓ 완료 {doneTasks.length}개
            </div>
            {doneTasks.map(task => (
              <TaskRow key={task.id} task={task} dispatch={dispatch} t={t} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, dispatch, t }: {
  task: Task;
  dispatch: ReturnType<typeof useApp>['dispatch'];
  t: (k: string) => string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-all"
      style={{
        background: 'var(--bg-primary)',
        opacity: task.isDone ? 0.6 : 1,
      }}
    >
      <button
        onClick={() => dispatch({ type: 'TOGGLE_TASK', id: task.id })}
        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          border: `2px solid ${task.isDone ? 'var(--success)' : 'var(--divider)'}`,
          background: task.isDone ? 'var(--success)' : 'transparent',
        }}
      >
        {task.isDone && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <span
        className="flex-1 text-sm"
        style={{
          color: 'var(--accent-dark)',
          textDecoration: task.isDone ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </span>

      {/* Pomodoro count */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-xs" style={{ color: 'var(--accent-brown)' }}>
          {task.completedPomodoros}/{task.estimatedPomodoros}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-sub)' }}>🍅</span>
      </div>

      <button
        onClick={() => dispatch({ type: 'DELETE_TASK', id: task.id })}
        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded transition-opacity"
        style={{ color: 'var(--text-sub)' }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
