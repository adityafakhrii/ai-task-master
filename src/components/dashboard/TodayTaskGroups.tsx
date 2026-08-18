import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Todo } from '@/lib/taskUtils';
import {
  Flame,
  Star,
  Zap,
  Calendar,
  Hourglass,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodayTaskGroupsProps {
  criticalTasks: Todo[];
  importantTasks: Todo[];
  quickWinsTasks: Todo[];
  upNextTasks: Todo[];
  waitingTasks: Todo[];
  onToggleComplete: (id: string, completed: boolean) => void;
  onStartFocus: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onMoveToTomorrow: (id: string) => void;
  onToggleWaiting: (id: string, currentWaiting: boolean) => void;
  onUpdateSubtasks: (id: string, newDescription: string) => void;
  onQuickAdd: () => void;
  onPrioritizeAI?: () => void;
}

export function TodayTaskGroups({
  criticalTasks,
  importantTasks,
  quickWinsTasks,
  upNextTasks,
  waitingTasks,
  onToggleComplete,
  onStartFocus,
  onEdit,
  onDelete,
  onMoveToTomorrow,
  onToggleWaiting,
  onUpdateSubtasks,
  onQuickAdd,
  onPrioritizeAI
}: TodayTaskGroupsProps) {
  const [showUpNext, setShowUpNext] = useState(true);
  const [showWaiting, setShowWaiting] = useState(true);

  const totalTodayTasks = criticalTasks.length + importantTasks.length + quickWinsTasks.length;

  return (
    <div className="space-y-8">
      {/* TODAY SECTION HEADER */}
      <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Target Hari Ini
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
            {totalTodayTasks}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onPrioritizeAI && totalTodayTasks > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPrioritizeAI}
              className="h-8 text-xs font-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 gap-1.5 rounded-lg"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Tanya AI Prioritas</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={onQuickAdd}
            className="h-8 text-xs font-medium gap-1.5 rounded-lg shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Tambah Task</span>
          </Button>
        </div>
      </div>

      {/* TODAY EMPTY STATE */}
      {totalTodayTasks === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40 space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Hari ini masih santuy, belum ada task!
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Fokus hari ini masih kosong nih. Tambahin task baru atau minta AI buat racik tugas bootcamp lo.
          </p>
          <Button onClick={onQuickAdd} size="sm" className="mt-2 rounded-xl">
            <Plus className="h-4 w-4 mr-1.5" />
            Bikin Task Sekarang
          </Button>
        </div>
      )}

      {/* 1. CRITICAL GROUP */}
      {criticalTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Flame className="h-4 w-4 fill-rose-500/20" />
            <span>Critical • Wajib Kelar Hari Ini ({criticalTasks.length})</span>
          </div>
          <div className="grid gap-2.5">
            {criticalTasks.map(task => (
              <TaskCard
                key={task.id}
                todo={task}
                onToggleComplete={onToggleComplete}
                onStartFocus={onStartFocus}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoveToTomorrow={onMoveToTomorrow}
                onToggleWaiting={onToggleWaiting}
                onUpdateSubtasks={onUpdateSubtasks}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. IMPORTANT GROUP */}
      {importantTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Star className="h-4 w-4 fill-amber-500/20" />
            <span>Important • Prioritas Utama ({importantTasks.length})</span>
          </div>
          <div className="grid gap-2.5">
            {importantTasks.map(task => (
              <TaskCard
                key={task.id}
                todo={task}
                onToggleComplete={onToggleComplete}
                onStartFocus={onStartFocus}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoveToTomorrow={onMoveToTomorrow}
                onToggleWaiting={onToggleWaiting}
                onUpdateSubtasks={onUpdateSubtasks}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. QUICK WINS GROUP */}
      {quickWinsTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <Zap className="h-4 w-4 fill-sky-500/20" />
            <span>Quick Wins • Sat-Set Beres ({quickWinsTasks.length})</span>
          </div>
          <div className="grid gap-2.5">
            {quickWinsTasks.map(task => (
              <TaskCard
                key={task.id}
                todo={task}
                onToggleComplete={onToggleComplete}
                onStartFocus={onStartFocus}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoveToTomorrow={onMoveToTomorrow}
                onToggleWaiting={onToggleWaiting}
                onUpdateSubtasks={onUpdateSubtasks}
              />
            ))}
          </div>
        </div>
      )}

      {/* UP NEXT SECTION */}
      {upNextTasks.length > 0 && (
        <div className="pt-4 border-t border-border/60 space-y-3">
          <button
            type="button"
            onClick={() => setShowUpNext(!showUpNext)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold tracking-tight text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                Up Next • Buat Nanti ({upNextTasks.length})
              </h3>
            </div>
            {showUpNext ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showUpNext && (
            <div className="grid gap-2.5 opacity-90 hover:opacity-100 transition-opacity">
              {upNextTasks.map(task => (
                <TaskCard
                  key={task.id}
                  todo={task}
                  onToggleComplete={onToggleComplete}
                  onStartFocus={onStartFocus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMoveToTomorrow={onMoveToTomorrow}
                  onToggleWaiting={onToggleWaiting}
                  onUpdateSubtasks={onUpdateSubtasks}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* WAITING SECTION */}
      {waitingTasks.length > 0 && (
        <div className="pt-4 border-t border-border/60 space-y-3">
          <button
            type="button"
            onClick={() => setShowWaiting(!showWaiting)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold tracking-tight text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                Lagi Nunggu Respon Orang ({waitingTasks.length})
              </h3>
            </div>
            {showWaiting ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {showWaiting && (
            <div className="grid gap-2.5 opacity-80 hover:opacity-100 transition-opacity">
              {waitingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  todo={task}
                  onToggleComplete={onToggleComplete}
                  onStartFocus={onStartFocus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMoveToTomorrow={onMoveToTomorrow}
                  onToggleWaiting={onToggleWaiting}
                  onUpdateSubtasks={onUpdateSubtasks}
                  isWaiting
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
