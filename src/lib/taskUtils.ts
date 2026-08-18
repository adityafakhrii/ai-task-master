import { format, isToday, isTomorrow, isPast, parseISO, isSameDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export interface Todo {
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

export interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

/**
 * Extract subtasks from description if markdown checkbox format exists (- [ ] or - [x])
 */
export function extractSubtasks(description: string | null): { cleanDescription: string; subtasks: SubtaskItem[] } {
  if (!description) return { cleanDescription: '', subtasks: [] };

  const lines = description.split('\n');
  const subtasks: SubtaskItem[] = [];
  const cleanLines: string[] = [];

  lines.forEach((line, index) => {
    const checkMatch = line.match(/^\s*[-*]\s*\[([ xX])\]\s*(.+)$/);
    if (checkMatch) {
      subtasks.push({
        id: `st-${index}`,
        completed: checkMatch[1].toLowerCase() === 'x',
        title: checkMatch[2].trim()
      });
    } else {
      cleanLines.push(line);
    }
  });

  return {
    cleanDescription: cleanLines.join('\n').trim(),
    subtasks
  };
}

/**
 * Encode subtasks back into description string
 */
export function serializeSubtasks(cleanDescription: string, subtasks: SubtaskItem[]): string {
  const subtaskList = subtasks.map(st => `- [${st.completed ? 'x' : ' '}] ${st.title}`).join('\n');
  if (!cleanDescription && !subtaskList) return '';
  if (!cleanDescription) return subtaskList;
  if (!subtaskList) return cleanDescription;
  return `${cleanDescription}\n\n${subtaskList}`;
}

export function isTaskWaiting(todo: Todo): boolean {
  if (todo.tags?.some(t => t.toLowerCase() === 'waiting' || t.toLowerCase() === 'menunggu')) return true;
  if (todo.category?.toLowerCase() === 'waiting') return true;
  if (todo.title.toLowerCase().startsWith('[waiting]') || todo.title.toLowerCase().startsWith('waiting:')) return true;
  return false;
}

export function isTaskOverdue(todo: Todo): boolean {
  if (!todo.due_date || todo.completed) return false;
  const dueDate = parseISO(todo.due_date);
  return isPast(dueDate) && !isToday(dueDate);
}

export function isTaskDueToday(todo: Todo): boolean {
  if (!todo.due_date || todo.completed) return false;
  return isToday(parseISO(todo.due_date));
}

export function isTaskDueTomorrow(todo: Todo): boolean {
  if (!todo.due_date || todo.completed) return false;
  return isTomorrow(parseISO(todo.due_date));
}

export function formatTaskDueDate(dueDateStr: string | null): string {
  if (!dueDateStr) return 'Tanpa deadline';
  try {
    const d = parseISO(dueDateStr);
    if (isToday(d)) return `Hari ini • ${format(d, 'HH:mm')}`;
    if (isTomorrow(d)) return `Besok • ${format(d, 'HH:mm')}`;
    if (isTaskOverdue({ due_date: dueDateStr } as Todo)) {
      return `Lewat (${format(d, 'd MMM', { locale: idLocale })})`;
    }
    return format(d, 'd MMM, HH:mm', { locale: idLocale });
  } catch {
    return 'Tanggal tidak valid';
  }
}

/**
 * Categorize today's tasks into execution buckets
 */
export function groupTodayTasks(todos: Todo[]) {
  const activeTodos = todos.filter(t => !t.completed);
  const waitingTasks: Todo[] = [];
  const criticalTasks: Todo[] = [];
  const importantTasks: Todo[] = [];
  const quickWinsTasks: Todo[] = [];
  const upNextTasks: Todo[] = [];
  const inboxTasks: Todo[] = [];

  activeTodos.forEach(todo => {
    // 1. Waiting
    if (isTaskWaiting(todo)) {
      waitingTasks.push(todo);
      return;
    }

    const dueToday = isTaskDueToday(todo);
    const overdue = isTaskOverdue(todo);
    const dueTomorrow = isTaskDueTomorrow(todo);

    // 2. Up Next (Tomorrow or future scheduled)
    if (dueTomorrow || (todo.due_date && !dueToday && !overdue)) {
      upNextTasks.push(todo);
      return;
    }

    // 3. If no due date and no category/inbox, put in inbox
    if (!todo.due_date && (todo.category === 'Inbox' || !todo.category)) {
      inboxTasks.push(todo);
      // Also can be considered for today if user wants, but categorized as inbox
    }

    // 4. Today tasks (due today, overdue, or active without explicit future date)
    const isQuick = (todo.estimated_duration_minutes && todo.estimated_duration_minutes <= 20) || todo.priority === 'low';

    if (todo.priority === 'high' || overdue) {
      criticalTasks.push(todo);
    } else if (isQuick) {
      quickWinsTasks.push(todo);
    } else {
      importantTasks.push(todo);
    }
  });

  return {
    criticalTasks,
    importantTasks,
    quickWinsTasks,
    upNextTasks,
    waitingTasks,
    inboxTasks
  };
}

/**
 * Determine the single best task for FOCUS NOW with AI justification
 */
export function getFocusNowTask(todos: Todo[]): { task: Todo | null; reason: string } {
  const uncompleted = todos.filter(t => !t.completed && !isTaskWaiting(t));
  if (uncompleted.length === 0) {
    return {
      task: null,
      reason: 'Semua task hari ini telah selesai. Waktunya istirahat atau rencanakan esok hari.'
    };
  }

  // Score tasks based on urgency and priority
  const scored = uncompleted.map(task => {
    let score = 0;
    if (task.priority === 'high') score += 50;
    if (task.priority === 'medium') score += 30;
    if (task.priority === 'low') score += 10;

    if (isTaskOverdue(task)) score += 60;
    else if (isTaskDueToday(task)) score += 40;
    else if (isTaskDueTomorrow(task)) score += 20;

    // Boot camp relevance keywords
    const lower = (task.title + ' ' + (task.description || '')).toLowerCase();
    if (lower.includes('closing') || lower.includes('final project') || lower.includes('showcase')) score += 25;
    if (lower.includes('rundown') || lower.includes('materi') || lower.includes('grading')) score += 15;

    return { task, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const bestTask = scored[0].task;

  // Generate contextual mentor reason
  let reason = 'Task prioritas utama yang membutuhkan konsentrasi penuh Anda sekarang.';
  const lowerTitle = bestTask.title.toLowerCase();

  if (isTaskOverdue(bestTask)) {
    reason = `Task ini telah melewati tenggat waktu dan krusial untuk diselesaikan agar tidak menghambat flow bootcamp.`;
  } else if (lowerTitle.includes('closing') || lowerTitle.includes('showcase')) {
    reason = `Persiapan closing & event berdampak langsung ke seluruh peserta dan kelancaran acara.`;
  } else if (lowerTitle.includes('nilai') || lowerTitle.includes('final project') || lowerTitle.includes('grading')) {
    reason = `Penilaian final project dibutuhkan peserta sebelum sesi showcase dan kelulusan.`;
  } else if (lowerTitle.includes('materi') || lowerTitle.includes('sesi')) {
    reason = `Menyiapkan materi sesi berikutnya memastikan pembelajaran peserta berjalan optimal.`;
  } else if (bestTask.priority === 'high') {
    reason = `Menjadi prioritas tertinggi hari ini dengan estimasi dampak terbesar bagi pekerjaan Anda.`;
  } else if (isTaskDueToday(bestTask)) {
    reason = `Tenggat waktu hari ini. Selesaikan lebih awal untuk mengosongkan beban pikiran.`;
  }

  return { task: bestTask, reason };
}
