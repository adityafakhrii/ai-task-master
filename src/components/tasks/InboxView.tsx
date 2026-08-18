import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Todo } from '@/lib/taskUtils';
import { Inbox, Plus, Sparkles, ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';

interface InboxViewProps {
  inboxTasks: Todo[];
  onToggleComplete: (id: string, completed: boolean) => void;
  onStartFocus: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onMoveToToday: (id: string) => void;
  onMoveToTomorrow: (id: string) => void;
  onQuickAddText: (text: string) => void;
  onOpenQuickAddModal: () => void;
}

export function InboxView({
  inboxTasks,
  onToggleComplete,
  onStartFocus,
  onEdit,
  onDelete,
  onMoveToToday,
  onMoveToTomorrow,
  onQuickAddText,
  onOpenQuickAddModal
}: InboxViewProps) {
  const [fastText, setFastText] = useState('');

  const handleFastAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastText.trim()) return;
    onQuickAddText(fastText.trim());
    setFastText('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Inbox
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
            {inboxTasks.length}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Tempat menampung ide dan tugas mentah sebelum dijadwalkan ke target harian.
        </p>
      </div>

      {/* Rapid Capture Input */}
      <form onSubmit={handleFastAdd} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={fastText}
            onChange={(e) => setFastText(e.target.value)}
            placeholder="Ketik ide atau task baru lalu tekan Enter..."
            className="h-11 px-4 text-sm rounded-xl border-border bg-card shadow-sm"
          />
        </div>

        <Button type="submit" className="h-11 px-4 rounded-xl text-xs sm:text-sm font-semibold gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Simpan</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onOpenQuickAddModal}
          className="h-11 px-3 text-xs gap-1.5 rounded-xl border-primary/20 text-primary bg-primary/5 hover:bg-primary/10"
          title="Quick Add dengan AI"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="hidden sm:inline">AI Add</span>
        </Button>
      </form>

      {/* Task List / Empty State */}
      {inboxTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center bg-card/40 space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Inbox Bersih!
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Semua task telah terorganisir ke Today atau terjadwal. Ketik di atas untuk menangkap task baru secara cepat.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inboxTasks.map(task => (
            <div key={task.id} className="relative group">
              <TaskCard
                todo={task}
                onToggleComplete={onToggleComplete}
                onStartFocus={onStartFocus}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoveToTomorrow={onMoveToTomorrow}
              />
              {/* Quick triage bar */}
              <div className="mt-1 flex items-center gap-2 px-2 text-xs">
                <button
                  type="button"
                  onClick={() => onMoveToToday(task.id)}
                  className="text-primary hover:underline text-[11px] font-medium inline-flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  Jadikan Target Hari Ini
                </button>
                <span className="text-muted-foreground/40">•</span>
                <button
                  type="button"
                  onClick={() => onMoveToTomorrow(task.id)}
                  className="text-muted-foreground hover:text-foreground text-[11px] inline-flex items-center gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  Jadwalkan Besok
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
