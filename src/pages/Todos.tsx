import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/MobileLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Bell, Calendar, User, LogOut, CheckCircle2, Search, Loader2, Sparkles, AlertCircle, Edit, Trash2, Clock, SparklesIcon, ListFilter, ArrowUpDown, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { parseTask, dailySummary, detectAnomaly, rescheduleTasks } from '@/services/ai';
import { Input as TextInput } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FocusMode } from '@/components/FocusMode';
import confetti from 'canvas-confetti';
import { AIPopupRoast } from '@/components/AIPopupRoast';
import { ModeToggle } from '@/components/mode-toggle';

interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  estimated_duration_minutes: number | null;
  tags: string[] | null;
}

export default function Todos() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    due_date: null as Date | null
  });
  const [nlInput, setNlInput] = useState('');
  const [aiHints, setAiHints] = useState<{ recommendedPriority?: 'low' | 'medium' | 'high'; estimatedMinutes?: number | null; suggestions?: { subtasks?: string[]; checklist?: string[]; templates?: string[] } } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const auditLogRef = useRef<Record<string, { snapshot: Todo; timestamp: string; actor: string }[]>>({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [dailyData, setDailyData] = useState<any | null>(null);
  const [anomalyOpen, setAnomalyOpen] = useState(false);
  const [anomalyData, setAnomalyData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'overdue'>('active');
  const [focusTask, setFocusTask] = useState<Todo | null>(null);

  // Filter states
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'overdue'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  // Sort state
  const [sortBy, setSortBy] = useState<'urgency' | 'priority' | 'due_date' | 'created_at' | 'title'>('urgency');

  // Loading states
  const [aiLoading, setAiLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [completeLoading, setCompleteLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTodos();
  }, [user, authLoading, navigate]);

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      openNewDialog();
    }
  }, [location.search]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos((data || []) as Todo[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Waduh Error",
        description: error.message
      });
    } finally {
      setTodosLoading(false);
    }
  };

  // Get unique categories and tags for filter dropdowns
  const uniqueCategories = Array.from(new Set(todos.map(t => t.category).filter(Boolean)));
  const uniqueTags = Array.from(new Set(todos.flatMap(t => t.tags || []).filter(Boolean)));

  // Filter and sort function
  const filterAndSortTodos = (todosToFilter: Todo[]) => {
    let filtered = [...todosToFilter];

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Apply tag filter
    if (filterTag !== 'all') {
      filtered = filtered.filter(t => t.tags?.includes(filterTag));
    }

    // Apply date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(t => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);

        switch (filterDateRange) {
          case 'today':
            return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case 'week':
            return dueDate >= today && dueDate <= weekFromNow;
          case 'overdue':
            return dueDate < now;
          default:
            return true;
        }
      });
    }

    // 3. Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          // Priority order: high > medium > low
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];

          if (priorityDiff !== 0) return priorityDiff;

          // If same priority, sort by deadline (closest first)
          if (a.due_date && b.due_date) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          }
          if (a.due_date) return -1;
          if (b.due_date) return 1;

          // If no deadline, sort by created date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        case 'priority':
          const pOrder = { high: 3, medium: 2, low: 1 };
          return pOrder[b.priority] - pOrder[a.priority];

        case 'due_date':
          // Tasks with no due date go to the end
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();

        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        case 'title':
          return a.title.localeCompare(b.title);

        default:
          return 0;
      }
    });

    return filtered;
  };

  const applyAIAssist = async () => {
    if (!nlInput.trim()) return;
    try {
      setAiLoading(true);
      const result = await parseTask(nlInput.trim());

      // Parse due_date if available
      let parsedDueDate: Date | null = null;
      if (result.due_date && typeof result.due_date === 'string') {
        try {
          parsedDueDate = new Date(result.due_date);
          if (isNaN(parsedDueDate.getTime())) {
            parsedDueDate = null;
          }
        } catch {
          parsedDueDate = null;
        }
      }

      // Auto-populate description with AI summary
      const aiGeneratedDescription = result.summary || formData.description;

      setFormData({
        title: result.title || formData.title,
        description: aiGeneratedDescription,
        priority: (result.priority === 'low' || result.priority === 'medium' || result.priority === 'high') ? result.priority : formData.priority,
        category: result.category || formData.category,
        due_date: parsedDueDate
      });
      setAiHints({
        recommendedPriority: (result.priority === 'low' || result.priority === 'medium' || result.priority === 'high') ? result.priority : undefined,
        estimatedMinutes: typeof result.estimated_duration_minutes === 'number' ? result.estimated_duration_minutes : null,
        suggestions: result.suggestions || {}
      });
      if (result.tags && Array.isArray(result.tags)) {
        const tagCat = result.tags.find((t: string) => typeof t === 'string' && t.length > 0);
        if (tagCat) setFormData((p) => ({ ...p, category: p.category || tagCat }));
      }
      toast({ title: 'AI berhasil memproses deskripsi tugas' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Gagal AI parse', description: err.message });
    } finally {
      setAiLoading(false);
    }
  };

  const startVoiceRecording = () => {
    // @ts-ignore - SpeechRecognition is not standard across all browsers
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Waduh', description: 'Browser lo gak support fitur suara nih (coba pake Chrome).' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      toast({ title: 'Lagi dengerin...', description: 'Ngomong aja tugas lo apa' });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNlInput(transcript);
      setIsRecording(false);
      // Automatically trigger AI assist right after recording
      setTimeout(() => {
        // We set input first, but state is async, so we directly parse transcript
        setNlInput(transcript);
        const dummyEvent = new Event('submit') as unknown as React.FormEvent;
        // In a real scenario we might want to manually invoke parseTask here 
        // but for safety we let the user click the button to confirm the parsed text
      }, 500);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal dengerin suara: ' + event.error });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitLoading(true);
      if (editingTodo) {
        const prev = { ...editingTodo };
        const { error } = await supabase
          .from('todos')
          .update({
            title: formData.title,
            description: formData.description || null,
            priority: formData.priority,
            category: formData.category || null,
            due_date: formData.due_date ? formData.due_date.toISOString() : null,
            estimated_duration_minutes: aiHints?.estimatedMinutes || null,
            tags: aiHints?.suggestions?.subtasks || null
          })
          .eq('id', editingTodo.id);

        if (error) throw error;
        toast({ title: "Tugas berhasil diupdate, mantap!" });
        const log = auditLogRef.current[prev.id] || [];
        auditLogRef.current[prev.id] = [...log, { snapshot: prev, timestamp: new Date().toISOString(), actor: user!.id }];
      } else {
        const { error } = await supabase
          .from('todos')
          .insert({
            title: formData.title,
            description: formData.description || null,
            priority: formData.priority,
            category: formData.category || null,
            user_id: user!.id,
            due_date: formData.due_date ? formData.due_date.toISOString() : null,
            estimated_duration_minutes: aiHints?.estimatedMinutes || null,
            tags: aiHints?.suggestions?.subtasks || null
          });

        if (error) throw error;
        toast({ title: "Tugas baru berhasil dibuat!" });
      }

      setFormData({ title: '', description: '', priority: 'medium', category: '', due_date: null });
      setEditingTodo(null);
      setDialogOpen(false);
      setAiHints(null);
      setNlInput('');
      fetchTodos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Waduh Error",
        description: error.message
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const runDailySummary = async () => {
    try {
      setSummaryLoading(true);
      const data = await dailySummary(todos);
      setDailyData(data);
      setSummaryOpen(true);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Gagal membuat ringkasan', description: err.message });
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAutoReschedule = async () => {
    const overdueTasks = todos.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date());
    if (overdueTasks.length === 0) return;

    try {
      setRescheduleLoading(true);
      const data = overdueTasks.map(t => ({ id: t.id, title: t.title, priority: t.priority }));
      const response = await rescheduleTasks(data);

      if (response && response.rescheduled_tasks) {
        let successCount = 0;
        for (const item of response.rescheduled_tasks) {
          const { error } = await supabase
            .from('todos')
            .update({ due_date: item.suggested_due_date })
            .eq('id', item.id)
            .eq('user_id', user!.id);

          if (!error) successCount++;
        }

        if (successCount > 0) {
          toast({ title: 'Jadwal Pintar AI', description: `Berhasil mengatur ulang ${successCount} tugas!` });
          fetchTodos(); // Refresh list
        }
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error AI Reschedule', description: error.message });
    } finally {
      setRescheduleLoading(false);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    const updatedStatus = !todo.completed;

    if (updatedStatus) {
      const remainingUncompleted = todos.filter(t => !t.completed && t.id !== todo.id).length;
      if (remainingUncompleted === 0 && todos.length > 0) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6']
        });
        toast({ title: '🎉 Mantap Jiwa!', description: 'Level keditjayaan: Maksimal! Semua tugas lu beres cuy!' });
      }
    }

    // Optimistic update
    setTodos(prev => prev.map(t =>
      t.id === todo.id ? { ...t, completed: updatedStatus } : t
    ));

    try {
      setCompleteLoading(prev => ({ ...prev, [todo.id]: true }));
      const { error } = await supabase
        .from('todos')
        .update({ completed: updatedStatus })
        .eq('id', todo.id);

      if (error) {
        // Revert on error
        setTodos(prev => prev.map(t =>
          t.id === todo.id ? { ...t, completed: !updatedStatus } : t
        ));
        toast({
          variant: "destructive",
          title: "Gagal Update",
          description: error.message
        });
      }
    } finally {
      setCompleteLoading(prev => ({ ...prev, [todo.id]: false }));
    }
  };

  const runAnomalyDetection = async () => {
    try {
      setAnomalyLoading(true);

      // Prepare task data for anomaly detection - include all todos with their metadata
      const taskData = todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        priority: todo.priority,
        category: todo.category,
        completed: todo.completed,
        created_at: todo.created_at,
        updated_at: todo.updated_at,
        due_date: todo.due_date,
        estimated_duration_minutes: todo.estimated_duration_minutes
      }));

      const res = await detectAnomaly(taskData);
      setAnomalyData(res);
      setAnomalyOpen(true);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Deteksi gagal', description: err.message });
    } finally {
      setAnomalyLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      setDeleteLoading(prev => ({ ...prev, [id]: true }));
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Tugas berhasil dihapus, bye-bye!" });
      fetchTodos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Waduh Error",
        description: error.message
      });
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      category: todo.category || '',
      due_date: todo.due_date ? new Date(todo.due_date) : null
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingTodo(null);
    setFormData({ title: '', description: '', priority: 'medium', category: '', due_date: null });
    setAiHints(null);
    setNlInput('');
    setDialogOpen(true);
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await signOut();
    setSignOutLoading(false);
    navigate('/auth');
  };

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  // Memoize filtered and sorted lists so React correctly redraws them on searchQuery change
  const activeTodos = filterAndSortTodos(todos.filter(t => {
    if (t.completed) return false;
    if (!t.due_date) return true;
    return new Date(t.due_date) >= new Date();
  }));

  const overdueTodos = filterAndSortTodos(todos.filter(t => {
    if (t.completed) return false;
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date();
  }));

  const completedTodos = filterAndSortTodos(todos.filter(t => t.completed)).sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  if (todosLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Sabar ya bestie...</p>
      </div>
    );
  }

  return (
    <MobileLayout>
      <AIPopupRoast todos={todos} />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container mx-auto p-4 pb-24 max-w-4xl">
          {/* Mobile-First Header */}
          <header className="mb-6 space-y-4" role="banner">
            {/* Top Bar: Branding + User Actions */}
            <div className="flex items-center justify-between gap-4">
              {/* Branding */}
              <div className="flex items-center gap-2">
                <img src="/CatetYuk3.png" alt="CatetYuk Logo" className="h-14 w-14 flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight">CatetYuk</h1>
                  <p className="text-xs text-muted-foreground">Simplify your task</p>
                </div>
              </div>

              {/* Theme Toggle & User Menu */}
              <div className="flex items-center gap-3">
                <ModeToggle />
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    aria-label="Buka profil pengguna"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{user?.user_metadata.full_name || user?.email?.split('@')[0] || 'Profil'}</span>
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    aria-label="Keluar dari aplikasi"
                    loading={signOutLoading}
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{signOutLoading ? 'Cabut dulu...' : 'Keluar'}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Bar - Removed */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* AI Features - Horizontal Scroll on Mobile */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Button
                  onClick={runDailySummary}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  aria-label="Lihat ringkasan harian"
                  loading={summaryLoading}
                >
                  {summaryLoading ? 'Tunggu...' : 'Ringkasan'}
                </Button>
                <Button
                  onClick={runAnomalyDetection}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  aria-label="Deteksi anomali tugas"
                  loading={anomalyLoading}
                >
                  {anomalyLoading ? 'Analisis...' : 'Anomali'}
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-dashed whitespace-nowrap">
                      <ListFilter className="mr-2 h-4 w-4" />
                      Filter & Urutkan
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Filter Tugas</h4>
                        <p className="text-sm text-muted-foreground">
                          Atur tampilan tugas sesuai kebutuhan.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
                          <SelectTrigger className="w-full" aria-label="Filter berdasarkan prioritas">
                            <SelectValue placeholder="Prioritas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Prioritas</SelectItem>
                            <SelectItem value="high">Penting Banget</SelectItem>
                            <SelectItem value="medium">Biasa Aja</SelectItem>
                            <SelectItem value="low">Santai</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="w-full" aria-label="Filter berdasarkan kategori">
                            <SelectValue placeholder="Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {uniqueCategories.map((cat) => (
                              <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={filterDateRange} onValueChange={(value: any) => setFilterDateRange(value)}>
                          <SelectTrigger className="w-full" aria-label="Filter berdasarkan deadline">
                            <SelectValue placeholder="Deadline" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Deadline</SelectItem>
                            <SelectItem value="overdue">Telat</SelectItem>
                            <SelectItem value="today">Hari Ini</SelectItem>
                            <SelectItem value="week">Minggu Ini</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={filterTag} onValueChange={setFilterTag}>
                          <SelectTrigger className="w-full" aria-label="Filter berdasarkan tag">
                            <SelectValue placeholder="Tag" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Tag</SelectItem>
                            {uniqueTags.map((tag) => (
                              <SelectItem key={tag} value={tag}>#{tag}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                          <SelectTrigger className="w-full bg-secondary/20 border-primary/20" aria-label="Urutkan tugas berdasarkan">
                            <ArrowUpDown className="h-4 w-4 mr-2 text-primary" aria-hidden="true" />
                            <SelectValue placeholder="Urutkan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urgency">Urgensi (Default)</SelectItem>
                            <SelectItem value="priority">Prioritas</SelectItem>
                            <SelectItem value="due_date">Tanggal Deadline</SelectItem>
                            <SelectItem value="created_at">Tanggal Dibuat</SelectItem>
                            <SelectItem value="title">Judul (A-Z)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Filter Section */}
            {/* Filter & Sort Section */}

            {/* Filter & Sort Section */}


            {/* <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
               ... (Previous implementation)
            </div> */}
          </header>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openNewDialog}
                className="w-full mb-6 hidden md:flex"
                size="lg"
                aria-label="Tambah tugas baru"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="truncate">Tambah Tugas Baru</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-lg p-0 gap-0 rounded-none sm:rounded-lg overflow-hidden flex flex-col">
              <form onSubmit={handleSubmit} className="flex flex-col h-full w-full overflow-hidden">
                <div className="p-6 pb-2">
                  <DialogHeader>
                    <DialogTitle>{editingTodo ? 'Edit Tugas' : 'Bikin Tugas Baru'}</DialogTitle>
                    <DialogDescription>
                      {editingTodo ? 'Update detail tugas lo di bawah ini.' : 'Tambahin tugas baru ke list lo.'}
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <ScrollArea className="flex-1 w-full">
                  <div className="p-6 pt-2 space-y-6">
                    {/* AI Section */}
                    <div className="space-y-3 pb-4 border-b">
                      <div className="space-y-2">
                        <Label>Deskripsi Bahasa Alami (atau pakai suara 🎙️)</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="contoh: besok pagi kirim laporan ke klien"
                            value={nlInput}
                            onChange={(e) => setNlInput(e.target.value)}
                            className="border-border focus-visible:ring-0 focus-visible:border-primary/50"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={startVoiceRecording}
                            className={cn("flex-shrink-0 transition-all", isRecording && "bg-red-100 text-red-600 border-red-300 animate-pulse")}
                            aria-label="Rekam suara"
                          >
                            {isRecording ? <Loader2 className="h-4 w-4 animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 lucide lucide-mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={applyAIAssist}
                          variant="secondary"
                          type="button"
                          loading={aiLoading}
                          className="w-full sm:w-auto bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 transform hover:scale-105"
                        >
                          {aiLoading ? 'Lagi mikir...' : 'Gas Analisis AI'}
                        </Button>
                        {typeof aiHints?.estimatedMinutes === 'number' && (
                          <Badge variant="outline" className="justify-center sm:justify-start bg-primary/5 border-primary/20 text-primary py-2 sm:py-0">Estimasi: {aiHints?.estimatedMinutes} menit</Badge>
                        )}
                      </div>
                    </div>

                    {/* Manual Inputs */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Judul Tugas</Label>
                        <Input
                          id="title"
                          placeholder="Mau ngapain hari ini?"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          placeholder="Kasih detail dikit..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="priority">Seberapa Penting?</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value: 'low' | 'medium' | 'high') =>
                              setFormData({ ...formData, priority: value })
                            }
                          >
                            <SelectTrigger id="priority">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent z-index={150}>
                              <SelectItem value="low">Santai</SelectItem>
                              <SelectItem value="medium">Biasa Aja</SelectItem>
                              <SelectItem value="high">Penting Banget</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Kategori</Label>
                          <Input
                            id="category"
                            placeholder="misal: Kerjaan, Pribadi"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal & Jam Jatuh Tempo (Opsional)</Label>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.due_date && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {formData.due_date ? format(formData.due_date, "PPP 'pukul' HH:mm", { locale: idLocale }) : "Pilih tanggal & jam"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.due_date || undefined}
                              onSelect={(date) => setFormData({ ...formData, due_date: date || null })}
                              initialFocus
                            />
                            <div className="p-3 border-t border-border">
                              <Label className="text-sm mb-2 block">Jam</Label>
                              <div className="flex gap-2 items-center">
                                <Select
                                  value={formData.due_date ? formData.due_date.getHours().toString() : undefined}
                                  onValueChange={(value) => {
                                    const hours = parseInt(value);
                                    const newDate = formData.due_date ? new Date(formData.due_date) : new Date();
                                    newDate.setHours(hours);
                                    setFormData({ ...formData, due_date: newDate });
                                  }}
                                >
                                  <SelectTrigger className="w-[70px]">
                                    <SelectValue placeholder="HH" />
                                  </SelectTrigger>
                                  <SelectContent position="popper" className="max-h-[200px]">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className="text-muted-foreground">:</span>
                                <Select
                                  value={formData.due_date ? formData.due_date.getMinutes().toString() : undefined}
                                  onValueChange={(value) => {
                                    const minutes = parseInt(value);
                                    const newDate = formData.due_date ? new Date(formData.due_date) : new Date();
                                    newDate.setMinutes(minutes);
                                    setFormData({ ...formData, due_date: newDate });
                                  }}
                                >
                                  <SelectTrigger className="w-[70px]">
                                    <SelectValue placeholder="MM" />
                                  </SelectTrigger>
                                  <SelectContent position="popper" className="max-h-[200px]">
                                    {Array.from({ length: 60 }).map((_, i) => (
                                      <SelectItem key={i} value={i.toString()}>
                                        {i.toString().padStart(2, '0')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-6 pt-4 border-t bg-background">
                  <Button type="submit" className="w-full" loading={submitLoading}>
                    {submitLoading ? 'Tunggu bentar yak...' : editingTodo ? 'Update Tugas' : 'Simpan Tugas'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Todo List with Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'completed')} className="w-full">
            <TabsList className="flex w-full h-auto p-0 bg-transparent gap-2 sm:gap-4 border-b rounded-none mb-6 justify-start overflow-x-auto no-scrollbar sm:justify-start" aria-label="Filter tugas berdasarkan status">
              <TabsTrigger
                value="active"
                className="flex-1 sm:flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:font-bold border-b-2 border-transparent rounded-none px-2 py-3 transition-none"
                aria-label={`Tugas belum selesai, ${activeTodos.length} tugas`}
              >
                Belum Beres ({activeTodos.length})
              </TabsTrigger>
              <TabsTrigger
                value="overdue"
                className="flex-1 sm:flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-red-500 data-[state=active]:text-red-600 data-[state=active]:font-bold border-b-2 border-transparent rounded-none px-2 py-3 transition-none text-red-500/80"
                aria-label="Tugas lewat deadline"
              >
                Lewat Deadline ({overdueTodos.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex-1 sm:flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:font-bold border-b-2 border-transparent rounded-none px-2 py-3 transition-none"
                aria-label={`Tugas sudah selesai, ${completedTodos.length} tugas`}
              >
                Udah Beres ({completedTodos.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Todos Tab */}
            <TabsContent value="active" className="space-y-3">
              {focusTask ? (
                <div className="py-4 animation-in fade-in zoom-in duration-300">
                  <FocusMode
                    taskId={focusTask.id}
                    taskTitle={focusTask.title}
                    estimatedMinutes={focusTask.estimated_duration_minutes}
                    onClose={() => setFocusTask(null)}
                    onComplete={() => {
                      toggleComplete(focusTask);
                      setFocusTask(null);
                    }}
                  />
                </div>
              ) : activeTodos.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {todos.filter(t => !t.completed && (!t.due_date || new Date(t.due_date) >= new Date())).length === 0
                        ? "Tidak ada tugas yang aktif saat ini. Cek tab 'Lewat Deadline' juga ya!"
                        : "Gak ada tugas yang sesuai filter. Coba ubah filter-nya!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                activeTodos.map((todo) => (
                  <Card key={todo.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          {completeLoading[todo.id] ? (
                            <div className="mt-1 flex items-center justify-center w-6 h-6">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleComplete(todo); }}
                              className={cn(
                                "mt-0.5 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors duration-200 shrink-0",
                                todo.completed
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/30 hover:border-primary/50 text-transparent hover:text-primary/20"
                              )}
                              aria-label={`Tandai tugas ${todo.title} sebagai ${todo.completed ? 'belum selesai' : 'selesai'} `}
                            >
                              <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">
                              {todo.title}
                            </CardTitle>
                            {todo.description && (
                              <CardDescription className="mt-1">{todo.description}</CardDescription>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className={priorityColors[todo.priority]}>
                                {todo.priority}
                              </Badge>
                              {todo.category && (
                                <Badge variant="outline">{todo.category}</Badge>
                              )}
                              {todo.due_date && (
                                <Badge variant="outline" className="gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(todo.due_date), "dd MMM, HH:mm", { locale: idLocale })}
                                </Badge>
                              )}
                              {todo.estimated_duration_minutes && (
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {todo.estimated_duration_minutes}m
                                </Badge>
                              )}
                            </div>
                            {todo.tags && todo.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {todo.tags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="text-xs text-muted-foreground">#{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            onClick={() => setFocusTask(todo)}
                            size="sm"
                            variant="default"
                            className="flex-1 bg-primary/90 hover:bg-primary"
                            aria-label={`Mode Fokus untuk tugas ${todo.title} `}
                          >
                            <SparklesIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                            <span className="text-xs font-semibold">Fokus</span>
                          </Button>
                          <Button
                            onClick={() => openEditDialog(todo)}
                            size="sm"
                            variant="ghost"
                            className="flex-1"
                            aria-label={`Edit tugas ${todo.title} `}
                          >
                            <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                            <span className="text-xs">Edit</span>
                          </Button>
                          <Button
                            onClick={() => deleteTodo(todo.id)}
                            size="sm"
                            variant="ghost"
                            className="flex-1 text-destructive hover:text-destructive"
                            aria-label={`Hapus tugas ${todo.title} `}
                            loading={deleteLoading[todo.id]}
                          >
                            {!deleteLoading[todo.id] && (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                                <span className="text-xs">Hapus</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Overdue Todos Tab */}
            <TabsContent value="overdue" className="space-y-3">
              {overdueTodos.length > 0 && (
                <div className="flex justify-end p-2 bg-red-50/50 border border-red-100 rounded-md mb-4 items-center gap-3">
                  <span className="text-sm text-red-600 flex-1 ml-2">Tugas menumpuk? Biar AI aturin ulang 🪄</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                    onClick={handleAutoReschedule}
                    loading={rescheduleLoading}
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Auto-Reschedule
                  </Button>
                </div>
              )}

              {overdueTodos.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {todos.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length === 0
                        ? "Aman! Gak ada tugas yang lewat deadline."
                        : "Gak ada tugas telat yang sesuai filter."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                overdueTodos.map((todo) => (
                  <Card key={todo.id} className="hover:shadow-md transition-shadow border-red-200 bg-red-50/10">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          {completeLoading[todo.id] ? (
                            <div className="mt-1 flex items-center justify-center w-6 h-6">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleComplete(todo); }}
                              className={cn(
                                "mt-0.5 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors duration-200 shrink-0",
                                todo.completed
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-red-500/30 hover:border-red-500/50 text-transparent hover:text-red-500/20"
                              )}
                              aria-label={`Tandai tugas ${todo.title} sebagai ${todo.completed ? 'belum selesai' : 'selesai'} `}
                            >
                              <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg text-red-600">
                              {todo.title}
                            </CardTitle>
                            {todo.description && (
                              <CardDescription className="mt-1">{todo.description}</CardDescription>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className={priorityColors[todo.priority]}>
                                {todo.priority}
                              </Badge>
                              {todo.category && (
                                <Badge variant="outline">{todo.category}</Badge>
                              )}
                              {todo.due_date && (
                                <Badge variant="destructive" className="gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(todo.due_date), "dd MMM, HH:mm", { locale: idLocale })}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            onClick={() => openEditDialog(todo)}
                            size="sm"
                            variant="ghost"
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span className="text-xs">Edit</span>
                          </Button>
                          <Button
                            onClick={() => deleteTodo(todo.id)}
                            size="sm"
                            variant="ghost"
                            className="flex-1 text-destructive hover:text-destructive"
                            loading={deleteLoading[todo.id]}
                          >
                            {!deleteLoading[todo.id] && (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                <span className="text-xs">Hapus</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Completed Todos Tab */}
            <TabsContent value="completed" className="space-y-3">
              {completedTodos.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {todos.filter(t => t.completed).length === 0
                        ? "Belum ada tugas yang selesai. Ayo semangat!"
                        : "Gak ada tugas selesai yang sesuai filter. Coba ubah filter-nya!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedTodos.map((todo) => (
                  <Card key={todo.id} className="hover:shadow-md transition-shadow bg-secondary/20">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          {completeLoading[todo.id] ? (
                            <div className="mt-1 flex items-center justify-center w-6 h-6">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleComplete(todo); }}
                              className={cn(
                                "mt-0.5 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors duration-200 shrink-0",
                                todo.completed
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/30 hover:border-primary/50 text-transparent hover:text-primary/20"
                              )}
                              aria-label={`Tandai tugas ${todo.title} sebagai ${todo.completed ? 'belum selesai' : 'selesai'} `}
                            >
                              <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
                            </button>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg line-through text-muted-foreground">
                              {todo.title}
                            </CardTitle>
                            {todo.description && (
                              <CardDescription className="mt-1">{todo.description}</CardDescription>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className={priorityColors[todo.priority]}>
                                {todo.priority}
                              </Badge>
                              {todo.category && (
                                <Badge variant="outline">{todo.category}</Badge>
                              )}
                              {todo.due_date && (
                                <Badge variant="outline" className="gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(todo.due_date), "dd MMM, HH:mm", { locale: idLocale })}
                                </Badge>
                              )}
                              {todo.estimated_duration_minutes && (
                                <Badge variant="outline" className="gap-1">
                                  <Clock className="h-3 w-3" />
                                  {todo.estimated_duration_minutes}m
                                </Badge>
                              )}
                            </div>
                            {todo.tags && todo.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {todo.tags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="text-xs text-muted-foreground">#{tag}</span>
                                ))}
                              </div>
                            )}
                            <p className="mt-2 text-xs text-muted-foreground">
                              Selesai {format(new Date(todo.updated_at), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-2 border-t">
                          <Button
                            onClick={() => deleteTodo(todo.id)}
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Hapus tugas ${todo.title} `}
                            loading={deleteLoading[todo.id]}
                          >
                            {!deleteLoading[todo.id] && (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                                <span className="text-xs">Hapus</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
        {summaryOpen && dailyData && (
          <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
            <DialogContent className="max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Ringkasan Harian</DialogTitle>
                <DialogDescription>Rangkuman tugas dan rekomendasi</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-4 border rounded-md">
                <div className="space-y-3 pb-4">
                  <div>
                    <Label>Urgent</Label>
                    <div className="mt-2 space-y-1">{(dailyData.urgent || []).map((u: any, i: number) => (<div key={i} className="text-red-500">• {u.title}</div>))}</div>
                  </div>
                  <div>
                    <Label>Hari Ini</Label>
                    <div className="mt-2 space-y-1">{(dailyData.today_list || []).map((t: any, i: number) => (<div key={i}>• {t.title}</div>))}</div>
                  </div>
                  <div>
                    <Label>Progres</Label>
                    <div className="mt-1 text-muted-foreground">{dailyData.progress_summary}</div>
                  </div>
                  <div>
                    <Label>Rekomendasi</Label>
                    <div className="mt-2 space-y-1">{(dailyData.recommendations || []).map((r: any, i: number) => (<div key={i}>• {r}</div>))}</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {anomalyOpen && anomalyData && (
          <Dialog open={anomalyOpen} onOpenChange={setAnomalyOpen}>
            <DialogContent className="max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Insight Perilaku Tugas</DialogTitle>
                <DialogDescription>Analisis pola dan anomali dari aktivitas tugas</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-4 border rounded-md">
                <div className="space-y-3 pb-4">
                  <div>
                    <Label>Insights</Label>
                    <div className="mt-2 space-y-1">
                      {(anomalyData.insights || []).map((insight: string, i: number) => (
                        <div key={i} className="text-sm">• {insight}</div>
                      ))}
                    </div>
                  </div>
                  {anomalyData.recommendations && anomalyData.recommendations.length > 0 && (
                    <div>
                      <Label>Rekomendasi</Label>
                      <div className="mt-2 space-y-1">
                        {anomalyData.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="text-sm text-muted-foreground">• {rec}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Footer hidden on mobile because we have BottomNav menu */}
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    </MobileLayout>
  );
}
