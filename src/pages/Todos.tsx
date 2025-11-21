import { useEffect, useState } from 'react';
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
import { Plus, LogOut, Trash2, Edit, CheckCircle2, User } from 'lucide-react';
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTodos();
  }, [user, navigate]);

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
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingTodo) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Sabar ya bestie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8 pt-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">To-Do List Gue</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.user_metadata.full_name || user?.email}</span>
            </div>
            <Button onClick={() => navigate('/profile')} variant="outline" size="sm">
              Profil
            </Button>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Cabut Dulu
            </Button>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="w-full mb-6" size="lg">
              <Plus className="h-4 w-4 mr-2" />
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

        <div className="space-y-3">
          {todos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada tugas nih. Yuk bikin satu, jangan mager!</p>
              </CardContent>
            </Card>
          ) : (
            todos.map((todo) => (
              <Card key={todo.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleComplete(todo)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className={`text-lg ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteTodo(todo.id)}
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
