import { Button } from '@/components/ui/button';
import { Play, Sparkles, CheckCircle2, Flame, Clock, Plus, ArrowRight } from 'lucide-react';
import { Todo, formatTaskDueDate } from '@/lib/taskUtils';

interface FocusNowHeroProps {
  task: Todo | null;
  reason: string;
  onStartFocus: (task: Todo) => void;
  onCompleteTask?: (id: string) => void;
  onQuickAdd?: () => void;
  isLoading?: boolean;
}

export function FocusNowHero({
  task,
  reason,
  onStartFocus,
  onCompleteTask,
  onQuickAdd,
  isLoading
}: FocusNowHeroProps) {
  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-border/80 bg-card p-6 md:p-8 animate-pulse space-y-4 shadow-sm">
        <div className="h-4 w-28 bg-muted rounded-full" />
        <div className="h-8 w-3/4 bg-muted rounded-lg" />
        <div className="h-4 w-1/2 bg-muted rounded-md" />
        <div className="h-10 w-36 bg-muted rounded-xl mt-4" />
      </div>
    );
  }

  // All caught up / empty state
  if (!task) {
    return (
      <div className="relative overflow-hidden w-full rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Semua Tugas Tuntas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
              Semua beres. Good job! 🎉
            </h2>
            <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
              Tidak ada task mendesak yang tertunda. Nikmati waktu istirahat atau masukkan task baru untuk esok hari.
            </p>
          </div>

          {onQuickAdd && (
            <Button
              onClick={onQuickAdd}
              size="lg"
              className="bg-white text-slate-950 hover:bg-slate-100 font-semibold shadow-lg rounded-xl h-11 px-5 gap-2 shrink-0 transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Tambah Task Baru
            </Button>
          )}
        </div>
      </div>
    );
  }

  const priorityLabel = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Quick Win'
  }[task.priority] || 'Priority';

  return (
    <section aria-label="Focus Now" className="relative overflow-hidden w-full rounded-2xl border border-slate-900/10 dark:border-slate-800 bg-slate-900 text-slate-50 p-6 sm:p-8 shadow-lg">
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Tag & Context */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-medium text-slate-200">
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold tracking-wider uppercase text-[11px] text-amber-300">Focus Now</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{priorityLabel}</span>
            {task.due_date && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTaskDueDate(task.due_date)}
                </span>
              </>
            )}
          </div>

          {task.category && (
            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/50">
              {task.category}
            </span>
          )}
        </div>

        {/* Task Title */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white line-clamp-2 leading-tight">
            {task.title}
          </h2>

          {/* AI Reason Callout */}
          {reason && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-slate-200">Alasan AI: </span>
                <span>"{reason}"</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            onClick={() => onStartFocus(task)}
            size="lg"
            className="bg-white hover:bg-slate-100 text-slate-950 font-semibold shadow-md rounded-xl h-11 px-6 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="h-4 w-4 fill-current text-slate-950" />
            Mulai Fokus Sekarang
          </Button>

          {onCompleteTask && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => onCompleteTask(task.id)}
              className="bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white border-slate-700 h-11 px-4 rounded-xl text-xs sm:text-sm gap-2"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Tandai Selesai
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
