import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, LogOut, Trash2, Edit, User, Loader2, Calendar, Clock, ArrowUpDown, Undo2, CheckCircle2 } from 'lucide-react';
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
import { parseTask, dailySummary, semanticSearch, detectAnomaly } from '@/services/ai';
import { Input as TextInput } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [searchQuery, setSearchQuery] = useState('');
  const auditLogRef = useRef<Record<string, { snapshot: Todo; timestamp: string; actor: string }[]>>({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [dailyData, setDailyData] = useState<any | null>(null);
  const [anomalyOpen, setAnomalyOpen] = useState(false);
  const [anomalyData, setAnomalyData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'overdue'>('active');

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
  const [searchLoading, setSearchLoading] = useState(false);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [rollbackLoading, setRollbackLoading] = useState<Record<string, boolean>>({});
  const [completeLoading, setCompleteLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTodos();
  }, [user, authLoading, navigate]);

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

    // Apply sorting based on sortBy state
    filtered.sort((a, b) => {
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

  const rollbackTodo = async (todo: Todo) => {
    const history = auditLogRef.current[todo.id] || [];
    const last = history[history.length - 1];
    if (!last) {
      toast({ title: 'Belum ada versi sebelumnya' });
      return;
    }
    try {
      setRollbackLoading(prev => ({ ...prev, [todo.id]: true }));
      const { error } = await supabase
        .from('todos')
        .update({
          title: last.snapshot.title,
          description: last.snapshot.description,
          priority: last.snapshot.priority,
          category: last.snapshot.category
        })
        .eq('id', todo.id);
      if (error) throw error;
      auditLogRef.current[todo.id] = history.slice(0, -1);
      toast({ title: 'Rollback berhasil' });
      fetchTodos();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Rollback gagal', description: err.message });
    } finally {
      setRollbackLoading(prev => ({ ...prev, [todo.id]: false }));
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

  const runSemanticSearch = async (query: string) => {
    if (!query.trim()) {
      fetchTodos();
      return;
    }
    try {
      setSearchLoading(true);
      const ranking: string[] = await semanticSearch(query.trim(), todos);
      const byId = new Map(todos.map(t => [t.id, t]));
      const ordered = ranking.map(id => byId.get(id)).filter(Boolean) as Todo[];
      const remainder = todos.filter(t => !ranking.includes(t.id));
      setTodos([...ordered, ...remainder]);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Pencarian gagal', description: err.message });
    } finally {
      setSearchLoading(false);
    }
  };

  // Real-time search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        runSemanticSearch(searchQuery);
      } else {
        fetchTodos();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const toggleComplete = async (todo: Todo) => {
    try {
      setCompleteLoading(prev => ({ ...prev, [todo.id]: true }));
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', todo.id);

      if (error) throw error;
      fetchTodos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Waduh Error",
        description: error.message
      });
    } finally {
      setCompleteLoading(prev => ({ ...prev, [todo.id]: false }));
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

  if (todosLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Sabar ya bestie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Mobile-First Header */}
        <header className="mb-6 space-y-4" role="banner">
          {/* Top Bar: Branding + User Actions */}
          <div className="flex items-center justify-between gap-4">
            {/* Branding */}
            <div className="flex items-center gap-2">
              <img src="/CatetYuk3.png" alt="CatetYuk Logo" className="h-14 w-14 flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">CatetYuk</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">simplify your task</p>
              </div>
            </div>

            {/* User Menu - Mobile Optimized */}
            <div className="flex items-center gap-2">
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

          {/* Search Bar - Full Width on Mobile */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex gap-2">
              <TextInput
                placeholder="Cari tugas... (real-time)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                aria-label="Cari tugas"
              />
              {searchLoading && (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

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
            </div>
          </div>

          {/* Filter Section */}
          {/* Filter & Sort Section */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
              <SelectTrigger className="flex-1 min-w-[140px]" aria-label="Filter berdasarkan prioritas">
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
              <SelectTrigger className="flex-1 min-w-[140px]" aria-label="Filter berdasarkan kategori">
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
              <SelectTrigger className="flex-1 min-w-[140px]" aria-label="Filter berdasarkan deadline">
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
              <SelectTrigger className="flex-1 min-w-[140px]" aria-label="Filter berdasarkan tag">
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
              <SelectTrigger className="flex-1 min-w-[140px] bg-secondary/20 border-primary/20" aria-label="Urutkan tugas berdasarkan">
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
        </header>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openNewDialog}
              className="w-full mb-6"
              size="lg"
              aria-label="Tambah tugas baru"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Tambah Tugas Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingTodo ? 'Edit Tugas' : 'Bikin Tugas Baru'}</DialogTitle>
              <DialogDescription>
                {editingTodo ? 'Update detail tugas lo di bawah ini.' : 'Tambahin tugas baru ke list lo.'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3 pb-4">
                <div className="space-y-2">
                  <Label>Deskripsi Bahasa Alami</Label>
                  <Input
                    placeholder="contoh: besok pagi kirim laporan ke klien"
                    value={nlInput}
                    onChange={(e) => setNlInput(e.target.value)}
                    className="border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={applyAIAssist} variant="secondary" type="button" loading={aiLoading}>
                    {aiLoading ? 'AI lagi mikir...' : 'Parse AI'}
                  </Button>
                  {aiHints?.recommendedPriority && (
                    <Badge variant="outline">Rekomendasi: {aiHints.recommendedPriority}</Badge>
                  )}
                  {typeof aiHints?.estimatedMinutes === 'number' && (
                    <Badge variant="outline">Estimasi: {aiHints?.estimatedMinutes}m</Badge>
                  )}
                </div>
                {aiHints?.suggestions && (
                  <div className="grid md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <Label>Subtasks</Label>
                      <div className="mt-1 space-y-1">{(aiHints.suggestions.subtasks || []).map((s, i) => (<div key={i} className="text-muted-foreground">• {s}</div>))}</div>
                    </div>
                    <div>
                      <Label>Checklist</Label>
                      <div className="mt-1 space-y-1">{(aiHints.suggestions.checklist || []).map((s, i) => (<div key={i} className="text-muted-foreground">• {s}</div>))}</div>
                    </div>
                    <div>
                      <Label>Template</Label>
                      <div className="mt-1 space-y-1">{(aiHints.suggestions.templates || []).map((s, i) => (<div key={i} className="text-muted-foreground">• {s}</div>))}</div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
              <div className="grid grid-cols-2 gap-4">
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
                    <SelectContent>
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
                <Popover>
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
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          placeholder="HH"
                          value={formData.due_date ? formData.due_date.getHours() : ''}
                          onChange={(e) => {
                            const hours = parseInt(e.target.value) || 0;
                            const newDate = formData.due_date ? new Date(formData.due_date) : new Date();
                            newDate.setHours(hours);
                            setFormData({ ...formData, due_date: newDate });
                          }}
                          className="w-20"
                        />
                        <span>:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="MM"
                          value={formData.due_date ? formData.due_date.getMinutes() : ''}
                          onChange={(e) => {
                            const minutes = parseInt(e.target.value) || 0;
                            const newDate = formData.due_date ? new Date(formData.due_date) : new Date();
                            newDate.setMinutes(minutes);
                            setFormData({ ...formData, due_date: newDate });
                          }}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button type="submit" className="w-full" loading={submitLoading}>
                {submitLoading ? 'Tunggu bentar yak...' : editingTodo ? 'Update Tugas' : 'Simpan Tugas'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Todo List with Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'completed')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6" aria-label="Filter tugas berdasarkan status">
            <TabsTrigger value="active" aria-label={`Tugas belum selesai, ${todos.filter(t => !t.completed && (!t.due_date || new Date(t.due_date) >= new Date())).length} tugas`}>
              Belum Beres ({todos.filter(t => !t.completed && (!t.due_date || new Date(t.due_date) >= new Date())).length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600" aria-label="Tugas lewat deadline">
              Lewat Deadline ({todos.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length})
            </TabsTrigger>
            <TabsTrigger value="completed" aria-label={`Tugas sudah selesai, ${todos.filter(t => t.completed).length} tugas`}>
              Udah Beres ({todos.filter(t => t.completed).length})
            </TabsTrigger>
          </TabsList>

          {/* Active Todos Tab */}
          <TabsContent value="active" className="space-y-3">
            {filterAndSortTodos(todos.filter(t => !t.completed && (!t.due_date || new Date(t.due_date) >= new Date()))).length === 0 ? (
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
              filterAndSortTodos(todos.filter(t => !t.completed && (!t.due_date || new Date(t.due_date) >= new Date()))).map((todo) => (
                <Card key={todo.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        {completeLoading[todo.id] ? (
                          <div className="mt-1 h-4 w-4 flex items-center justify-center">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          </div>
                        ) : (
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => toggleComplete(todo)}
                            className="mt-1"
                            aria-label={`Tandai tugas ${todo.title} sebagai ${todo.completed ? 'belum selesai' : 'selesai'}`}
                          />
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
                                {format(new Date(todo.due_date), "dd MMM", { locale: idLocale })}
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
                          onClick={() => openEditDialog(todo)}
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          aria-label={`Edit tugas ${todo.title}`}
                        >
                          <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button
                          onClick={() => rollbackTodo(todo)}
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          aria-label={`Kembali ke versi sebelumnya dari tugas ${todo.title}`}
                          loading={rollbackLoading[todo.id]}
                        >
                          {!rollbackLoading[todo.id] && (
                            <>
                              <Undo2 className="h-4 w-4 mr-1" aria-hidden="true" />
                              <span className="text-xs">Versi</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteTodo(todo.id)}
                          size="sm"
                          variant="ghost"
                          className="flex-1 text-destructive hover:text-destructive"
                          aria-label={`Hapus tugas ${todo.title}`}
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
            {filterAndSortTodos(todos.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date())).length === 0 ? (
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
              filterAndSortTodos(todos.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date())).map((todo) => (
                <Card key={todo.id} className="hover:shadow-md transition-shadow border-red-200 bg-red-50/10">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        {completeLoading[todo.id] ? (
                          <div className="mt-1 h-4 w-4 flex items-center justify-center">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          </div>
                        ) : (
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => toggleComplete(todo)}
                            className="mt-1"
                            aria-label={`Tandai tugas ${todo.title} sebagai ${todo.completed ? 'belum selesai' : 'selesai'}`}
                          />
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
                                {format(new Date(todo.due_date), "dd MMM", { locale: idLocale })}
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
            {filterAndSortTodos(todos.filter(t => t.completed)).length === 0 ? (
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
              filterAndSortTodos(todos.filter(t => t.completed)).map((todo) => (
                <Card key={todo.id} className="hover:shadow-md transition-shadow bg-secondary/20">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        {completeLoading[todo.id] ? (
                          <div className="mt-1 h-4 w-4 flex items-center justify-center">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          </div>
                        ) : (
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => toggleComplete(todo)}
                            className="mt-1"
                            aria-label={`Tandai tugas ${todo.title} sebagai ${todo.completed ? 'belum selesai' : 'selesai'}`}
                          />
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
                                {format(new Date(todo.due_date), "dd MMM", { locale: idLocale })}
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
                      <div className="flex justify-end pt-2 border-t">
                        <Button
                          onClick={() => deleteTodo(todo.id)}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Hapus tugas ${todo.title}`}
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
      <Footer />
    </div>
  );
}
