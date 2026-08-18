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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Mic,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Clock,
  Flame,
  Star,
  Zap,
  PenTool,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseTask, ParsedTaskResult } from '@/services/ai';
import { Todo, serializeSubtasks, SubtaskItem } from '@/lib/taskUtils';
import { DateTimePicker } from '@/components/ui/date-time-picker';

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

const CATEGORIES = [
  'Content',
  'Bootcamp',
  'Review & Grading',
  'Event / Closing',
  'Materi',
  'Community & Chat',
  'Admin',
  'Personal'
];

export function QuickAddModal({
  open,
  onOpenChange,
  onSubmit,
  editingTodo
}: QuickAddModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<string>('Bootcamp');
  const [dueDateIso, setDueDateIso] = useState<string | null>(null);
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
      setDueDateIso(editingTodo.due_date || null);
      setDuration(editingTodo.estimated_duration_minutes || 25);
      setTags(editingTodo.tags || []);
      setAiPreviewReady(true);
      setShowAdvanced(true);
      setInputText('');
      setActiveTab('manual');
    } else if (open) {
      // Reset form
      setInputText('');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Bootcamp');
      setDueDateIso(null);
      setDuration(25);
      setSubtasks([]);
      setTags([]);
      setAiPreviewReady(false);
      setShowAdvanced(false);
      setActiveTab('manual');
    }
  }, [editingTodo, open]);

  const handleAiParse = async (textToParse?: string) => {
    const raw = textToParse || inputText;
    if (!raw.trim()) {
      toast({ description: 'Ketik apa yang mau lo kerjain dulu ya bos.' });
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
      setDueDateIso(parsed.due_date || null);

      if (parsed.subtasks && parsed.subtasks.length > 0) {
        setSubtasks(parsed.subtasks.map((st, idx) => ({ id: `st-${idx}`, title: st, completed: false })));
      } else {
        setSubtasks([]);
      }

      setAiPreviewReady(true);
      toast({ title: 'Mantap, AI berhasil racik task lo!' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Waduh AI lagi pusing', description: err.message });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Browser Belum Support', description: 'Pake Google Chrome ya biar fitur suara bisa jalan.' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      toast({ title: 'Lagi dengerin nih...', description: 'Ngomong aja rencana task lo.' });
    };

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      setIsRecording(false);
      handleAiParse(transcript);
    };

    recognition.onerror = (e: any) => {
      setIsRecording(false);
      toast({ variant: 'destructive', title: 'Mic error euy', description: e.error });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleSave = () => {
    const finalTitle = title.trim() || (activeTab === 'ai' ? inputText.trim() : '');
    if (!finalTitle) {
      toast({ variant: 'destructive', description: 'Judul task jangan dikosongin dong!' });
      return;
    }

    const finalDescription = serializeSubtasks(description, subtasks);

    onSubmit({
      title: finalTitle,
      description: finalDescription || null,
      priority,
      category: category || null,
      due_date: dueDateIso,
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
            <PenTool className="h-5 w-5 text-primary" />
            <span>{editingTodo ? 'Edit Detail Task' : 'Tambah Task Baru'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {editingTodo
              ? 'Atur ulang detail task atau checklist di bawah ini.'
              : 'Pilih input manual sat-set atau minta bantuan AI buat parse otomatis.'}
          </DialogDescription>
        </DialogHeader>

        {/* MODE SWITCHER TABS (If not editing) */}
        {!editingTodo && (
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full pt-1">
            <TabsList className="grid grid-cols-2 w-full h-10 p-1 bg-muted/60 rounded-xl">
              <TabsTrigger value="manual" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <PenTool className="h-3.5 w-3.5 text-primary" />
                <span>Input Manual</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Parse AI Otomatis</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="space-y-4 pt-1">
          {/* TAB 1: AI PARSING INPUT */}
          {!editingTodo && activeTab === 'ai' && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ceritain Rencana Lo
              </Label>
              <div className="relative">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Contoh: Besok jam 4 sore buat script video promosi cloud dan review materi bootcamp..."
                  className="min-h-[90px] pr-20 resize-none text-sm rounded-xl border-border bg-background/50 focus:bg-background"
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

          {/* MAIN FORM: Visible in Manual Tab or in AI Tab after preview ready / Editing */}
          {(activeTab === 'manual' || aiPreviewReady || editingTodo) && (
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-sm">
              {activeTab === 'ai' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Hasil Interpretasi AI
                  </span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Judul Task *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mau beresin apa nih? (contoh: Bikin Slide Bootcamp #3)"
                  className="font-medium text-sm rounded-lg"
                />
              </div>

              {/* Priority, Category, Due Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Priority */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Prioritas</Label>
                  <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                    <SelectTrigger className="h-9 text-xs rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                          <Flame className="h-3.5 w-3.5 fill-rose-500/20" />
                          <span>Penting Banget (High)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-500/20" />
                          <span>Sedang (Medium)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                          <Zap className="h-3.5 w-3.5 fill-sky-500/20" />
                          <span>Sat-Set (Quick Win)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category with "Pilih Kategori" placeholder and Content category */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Kategori</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9 text-xs rounded-lg">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Styled DateTimePicker */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Deadline / Tenggat</Label>
                  <DateTimePicker
                    value={dueDateIso}
                    onChange={setDueDateIso}
                    placeholder="Pilih deadline..."
                  />
                </div>
              </div>

              {/* Subtasks Checklist */}
              <div className="space-y-2 pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Checklist Langkah Kecil ({subtasks.length})
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addSubtask}
                    className="h-6 text-[11px] text-primary hover:text-primary px-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah Checklist
                  </Button>
                </div>

                {subtasks.length > 0 && (
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
                )}
              </div>

              {/* Additional Notes & Duration */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Catatan / Link Referensi Tambahan</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tempel link Figma, repo GitHub, atau catatan penting di sini..."
                    className="min-h-[65px] text-xs resize-none rounded-lg"
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
            {editingTodo ? 'Simpan Perubahan' : 'Gass Simpan Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
