import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, RotateCcw, Sparkles, CheckCircle2, X, Plus, Clock, FileText, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sliceTask } from '@/services/ai';
import { Todo, extractSubtasks, serializeSubtasks, SubtaskItem } from '@/lib/taskUtils';
import confetti from 'canvas-confetti';

export interface FocusModeProps {
  task: Todo;
  whyNow?: string;
  onComplete: (id: string) => void;
  onClose: () => void;
  onUpdateSubtasks?: (id: string, newDescription: string) => void;
}

export function FocusMode({
  task,
  whyNow,
  onComplete,
  onClose,
  onUpdateSubtasks
}: FocusModeProps) {
  const { toast } = useToast();

  // Timer state
  const defaultMinutes = task.estimated_duration_minutes || (task.priority === 'high' ? 45 : 25);
  const [selectedMinutes, setSelectedMinutes] = useState(defaultMinutes);
  const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  // Subtasks & Notes
  const { cleanDescription, subtasks: initialSubtasks } = extractSubtasks(task.description);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>(initialSubtasks);
  const [notes, setNotes] = useState('');
  const [isSlicingLoading, setIsSlicingLoading] = useState(false);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Update timer if selectedMinutes changes
  const setTimerPreset = (mins: number) => {
    setIsActive(false);
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {}
      toast({
        title: 'Sesi Fokus Beres!',
        description: 'Gokil, lo fokus banget barusan! Ambil nafas bentar atau lanjut gas lagi.'
      });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, toast]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(selectedMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Subtask helpers
  const toggleSubtask = (index: number) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);

    if (onUpdateSubtasks) {
      const serialized = serializeSubtasks(cleanDescription, updated);
      onUpdateSubtasks(task.id, serialized);
    }
  };

  const addManualSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    const updated = [...subtasks, { id: `st-${Date.now()}`, title: newSubtaskInput.trim(), completed: false }];
    setSubtasks(updated);
    setNewSubtaskInput('');

    if (onUpdateSubtasks) {
      const serialized = serializeSubtasks(cleanDescription, updated);
      onUpdateSubtasks(task.id, serialized);
    }
  };

  const handleSliceWithAI = async () => {
    try {
      setIsSlicingLoading(true);
      const generated = await sliceTask(task.title);
      const newItems: SubtaskItem[] = generated.map((st, idx) => ({
        id: `st-ai-${Date.now()}-${idx}`,
        title: st,
        completed: false
      }));

      const merged = [...subtasks, ...newItems];
      setSubtasks(merged);

      if (onUpdateSubtasks) {
        const serialized = serializeSubtasks(cleanDescription, merged);
        onUpdateSubtasks(task.id, serialized);
      }

      toast({ title: 'Mantap! Task berhasil dipecah jadi langkah kecil' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Waduh gagal mecah task', description: err.message });
    } finally {
      setIsSlicingLoading(false);
    }
  };

  const handleFinishTask = () => {
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch {}
    onComplete(task.id);
    onClose();
  };

  const totalTime = selectedMinutes * 60;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 overflow-y-auto animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wider">
            Mode Fokus / Deep Work
          </span>
          {task.category && (
            <span className="text-xs text-muted-foreground">• {task.category}</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-9 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground rounded-xl"
        >
          <X className="h-4 w-4" />
          <span>Keluar Sesi</span>
        </Button>
      </div>

      {/* Main Focus Area */}
      <div className="max-w-2xl w-full mx-auto my-auto py-6 space-y-8 text-center">
        {/* Task Title & AI Reason */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {task.title}
          </h1>

          {whyNow && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/80 text-secondary-foreground text-xs sm:text-sm font-medium border border-border">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>
                <strong>Kenapa sekarang?</strong> {whyNow}
              </span>
            </div>
          )}
        </div>

        {/* Minimal Circular / Digital Timer */}
        <div className="space-y-4">
          <div className="text-6xl sm:text-8xl font-mono font-bold tracking-tighter text-foreground select-none">
            {formatTime(timeLeft)}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={toggleTimer}
              className="h-14 px-8 rounded-2xl text-base font-semibold shadow-md gap-2"
            >
              {isActive ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              <span>{isActive ? 'Pause Dulu' : 'Gas Timer!'}</span>
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={resetTimer}
              className="h-14 w-14 rounded-2xl border-slate-300 dark:border-slate-700"
              title="Reset Timer"
            >
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Preset Buttons (25m / 45m / 50m) */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[15, 25, 45, 50].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setTimerPreset(mins)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  selectedMinutes === mins
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="text-left bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Langkah Kerja ({subtasks.filter(s => s.completed).length}/{subtasks.length})
            </h3>

            {subtasks.length === 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSliceWithAI}
                disabled={isSlicingLoading}
                className="h-7 text-xs bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 gap-1 rounded-lg"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>{isSlicingLoading ? 'Lagi mecah...' : 'Pecah pake AI'}</span>
              </Button>
            )}
          </div>

          {subtasks.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {subtasks.map((st, idx) => (
                <div
                  key={st.id || idx}
                  onClick={() => toggleSubtask(idx)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                    st.completed ? 'bg-muted/40 opacity-70' : 'hover:bg-muted/50 bg-secondary/30'
                  }`}
                >
                  <CheckCircle2
                    className={`h-5 w-5 shrink-0 mt-0.5 ${
                      st.completed ? 'text-primary' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span className={`text-sm ${st.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Subtask Input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newSubtaskInput}
              onChange={(e) => setNewSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addManualSubtask();
                }
              }}
              placeholder="Tambah checklist baru..."
              className="h-9 px-3 text-xs bg-background border border-border rounded-xl flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={addManualSubtask}
              disabled={!newSubtaskInput.trim()}
              className="h-9 px-3 text-xs rounded-xl"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Scratchpad Session Notes */}
        <div className="text-left bg-card/60 rounded-2xl border border-border p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            <span>Coretan Kilat (Scratchpad)</span>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis ide kilat, link penting, atau coretan sementara..."
            className="min-h-[70px] text-xs resize-none rounded-xl border-border bg-background/50"
          />
        </div>
      </div>

      {/* Bottom Completion Action */}
      <div className="max-w-md w-full mx-auto pt-4 border-t border-border flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 h-12 rounded-xl text-xs sm:text-sm"
        >
          Nanti Dulu / Keluar
        </Button>

        <Button
          onClick={handleFinishTask}
          className="flex-1 h-12 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-md"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Tandai Kelar!</span>
        </Button>
      </div>
    </div>
  );
}
