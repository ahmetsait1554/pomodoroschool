import { useEffect, useState } from 'react';
import { Plus, Check, Trash2, ListTodo } from 'lucide-react';
import { supabase, type Task } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type Props = {
  currentTask: string;
  onCurrentTaskChange: (title: string) => void;
};

export default function TaskPanel({ currentTask, onCurrentTaskChange }: Props) {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (!session) return;
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setTasks(data as Task[]);
      });
  }, [session]);

  async function addTask() {
    if (!newTitle.trim() || !session) return;
    const { data } = await supabase
      .from('tasks')
      .insert({ title: newTitle.trim(), user_id: session.user.id })
      .select('*')
      .single();
    if (data) {
      setTasks((prev) => [data as Task, ...prev]);
      setNewTitle('');
    }
  }

  async function toggleTask(task: Task) {
    const updated = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: updated } : t)));
    await supabase.from('tasks').update({ completed: updated }).eq('id', task.id);
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  }

  const activeTasks = tasks.filter((t) => !t.completed);
  const doneTasks = tasks.filter((t) => t.completed);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <ListTodo size={18} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-white">Görevlerim</h3>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-400">Şu an ne yapıyorum?</label>
        <input
          type="text"
          value={currentTask}
          onChange={(e) => onCurrentTaskChange(e.target.value)}
          placeholder="Örn: Matematik çalışıyorum..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-orange-500/50 focus:bg-white/10"
        />
      </div>

      <div className="mb-3 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Yeni görev ekle..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-orange-500/50 focus:bg-white/10"
        />
        <button
          onClick={addTask}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 transition hover:bg-orange-500/30"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-1.5">
        {activeTasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/5"
          >
            <button
              onClick={() => toggleTask(task)}
              className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-600 transition hover:border-orange-400"
            />
            <span className="flex-1 text-sm text-slate-200">{task.title}</span>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 transition group-hover:opacity-100 text-slate-500 hover:text-red-400"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {doneTasks.length > 0 && (
          <div className="pt-2">
            <p className="px-3 pb-1 text-xs font-medium text-slate-500">Tamamlananlar</p>
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/5"
              >
                <button
                  onClick={() => toggleTask(task)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/80"
                >
                  <Check size={12} className="text-white" />
                </button>
                <span className="flex-1 text-sm text-slate-500 line-through">{task.title}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 transition group-hover:opacity-100 text-slate-500 hover:text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
              <ListTodo size={22} className="text-orange-400" />
            </div>
            <p className="mb-1 text-sm font-medium text-white">Henüz görev yok</p>
            <p className="text-xs text-slate-500">Yukarıdan bir görev ekle ve odaklanmaya başla</p>
          </div>
        )}
      </div>
    </div>
  );
}
