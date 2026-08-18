import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Mic, Loader2, CheckCircle2, ChevronDown, ChevronUp, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseTask, ParsedTaskResult } from '@/services/ai';
import { Todo, serializeSubtasks, SubtaskItem } from '@/lib/taskUtils';
import { format, parseISO } from 'date-fns';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskData: {
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    category: string | null;
    due_date: string | null;
    estimated_duration_minutes: number | null;
    tags: string[] | null;
  }) => void;
  editingTodo?: Todo | null;
}

export function QuickAddModal({
  open,
  onOpenChange,
  onSubmit,
  editingTodo
}: QuickAddModalProps) {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<string>('Bootcamp');
  const [dueDateStr, setDueDateStr] = useState<string>('');
  const [duration, setDuration] = useState<number | ''>(25);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [aiPreviewReady, setAiPreviewReady] = useState(false);

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setPriority(editingTodo.priority);
      setCategory(editingTodo.category || 'Bootcamp');
      setDueDateStr(editingTodo.due_date ? format(parseISO(editingTodo.due_date), "yyyy-MM-dd'T'HH:mm") : '');
      setDuration(editingTodo.estimated_duration_minutes || 25);
      setTags(editingTodo.tags || []);
      setAiPreviewReady(true);
      setShowAdvanced(true);
      setInputText('');
    } else if (open) {
      // Reset form
      setInputText('');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Bootcamp');
      setDueDateStr('');
      setDuration(25);
      setSubtasks([]);
      setTags([]);
      setAiPreviewReady(false);
      setShowAdvanced(false);
    }
  }, [editingTodo, open]);

  const handleAiParse = async (textToParse?: string) => {
    const raw = textToParse || inputText;
    if (!raw.trim()) {
      toast({ description: 'Tuliskan deskripsi apa yang ingin kamu kerjakan dulu ya.' });
      return;
    }

    try {
      setIsAiLoading(true);
      const parsed: ParsedTaskResult = await parseTask(raw);

      setTitle(parsed.title);
      setDescription(parsed.description || raw);
      setPriority(parsed.priority);
      setCategory(parsed.category || 'Bootcamp');
      setDuration(parsed.estimated_duration_minutes || (parsed.priority === 'high' ? 45 : 25));
      setTags(parsed.tags || []);

      if (parsed.due_date) {
        try {
          const d = parseISO(parsed.due_date);
          setDueDateStr(format(d, "yyyy-MM-dd'T'HH:mm"));
        } catch {
          setDueDateStr('');
        }
      } else {
        setDueDateStr('');
      }

      if (parsed.subtasks && parsed.subtasks.length > 0) {
        setSubtasks(parsed.subtasks.map((st, idx) => ({ id: `st-${idx}`, title: st, completed: false })));
      } else {
        setSubtasks([]);
      }

      setAiPreviewReady(true);
      toast({ title: 'AI berhasil menyusun task!' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Gagal parse AI', description: err.message });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Browser Tidak Mendukung', description: 'Gunakan Google Chrome untuk fitur suara.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      toast({ title: 'Mendengarkan...', description: 'Silakan sebutkan apa yang ingin kamu kerjakan.' });
    };

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      setIsRecording(false);
      handleAiParse(transcript);
    };

    recognition.onerror = (e: any) => {
      setIsRecording(false);
      toast({ variant: 'destructive', title: 'Error Mikrofon', description: e.error });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleSave = () => {
    if (!title.trim() && !inputText.trim()) {
      toast({ variant: 'destructive', description: 'Judul task tidak boleh kosong.' });
      return;
    }

    const finalTitle = title.trim() || inputText.trim();
    const finalDescription = serializeSubtasks(description, subtasks);
    const finalDueDate = dueDateStr ? new Date(dueDateStr).toISOString() : null;

    onSubmit({
      title: finalTitle,
      description: finalDescription || null,
      priority,
      category: category || null,
      due_date: finalDueDate,
      estimated_duration_minutes: typeof duration === 'number' ? duration : null,
      tags: tags.length > 0 ? tags : null
    });

    onOpenChange(false);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { id: `st-${Date.now()}`, title: '', completed: false }]);
  };

  const updateSubtaskTitle = (index: number, newTitle: string) => {
    const updated = [...subtasks];
    updated[index].title = newTitle;
    setSubtasks(updated);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-2xl">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>{editingTodo ? 'Edit Task' : 'Quick Add Task'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {editingTodo
              ? 'Perbarui detail task atau gunakan AI untuk menyempurnakan checklist.'
              : 'Deskripsikan secara santai, AI akan langsung menstrukturkan prioritas, deadline, dan subtask.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* PRIMARY NATURAL LANGUAGE INPUT (If not editing or before AI parse) */}
          {!editingTodo && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Deskripsikan Rencana
              </Label>
              <div className="relative">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Contoh: Besok closing bootcamp, gue harus siapin rundown dan cek peserta showcase..."
                  className="min-h-[90px] pr-20 resize-none text-sm rounded-xl border-slate-300 dark:border-slate-700 bg-background/50 focus:bg-background"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleAiParse();
                    }
                  }}
                />
                <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="icon"
                    variant={isRecording ? 'destructive' : 'ghost'}
                    onClick={handleVoiceInput}
                    className="h-8 w-8 rounded-lg"
                    title="Input Suara"
                  >
                    <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : 'text-muted-foreground'}`} />
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAiParse()}
                    disabled={isAiLoading || !inputText.trim()}
                    className="h-8 px-3 text-xs gap-1.5 rounded-lg shadow-sm bg-primary text-primary-foreground"
                  >
                    {isAiLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    <span>Parse AI</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* AI INTERPRETATION PREVIEW / EDITABLE CARD */}
          {(aiPreviewReady || editingTodo) && (
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Preview Task Terstruktur
                </span>

                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1"
                >
                  <span>{showAdvanced ? 'Tutup Detail' : 'Edit Detail Lengkap'}</span>
                  {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Judul Task</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul task..."
                  className="font-medium text-sm rounded-lg"
                />
              </div>

              {/* Quick Pills Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Prioritas</Label>
                  <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                    <SelectTrigger className="h-9 text-xs rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🔥 High Priority</SelectItem>
                      <SelectItem value="medium">⭐ Medium</SelectItem>
                      <SelectItem value="low">⚡ Quick Win (Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Kategori</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 text-xs rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                      <SelectItem value="Review & Grading">Review & Grading</SelectItem>
                      <SelectItem value="Event / Closing">Event / Closing</SelectItem>
                      <SelectItem value="Materi">Materi</SelectItem>
                      <SelectItem value="Community & Chat">Community & Chat</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Tenggat Waktu</Label>
                  <Input
                    type="datetime-local"
                    value={dueDateStr}
                    onChange={(e) => setDueDateStr(e.target.value)}
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
              </div>

              {/* Suggested Subtasks Checklist */}
              {subtasks.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Subtasks / Checklist ({subtasks.length})
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addSubtask}
                      className="h-6 text-[11px] text-primary hover:text-primary px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Tambah Subtask
                    </Button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {subtasks.map((st, idx) => (
                      <div key={st.id || idx} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                        <Input
                          value={st.title}
                          onChange={(e) => updateSubtaskTitle(idx, e.target.value)}
                          placeholder="Langkah pengerjaan..."
                          className="h-8 text-xs rounded-lg flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSubtask(idx)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADVANCED / FULL DETAIL SECTION */}
              {showAdvanced && (
                <div className="space-y-3 pt-3 border-t border-border/60">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Catatan / Deskripsi Tambahan</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detail catatan tambahan..."
                      className="min-h-[70px] text-xs resize-none rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Estimasi Waktu (Menit)</Label>
                      <Input
                        type="number"
                        min="5"
                        max="480"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : '')}
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>
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
            Batal
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            className="rounded-xl text-xs h-10 font-semibold px-5 shadow-sm"
          >
            {editingTodo ? 'Simpan Perubahan' : 'Terapkan & Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
