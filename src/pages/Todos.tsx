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
import { Plus, LogOut, Trash2, Edit, CheckCircle2, User, Loader2 } from 'lucide-react';
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
    category: ''
  });
  const [nlInput, setNlInput] = useState('');
  const [aiHints, setAiHints] = useState<{ recommendedPriority?: 'low' | 'medium' | 'high'; estimatedMinutes?: number | null; suggestions?: { subtasks?: string[]; checklist?: string[]; templates?: string[] } } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const auditLogRef = useRef<Record<string, { snapshot: Todo; timestamp: string; actor: string }[]>>({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [dailyData, setDailyData] = useState<any | null>(null);
  const [anomalyOpen, setAnomalyOpen] = useState(false);
  const [anomalyData, setAnomalyData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

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

  const applyAIAssist = async () => {
    if (!nlInput.trim()) return;
    try {
      const result = await parseTask(nlInput.trim());
      setFormData({
        title: result.title || formData.title,
        description: formData.description,
        priority: (result.priority === 'low' || result.priority === 'medium' || result.priority === 'high') ? result.priority : formData.priority,
        category: result.category || formData.category
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingTodo) {
        const prev = { ...editingTodo };
        const { error } = await supabase
          .from('todos')
          .update({
            title: formData.title,
            description: formData.description || null,
            priority: formData.priority,
            category: formData.category || null
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
            user_id: user!.id
          });

        if (error) throw error;
        toast({ title: "Tugas baru berhasil dibuat!" });
      }

      setFormData({ title: '', description: '', priority: 'medium', category: '' });
      setEditingTodo(null);
      setDialogOpen(false);
      fetchTodos();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Waduh Error",
        description: error.message
      });
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
    }
  };

  const runDailySummary = async () => {
    try {
      const data = await dailySummary(todos);
      setDailyData(data);
      setSummaryOpen(true);
      toast({
        title: 'Ringkasan harian siap', description: 'Lihat detail di dialog', action: (
          <ToastAction altText="Buka">Buka</ToastAction>
        )
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Gagal membuat ringkasan', description: err.message });
    }
  };

  const runSemanticSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTodos();
      return;
    }
    try {
      const ranking: string[] = await semanticSearch(searchQuery.trim(), todos);
      const byId = new Map(todos.map(t => [t.id, t]));
      const ordered = ranking.map(id => byId.get(id)).filter(Boolean) as Todo[];
      const remainder = todos.filter(t => !ranking.includes(t.id));
      setTodos([...ordered, ...remainder]);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Pencarian gagal', description: err.message });
    }
  };

  const runAnomalyDetection = async () => {
    try {
      const history = Object.values(auditLogRef.current).flat().map(h => ({ id: h.snapshot.id, timestamp: h.timestamp, actor: h.actor, data: h.snapshot }));
      const res = await detectAnomaly(history);
      setAnomalyData(res);
      setAnomalyOpen(true);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Deteksi gagal', description: err.message });
    }
  };

  const toggleComplete = async (todo: Todo) => {
    try {
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
    }
  };

  const deleteTodo = async (id: string) => {
    try {
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
    }
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      category: todo.category || ''
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingTodo(null);
    setFormData({ title: '', description: '', priority: 'medium', category: '' });
    setDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
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
              <CheckCircle2 className="h-7 w-7 text-primary flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">CatetYuk</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Atur tugas dengan AI</p>
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
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Keluar</span>
              </Button>
            </div>
          </div>

          {/* Search Bar - Full Width on Mobile */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex gap-2">
              <TextInput
                placeholder="Cari tugas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    runSemanticSearch();
                  }
                }}
                className="flex-1"
                aria-label="Cari tugas"
              />
              <Button
                onClick={runSemanticSearch}
                variant="secondary"
                size="sm"
                aria-label="Mulai pencarian"
              >
                Cari
              </Button>
            </div>

            {/* AI Features - Horizontal Scroll on Mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button
                onClick={runDailySummary}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                aria-label="Lihat ringkasan harian"
              >
                Ringkasan
              </Button>
              <Button
                onClick={runAnomalyDetection}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                aria-label="Deteksi anomali tugas"
              >
                Anomali
              </Button>
            </div>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTodo ? 'Edit Tugas' : 'Bikin Tugas Baru'}</DialogTitle>
              <DialogDescription>
                {editingTodo ? 'Update detail tugas lo di bawah ini.' : 'Tambahin tugas baru ke list lo.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Deskripsi Bahasa Alami</Label>
              <Textarea placeholder="contoh: besok pagi kirim laporan ke klien" value={nlInput} onChange={(e) => setNlInput(e.target.value)} rows={2} />
              <div className="flex gap-2">
                <Button onClick={applyAIAssist} variant="secondary" type="button">Parse AI</Button>
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full">
                {editingTodo ? 'Update Tugas' : 'Simpan Tugas'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Todo List with Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'completed')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6" aria-label="Filter tugas berdasarkan status">
            <TabsTrigger value="active" aria-label={`Tugas belum selesai, ${todos.filter(t => !t.completed).length} tugas`}>
              Belum Beres ({todos.filter(t => !t.completed).length})
            </TabsTrigger>
            <TabsTrigger value="completed" aria-label={`Tugas sudah selesai, ${todos.filter(t => t.completed).length} tugas`}>
              Udah Beres ({todos.filter(t => t.completed).length})
            </TabsTrigger>
          </TabsList>

          {/* Active Todos Tab */}
          <TabsContent value="active" className="space-y-3">
            {todos.filter(t => !t.completed).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada tugas nih. Yuk bikin satu, jangan mager!</p>
                </CardContent>
              </Card>
            ) : (
              todos.filter(t => !t.completed).map((todo) => (
                <Card key={todo.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleComplete(todo)}
                          className="mt-1"
                          aria-label={`Tandai tugas ${todo.title} sebagai ${todo.completed ? 'belum selesai' : 'selesai'}`}
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {todo.title}
                          </CardTitle>
                          {todo.description && (
                            <CardDescription className="mt-1">{todo.description}</CardDescription>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className={priorityColors[todo.priority]}>
                              {todo.priority}
                            </Badge>
                            {todo.category && (
                              <Badge variant="outline">{todo.category}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openEditDialog(todo)}
                          size="icon"
                          variant="ghost"
                          aria-label={`Edit tugas ${todo.title}`}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          onClick={() => rollbackTodo(todo)}
                          size="icon"
                          variant="ghost"
                          aria-label={`Rollback tugas ${todo.title}`}
                        >
                          <span aria-hidden="true">↩</span>
                        </Button>
                        <Button
                          onClick={() => deleteTodo(todo.id)}
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Hapus tugas ${todo.title}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
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
            {todos.filter(t => t.completed).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada tugas yang selesai. Ayo semangat!</p>
                </CardContent>
              </Card>
            ) : (
              todos.filter(t => t.completed).map((todo) => (
                <Card key={todo.id} className="hover:shadow-md transition-shadow bg-secondary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleComplete(todo)}
                          className="mt-1"
                          aria-label={`Tandai tugas ${todo.title} sebagai ${todo.completed ? 'belum selesai' : 'selesai'}`}
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg line-through text-muted-foreground">
                            {todo.title}
                          </CardTitle>
                          {todo.description && (
                            <CardDescription className="mt-1">{todo.description}</CardDescription>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className={priorityColors[todo.priority]}>
                              {todo.priority}
                            </Badge>
                            {todo.category && (
                              <Badge variant="outline">{todo.category}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => deleteTodo(todo.id)}
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Hapus tugas ${todo.title}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ringkasan Harian</DialogTitle>
              <DialogDescription>Rangkuman tugas dan rekomendasi</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
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
          </DialogContent>
        </Dialog>
      )}
      {anomalyOpen && anomalyData && (
        <Dialog open={anomalyOpen} onOpenChange={setAnomalyOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insight Perilaku Tugas</DialogTitle>
              <DialogDescription>Analisis pola dan anomali dari aktivitas tugas</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
