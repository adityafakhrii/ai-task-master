import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { AppLayout, NavTab } from '@/components/layout/AppLayout';
import { FocusNowHero } from '@/components/dashboard/FocusNowHero';
import { TodayTaskGroups } from '@/components/dashboard/TodayTaskGroups';
import { AIPrioritizerModal } from '@/components/dashboard/AIPrioritizerModal';
import { QuickAddModal } from '@/components/tasks/QuickAddModal';
import { InboxView } from '@/components/tasks/InboxView';
import { AllTasksView } from '@/components/tasks/AllTasksView';
import { DailyReviewView } from '@/components/review/DailyReviewView';
import { FocusMode } from '@/components/FocusMode';
import {
  Todo,
  groupTodayTasks,
  getFocusNowTask,
  isTaskDueToday,
  isTaskOverdue
} from '@/lib/taskUtils';

export default function Todos() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Navigation tab state (synced with URL ?tab=...)
  const initialTab = (searchParams.get('tab') as NavTab) || 'today';
  const [activeTab, setActiveTab] = useState<NavTab>(initialTab);

  // Dialog & Modal states
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [prioritizeModalOpen, setPrioritizeModalOpen] = useState(false);
  const [activeFocusTask, setActiveFocusTask] = useState<Todo | null>(null);

  // Sync tab with URL
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setQuickAddOpen(true);
    }
  }, [searchParams]);

  // Fetch todos with TanStack Query
  const { data: todos = [], isLoading: todosLoading, error: queryError } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Todo[];
    },
    enabled: !!user
  });

  useEffect(() => {
    if (queryError) {
      toast({
        variant: 'destructive',
        title: 'Gagal memuat data',
        description: (queryError as any).message
      });
    }
  }, [queryError, toast]);

  // Mutations
  const insertMutation = useMutation({
    mutationFn: async (newTodo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed'>) => {
      const { error } = await supabase
        .from('todos')
        .insert({
          ...newTodo,
          user_id: user!.id
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Mantap jiwa! Task udah masuk list' });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setEditingTodo(null);
      setQuickAddOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Waduh gagal nambah task', description: error.message });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedTodo: Partial<Todo> & { id: string }) => {
      const { error } = await supabase
        .from('todos')
        .update(updatedTodo)
        .eq('id', updatedTodo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Sip, detail task udah di-update!' });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setEditingTodo(null);
      setQuickAddOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Duh gagal update nih', description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Task udah dihapus, aman sentosa!' });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Waduh gagal ngehapus', description: error.message });
    }
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('todos')
        .update({ completed })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old ? old.map((t) => (t.id === id ? { ...t, completed } : t)) : []
      );
      return { previousTodos };
    },
    onError: (err: any, _, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      toast({ variant: 'destructive', title: 'Gagal update status', description: err.message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });

  // Action helpers
  const handleToggleComplete = (id: string, completed: boolean) => {
    toggleCompleteMutation.mutate({ id, completed });
  };

  const handleStartFocus = (task: Todo) => {
    setActiveFocusTask(task);
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setQuickAddOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleMoveToTomorrow = (id: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    updateMutation.mutate({ id, due_date: tomorrow.toISOString() });
    toast({ title: 'Sip! Task dipindahin ke besok jam 09:00 WIB ya' });
  };

  const handleMoveToToday = (id: string) => {
    const today = new Date();
    today.setHours(18, 0, 0, 0);
    updateMutation.mutate({ id, due_date: today.toISOString() });
    toast({ title: 'Gass! Task resmi jadi target hari ini' });
  };

  const handleMoveToInbox = (id: string) => {
    updateMutation.mutate({ id, due_date: null, category: 'Inbox' });
    toast({ title: 'Task dibalikin ke Inbox dulu ya' });
  };

  const handleToggleWaiting = (id: string, currentWaiting: boolean) => {
    const target = todos.find(t => t.id === id);
    if (!target) return;
    let newTags = target.tags || [];
    if (currentWaiting) {
      newTags = newTags.filter(t => t.toLowerCase() !== 'waiting' && t.toLowerCase() !== 'menunggu');
    } else {
      newTags = [...newTags, 'waiting'];
    }
    updateMutation.mutate({ id, tags: newTags });
    toast({ title: currentWaiting ? 'Status nungguin udah dihapus!' : 'Ditandai lagi nunggu respon orang lain' });
  };

  const handleUpdateSubtasks = (id: string, newDescription: string) => {
    updateMutation.mutate({ id, description: newDescription });
  };

  const handleQuickAddSubmit = (taskData: {
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high';
    category: string | null;
    due_date: string | null;
    estimated_duration_minutes: number | null;
    tags: string[] | null;
  }) => {
    if (editingTodo) {
      updateMutation.mutate({
        id: editingTodo.id,
        ...taskData
      });
    } else {
      insertMutation.mutate(taskData);
    }
  };

  const handleFastInboxAdd = (fastTitle: string) => {
    insertMutation.mutate({
      title: fastTitle,
      description: null,
      priority: 'medium',
      category: 'Inbox',
      due_date: null,
      estimated_duration_minutes: 25,
      tags: ['inbox']
    });
  };

  // Grouped task derivations
  const {
    criticalTasks,
    importantTasks,
    quickWinsTasks,
    upNextTasks,
    waitingTasks,
    inboxTasks
  } = groupTodayTasks(todos);

  const { task: focusNowTask, reason: focusNowReason } = getFocusNowTask(todos);

  // Daily statistics for header & badges
  const todayTasksList = todos.filter(t => isTaskDueToday(t) || isTaskOverdue(t));
  const todayCompletedCount = todayTasksList.filter(t => t.completed).length;
  const todayTotalCount = todayTasksList.length;

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onQuickAdd={() => {
        setEditingTodo(null);
        setQuickAddOpen(true);
      }}
      todayCompletedCount={todayCompletedCount}
      todayTotalCount={todayTotalCount}
      inboxCount={inboxTasks.length}
    >
      {/* 1. TODAY TAB (MAIN DASHBOARD) */}
      {activeTab === 'today' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Dominant Hero: Focus Now */}
          <FocusNowHero
            task={focusNowTask}
            reason={focusNowReason}
            onStartFocus={handleStartFocus}
            onCompleteTask={(id) => handleToggleComplete(id, true)}
            onQuickAdd={() => {
              setEditingTodo(null);
              setQuickAddOpen(true);
            }}
            isLoading={todosLoading}
          />

          {/* Grouped Today Execution Buckets */}
          <TodayTaskGroups
            criticalTasks={criticalTasks}
            importantTasks={importantTasks}
            quickWinsTasks={quickWinsTasks}
            upNextTasks={upNextTasks}
            waitingTasks={waitingTasks}
            onToggleComplete={handleToggleComplete}
            onStartFocus={handleStartFocus}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveToTomorrow={handleMoveToTomorrow}
            onToggleWaiting={handleToggleWaiting}
            onUpdateSubtasks={handleUpdateSubtasks}
            onQuickAdd={() => {
              setEditingTodo(null);
              setQuickAddOpen(true);
            }}
            onPrioritizeAI={() => setPrioritizeModalOpen(true)}
          />
        </div>
      )}

      {/* 2. INBOX TAB */}
      {activeTab === 'inbox' && (
        <div className="animate-in fade-in duration-200">
          <InboxView
            inboxTasks={inboxTasks}
            onToggleComplete={handleToggleComplete}
            onStartFocus={handleStartFocus}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveToToday={handleMoveToToday}
            onMoveToTomorrow={handleMoveToTomorrow}
            onQuickAddText={handleFastInboxAdd}
            onOpenQuickAddModal={() => {
              setEditingTodo(null);
              setQuickAddOpen(true);
            }}
          />
        </div>
      )}

      {/* 3. FOCUS TAB */}
      {activeTab === 'focus' && (
        <div className="animate-in fade-in duration-200 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Focus Mode
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pilih task untuk memulai sesi deep work bebas distraksi.
            </p>
          </div>

          {focusNowTask ? (
            <FocusNowHero
              task={focusNowTask}
              reason={focusNowReason}
              onStartFocus={handleStartFocus}
              onCompleteTask={(id) => handleToggleComplete(id, true)}
              onQuickAdd={() => {
                setEditingTodo(null);
                setQuickAddOpen(true);
              }}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center bg-card/40 space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Tidak ada task aktif
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Semua task beres atau belum ada task yang dibuat.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. ALL TASKS TAB */}
      {activeTab === 'all' && (
        <div className="animate-in fade-in duration-200">
          <AllTasksView
            todos={todos}
            onToggleComplete={handleToggleComplete}
            onStartFocus={handleStartFocus}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveToTomorrow={handleMoveToTomorrow}
            onToggleWaiting={handleToggleWaiting}
            onUpdateSubtasks={handleUpdateSubtasks}
            onQuickAdd={() => {
              setEditingTodo(null);
              setQuickAddOpen(true);
            }}
          />
        </div>
      )}

      {/* 5. DAILY REVIEW TAB */}
      {activeTab === 'review' && (
        <div className="animate-in fade-in duration-200">
          <DailyReviewView
            todos={todayTasksList.length > 0 ? todayTasksList : todos}
            onToggleComplete={handleToggleComplete}
            onMoveToTomorrow={handleMoveToTomorrow}
            onReschedule={(id, date) => updateMutation.mutate({ id, due_date: date })}
            onMoveToInbox={handleMoveToInbox}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* FULLSCREEN FOCUS OVERLAY (WHEN FOCUS ACTIVE) */}
      {activeFocusTask && (
        <FocusMode
          task={activeFocusTask}
          whyNow={focusNowReason}
          onComplete={(id) => handleToggleComplete(id, true)}
          onClose={() => setActiveFocusTask(null)}
          onUpdateSubtasks={handleUpdateSubtasks}
        />
      )}

      {/* QUICK ADD / EDIT MODAL */}
      <QuickAddModal
        open={quickAddOpen}
        onOpenChange={(open) => {
          setQuickAddOpen(open);
          if (!open) setEditingTodo(null);
        }}
        onSubmit={handleQuickAddSubmit}
        editingTodo={editingTodo}
      />

      {/* AI PRIORITIZE MY DAY MODAL */}
      <AIPrioritizerModal
        open={prioritizeModalOpen}
        onOpenChange={setPrioritizeModalOpen}
        tasks={todos.filter(t => !t.completed)}
        onStartFocus={handleStartFocus}
      />
    </AppLayout>
  );
}
