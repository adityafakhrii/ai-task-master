import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  Trash2,
  Inbox,
  AlertTriangle,
  Flame,
  Check,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Todo, formatTaskDueDate, isTaskOverdue } from '@/lib/taskUtils';
import { dailyReview, DailyReviewResult } from '@/services/ai';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface DailyReviewViewProps {
  todos: Todo[];
  onToggleComplete: (id: string, completed: boolean) => void;
  onMoveToTomorrow: (id: string) => void;
  onReschedule: (id: string, newDate: string) => void;
  onMoveToInbox: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DailyReviewView({
  todos,
  onToggleComplete,
  onMoveToTomorrow,
  onReschedule,
  onMoveToInbox,
  onDelete
}: DailyReviewViewProps) {
  const { toast } = useToast();
  const [aiInsight, setAiInsight] = useState<DailyReviewResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const completedToday = todos.filter(t => t.completed);
  const incompleteToday = todos.filter(t => !t.completed);

  const handleFetchAiReview = async () => {
    try {
      setLoadingAi(true);
      const result = await dailyReview(completedToday, incompleteToday);
      setAiInsight(result);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Gagal Review AI', description: err.message });
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (todos.length > 0 && !aiInsight) {
      handleFetchAiReview();
    }
  }, [todos.length]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Daily Review / Refleksi Hari Ini
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Cek pencapaian lo hari ini, bersihin task yang nyangkut, trus siapin mental buat besok!
        </p>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Udah Beres</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {completedToday.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>Masih Nyangkut</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {incompleteToday.length}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="h-4 w-4 text-rose-500" />
            <span>Penyelesaian</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            {todos.length > 0 ? Math.round((completedToday.length / todos.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* AI Daily Reflection Card */}
      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Insight & Refleksi AI</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFetchAiReview}
            disabled={loadingAi}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            {loadingAi ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            <span>Tanya AI Lagi</span>
          </Button>
        </div>

        {aiInsight ? (
          <div className="space-y-2 text-xs sm:text-sm">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              {aiInsight.headline}
            </h3>
            <p className="text-foreground/90 leading-relaxed">
              {aiInsight.insight}
            </p>
            {aiInsight.priority_alert && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-start gap-2 mt-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{aiInsight.priority_alert}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Lagi menganalisis performa kerja lo hari ini...
          </p>
        )}
      </div>

      {/* INCOMPLETE TASKS SECTION (WITH 1-CLICK TRIAGE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <span>Beresin Task yang Nyangkut</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              {incompleteToday.length}
            </span>
          </h2>
        </div>

        {incompleteToday.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed text-center text-xs sm:text-sm text-muted-foreground">
            Gokil! Gak ada task yang nyangkut hari ini. Good job!
          </div>
        ) : (
          <div className="space-y-3">
            {incompleteToday.map(task => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-card border border-border/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium uppercase">
                      {task.priority}
                    </span>
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {task.title}
                    </h3>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{task.category || 'Bootcamp'}</span>
                    {task.due_date && <span>• {formatTaskDueDate(task.due_date)}</span>}
                  </div>
                </div>

                {/* 1-Click Triage Actions */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMoveToTomorrow(task.id)}
                    className="h-8 text-xs gap-1 rounded-lg"
                    title="Pindahkan deadline ke besok"
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Pindah Besok</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMoveToInbox(task.id)}
                    className="h-8 text-xs gap-1 rounded-lg"
                    title="Kembalikan ke Inbox"
                  >
                    <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Balikin ke Inbox</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(task.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive rounded-lg"
                    title="Hapus task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED TASKS SECTION */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <span>Udah Selesai Hari Ini</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              {completedToday.length}
            </span>
          </h2>
        </div>

        {completedToday.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada task yang lo selesaikan hari ini.</p>
        ) : (
          <div className="space-y-2">
            {completedToday.map(task => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-card/60 border border-border/50 flex items-center justify-between opacity-80"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-xs sm:text-sm line-through text-muted-foreground truncate">
                    {task.title}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleComplete(task.id, false)}
                  className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Belum Selesai Deng
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
