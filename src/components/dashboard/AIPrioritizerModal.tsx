import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, Loader2, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { PrioritizedDayResult, prioritizeDay } from '@/services/ai';
import { Todo } from '@/lib/taskUtils';
import { useToast } from '@/hooks/use-toast';

interface AIPrioritizerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Todo[];
  onStartFocus: (task: Todo) => void;
}

export function AIPrioritizerModal({
  open,
  onOpenChange,
  tasks,
  onStartFocus
}: AIPrioritizerModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prioritizedResult, setPrioritizedResult] = useState<PrioritizedDayResult | null>(null);

  const handleRunPrioritization = async () => {
    if (tasks.length === 0) {
      toast({ description: 'Belum ada task aktif untuk diurutkan.' });
      return;
    }

    try {
      setLoading(true);
      const result = await prioritizeDay(tasks);
      setPrioritizedResult(result);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Gagal Prioritisasi AI', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTopPriority = () => {
    if (!prioritizedResult || prioritizedResult.recommended_order.length === 0) return;
    const topItem = prioritizedResult.recommended_order[0];
    const matchingTask = tasks.find(t => t.id === topItem.id);
    if (matchingTask) {
      onOpenChange(false);
      onStartFocus(matchingTask);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto p-5 sm:p-6 rounded-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>Tanya AI Prioritas Harian</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Bingung mau mulai dari mana? AI bakal racik urutan eksekusi paling sat-set biar kerjaan bootcamp lo kelar tepat waktu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {!prioritizedResult && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ada <strong>{tasks.length} task aktif</strong> nih. Klik tombol di bawah biar AI susunin roadmap eksekusi paling mantap buat lo!
              </p>
              <Button
                onClick={handleRunPrioritization}
                disabled={loading}
                className="gap-2 rounded-xl px-5 font-semibold shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Lagi racik urutan terbaik...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Gas Minta AI Urutin Sekarang!</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {prioritizedResult && (
            <div className="space-y-4">
              {/* Strategy Explanation */}
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm leading-relaxed space-y-1">
                <div className="font-semibold text-primary flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Strategi Eksekusi dari AI:
                </div>
                <p className="text-foreground/90">{prioritizedResult.strategy_summary}</p>
              </div>

              {/* Recommended Ordered List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Urutan Pengerjaan Rekomendasi
                </h4>
                <div className="space-y-2">
                  {prioritizedResult.recommended_order.map((item, idx) => {
                    const isTop = idx === 0;
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-3 rounded-xl border transition-all ${
                          isTop
                            ? 'bg-card border-primary/40 shadow-sm ring-1 ring-primary/20'
                            : 'bg-card/50 border-border/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isTop ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {item.order || idx + 1}
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className={`text-sm font-medium truncate ${isTop ? 'font-semibold text-foreground' : ''}`}>
                                {item.title}
                              </h5>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground uppercase font-semibold">
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.reason}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {prioritizedResult.quick_wins_suggestion && (
                <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground flex items-start gap-1.5">
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Tips Tambahan: </strong>
                    <span>{prioritizedResult.quick_wins_suggestion}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs h-10"
          >
            Tutup
          </Button>

          {prioritizedResult && (
            <Button
              type="button"
              onClick={handleStartTopPriority}
              className="rounded-xl text-xs h-10 font-semibold px-5 shadow-sm gap-2"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Gas Task #1 Sekarang</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
