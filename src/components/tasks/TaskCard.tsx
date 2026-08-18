import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  Play,
  MoreHorizontal,
  Trash2,
  Edit2,
  Hourglass,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  Flame,
  Star,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Todo,
  extractSubtasks,
  formatTaskDueDate,
  isTaskOverdue,
  isTaskWaiting,
  serializeSubtasks
} from '@/lib/taskUtils';

interface TaskCardProps {
  todo: Todo;
  onToggleComplete: (id: string, completed: boolean) => void;
  onStartFocus: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onMoveToTomorrow?: (id: string) => void;
  onToggleWaiting?: (id: string, currentWaiting: boolean) => void;
  onUpdateSubtasks?: (id: string, newDescription: string) => void;
  isFocusing?: boolean;
}

export function TaskCard({
  todo,
  onToggleComplete,
  onStartFocus,
  onEdit,
  onDelete,
  onMoveToTomorrow,
  onToggleWaiting,
  onUpdateSubtasks,
  isFocusing
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { cleanDescription, subtasks } = extractSubtasks(todo.description);
  const overdue = isTaskOverdue(todo);
  const waiting = isTaskWaiting(todo);

  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const totalSubtasks = subtasks.length;

  const handleSubtaskCheck = (stIndex: number, completed: boolean) => {
    if (!onUpdateSubtasks) return;
    const updated = [...subtasks];
    updated[stIndex] = { ...updated[stIndex], completed };
    const serialized = serializeSubtasks(cleanDescription, updated);
    onUpdateSubtasks(todo.id, serialized);
  };

  const priorityStyles = {
    high: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/40',
    medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/40',
    low: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
  };

  return (
    <div
      className={cn(
        'group relative bg-card hover:bg-card/90 rounded-xl border border-border/80 p-3.5 sm:p-4 transition-all duration-200 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-700',
        todo.completed && 'opacity-60 bg-muted/30 border-border/40',
        isFocusing && 'ring-2 ring-primary border-primary'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={todo.completed}
            onCheckedChange={(checked) => onToggleComplete(todo.id, !!checked)}
            className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-transform active:scale-90"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              onClick={() => totalSubtasks > 0 && setExpanded(!expanded)}
              className={cn(
                'text-sm sm:text-base font-medium text-foreground tracking-tight leading-snug select-text',
                totalSubtasks > 0 && 'cursor-pointer hover:text-primary transition-colors',
                todo.completed && 'line-through text-muted-foreground'
              )}
            >
              {todo.title}
            </h3>

            {/* Quick Actions (Desktop hover / Mobile tap) */}
            <div className="flex items-center gap-1 shrink-0 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {!todo.completed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartFocus(todo);
                  }}
                  className="h-7 px-2.5 text-xs font-medium bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20 transition-all gap-1 rounded-lg"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span className="hidden sm:inline">Fokus</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(todo);
                }}
                className="h-7 w-7 text-muted-foreground hover:text-foreground hidden sm:inline-flex"
                title="Edit Task"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onSelect={() => {
                      setTimeout(() => onEdit(todo), 50);
                    }}
                    className="gap-2 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Edit Detail
                  </DropdownMenuItem>

                  {!todo.completed && onMoveToTomorrow && (
                    <DropdownMenuItem
                      onSelect={() => onMoveToTomorrow(todo.id)}
                      className="gap-2 text-xs"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      Pindah ke Besok
                    </DropdownMenuItem>
                  )}

                  {!todo.completed && onToggleWaiting && (
                    <DropdownMenuItem
                      onSelect={() => onToggleWaiting(todo.id, waiting)}
                      className="gap-2 text-xs"
                    >
                      <Hourglass className="h-3.5 w-3.5 text-muted-foreground" />
                      {waiting ? 'Batal Menunggu' : 'Tandai Menunggu'}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onDelete(todo.id)}
                    className="gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Clean metadata bar */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
            {/* Priority dot / text */}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize',
                priorityStyles[todo.priority] || priorityStyles.medium
              )}
            >
              {todo.priority === 'high' && (
                <>
                  <Flame className="h-3 w-3 fill-rose-500/20" />
                  <span>High</span>
                </>
              )}
              {todo.priority === 'medium' && (
                <>
                  <Star className="h-3 w-3 fill-amber-500/20" />
                  <span>Medium</span>
                </>
              )}
              {todo.priority === 'low' && (
                <>
                  <Zap className="h-3 w-3 fill-sky-500/20" />
                  <span>Low</span>
                </>
              )}
            </span>

            {/* Category tag if present */}
            {todo.category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary/80 text-secondary-foreground text-[11px]">
                {todo.category}
              </span>
            )}

            {/* Deadline status */}
            {todo.due_date && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px]',
                  overdue ? 'text-destructive font-semibold' : 'text-muted-foreground'
                )}
              >
                <Clock className="h-3 w-3" />
                {formatTaskDueDate(todo.due_date)}
              </span>
            )}

            {/* Duration estimate */}
            {todo.estimated_duration_minutes && (
              <span className="text-[11px] text-muted-foreground/80">
                ~{todo.estimated_duration_minutes}m
              </span>
            )}

            {/* Subtask count toggle */}
            {totalSubtasks > 0 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline ml-auto"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>{completedSubtasks}/{totalSubtasks}</span>
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>

          {/* Subtasks Accordion */}
          {expanded && totalSubtasks > 0 && (
            <div className="mt-3 pt-2.5 border-t border-border/50 space-y-1.5 pl-1">
              {subtasks.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-muted/40 transition-colors"
                >
                  <Checkbox
                    checked={st.completed}
                    onCheckedChange={(checked) => handleSubtaskCheck(idx, !!checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600"
                  />
                  <span
                    className={cn(
                      'text-xs text-foreground/90 select-none',
                      st.completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
