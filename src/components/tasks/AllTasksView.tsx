import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Todo } from '@/lib/taskUtils';
import { Search, ListFilter, ArrowUpDown, Plus, Sparkles, X } from 'lucide-react';

interface AllTasksViewProps {
  todos: Todo[];
  onToggleComplete: (id: string, completed: boolean) => void;
  onStartFocus: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onMoveToTomorrow: (id: string) => void;
  onToggleWaiting: (id: string, currentWaiting: boolean) => void;
  onUpdateSubtasks: (id: string, newDescription: string) => void;
  onQuickAdd: () => void;
}

export function AllTasksView({
  todos,
  onToggleComplete,
  onStartFocus,
  onEdit,
  onDelete,
  onMoveToTomorrow,
  onToggleWaiting,
  onUpdateSubtasks,
  onQuickAdd
}: AllTasksViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'urgency' | 'due_date' | 'created_at' | 'title'>('urgency');

  const uniqueCategories = Array.from(new Set(todos.map(t => t.category).filter(Boolean)));

  const filtered = todos.filter(t => {
    if (statusFilter === 'active' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'urgency') {
      const pMap = { high: 3, medium: 2, low: 1 };
      const pDiff = pMap[b.priority] - pMap[a.priority];
      if (pDiff !== 0) return pDiff;
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'due_date') {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (sortBy === 'created_at') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Semua Task
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
              {sorted.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Daftar lengkap semua tugas, backlog, dan arsip riwayat lo.
          </p>
        </div>

        <Button onClick={onQuickAdd} size="sm" className="h-9 px-3.5 rounded-xl gap-1.5 text-xs font-semibold shadow-sm">
          <Plus className="h-4 w-4" />
          <span>+ Tambah Task</span>
        </Button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari task berdasarkan judul, catatan, atau kategori..."
            className="pl-9 pr-9 h-10 text-xs sm:text-sm rounded-xl border-border bg-background"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdowns Filter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Status */}
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktif Doang</SelectItem>
              <SelectItem value="completed">Udah Kelar</SelectItem>
              <SelectItem value="all">Semua Status</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority */}
          <Select value={priorityFilter} onValueChange={(val: any) => setPriorityFilter(val)}>
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="Prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Prioritas</SelectItem>
              <SelectItem value="high">Penting Banget</SelectItem>
              <SelectItem value="medium">Sedang</SelectItem>
              <SelectItem value="low">Sat-Set</SelectItem>
            </SelectContent>
          </Select>

          {/* Category */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {uniqueCategories.map(cat => (
                <SelectItem key={cat as string} value={cat as string}>
                  {cat as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgency">Paling Urgent</SelectItem>
              <SelectItem value="due_date">Deadline Terdekat</SelectItem>
              <SelectItem value="created_at">Baru Dibuat</SelectItem>
              <SelectItem value="title">Judul (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task List */}
      {sorted.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed text-center text-xs sm:text-sm text-muted-foreground">
          Gak nemu task yang cocok sama filter atau pencarian lo nih.
        </div>
      ) : (
        <div className="grid gap-2.5">
          {sorted.map(task => (
            <TaskCard
              key={task.id}
              todo={task}
              onToggleComplete={onToggleComplete}
              onStartFocus={onStartFocus}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveToTomorrow={onMoveToTomorrow}
              onToggleWaiting={onToggleWaiting}
              onUpdateSubtasks={onUpdateSubtasks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
