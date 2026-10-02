import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key && url.startsWith('https://'));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = isSupabaseConfigured
  ? createClient(url!, key!)
  : createClient('https://mock.supabase.co', 'mock', { auth: { persistSession: false } }) as any;

export type SupabaseSession = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];

// Focus sessions CRUD
export async function syncSessionToSupabase(userId: string, minutes: number, mode: 'pomodoro' | 'stopwatch') {
  await supabase.from('focus_sessions').insert({
    user_id: userId,
    started_at: new Date(Date.now() - minutes * 60000).toISOString(),
    duration_minutes: minutes,
    mode,
    completed: true,
  });
}

export async function fetchMonthSessions(userId: string, year: number, month: number) {
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const to = `${year}-${String(month).padStart(2, '0')}-31`;
  const { data } = await supabase
    .from('focus_sessions')
    .select('started_at, duration_minutes')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('started_at', from)
    .lte('started_at', to);
  return data ?? [];
}

// Tasks CRUD
export async function fetchTasks(userId: string) {
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');
  return data ?? [];
}

export async function upsertTask(userId: string, task: {
  id: string; title: string; estimated_pomodoros: number;
  completed_pomodoros: number; is_done: boolean;
}) {
  await supabase.from('tasks').upsert({ ...task, user_id: userId });
}
