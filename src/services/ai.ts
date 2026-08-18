import { supabase } from '@/integrations/supabase/client';

export interface ParsedTaskResult {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string | null;
  due_date?: string | null;
  estimated_duration_minutes?: number | null;
  tags?: string[];
  subtasks?: string[];
  summary?: string;
  why_now?: string;
}

export interface PrioritizedDayResult {
  strategy_summary: string;
  recommended_order: Array<{
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    order: number;
    reason: string;
  }>;
  quick_wins_suggestion?: string;
}

export interface DailyReviewResult {
  headline: string;
  insight: string;
  priority_alert: string | null;
  suggested_focus_tomorrow: string[];
}

/**
 * Intelligent local NLP fallback parser for instant response
 * Supports Indonesian natural language date, priority, category, and subtasks
 */
export function localParseTask(text: string): ParsedTaskResult {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Priority detection
  let priority: 'low' | 'medium' | 'high' = 'medium';
  if (
    lower.includes('urgent') ||
    lower.includes('penting banget') ||
    lower.includes('harus selesai') ||
    lower.includes('deadline') ||
    lower.includes('krusial') ||
    lower.includes('high priority') ||
    lower.includes('asap') ||
    lower.includes('closing') ||
    lower.includes('final project')
  ) {
    priority = 'high';
  } else if (
    lower.includes('santai') ||
    lower.includes('kapan-kapan') ||
    lower.includes('low priority') ||
    lower.includes('kalau sempat') ||
    lower.includes('nanti aja')
  ) {
    priority = 'low';
  }

  // 2. Date detection
  const now = new Date();
  let dueDate: Date | null = null;

  if (lower.includes('hari ini') || lower.includes('today') || lower.includes('sore ini') || lower.includes('malam ini') || lower.includes('siang ini')) {
    dueDate = new Date(now);
    if (lower.includes('pagi')) dueDate.setHours(9, 0, 0, 0);
    else if (lower.includes('siang')) dueDate.setHours(12, 0, 0, 0);
    else if (lower.includes('sore')) dueDate.setHours(16, 0, 0, 0);
    else if (lower.includes('malam')) dueDate.setHours(20, 0, 0, 0);
    else dueDate.setHours(18, 0, 0, 0);
  } else if (lower.includes('besok') || lower.includes('tomorrow')) {
    dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (lower.includes('pagi')) dueDate.setHours(9, 0, 0, 0);
    else if (lower.includes('siang')) dueDate.setHours(12, 0, 0, 0);
    else if (lower.includes('sore')) dueDate.setHours(16, 0, 0, 0);
    else if (lower.includes('malam')) dueDate.setHours(20, 0, 0, 0);
    else dueDate.setHours(17, 0, 0, 0);
  } else if (lower.includes('lusa')) {
    dueDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    dueDate.setHours(17, 0, 0, 0);
  } else if (lower.includes('minggu depan') || lower.includes('next week')) {
    dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    dueDate.setHours(17, 0, 0, 0);
  }

  // 3. Category detection
  let category = 'Bootcamp';
  if (lower.includes('rundown') || lower.includes('closing') || lower.includes('event') || lower.includes('showcase')) {
    category = 'Event / Closing';
  } else if (lower.includes('nilai') || lower.includes('grading') || lower.includes('review final') || lower.includes('project')) {
    category = 'Review & Grading';
  } else if (lower.includes('materi') || lower.includes('slide') || lower.includes('silabus') || lower.includes('modul')) {
    category = 'Materi';
  } else if (lower.includes('chat') || lower.includes('grup') || lower.includes('tanya') || lower.includes('pertanyaan') || lower.includes('discord') || lower.includes('telegram')) {
    category = 'Community & Chat';
  } else if (lower.includes('absen') || lower.includes('rekap') || lower.includes('laporan') || lower.includes('admin')) {
    category = 'Admin';
  } else if (lower.includes('makan') || lower.includes('istirahat') || lower.includes('personal') || lower.includes('beli')) {
    category = 'Personal';
  }

  // 4. Suggested subtasks derivation
  const subtasks: string[] = [];
  if (lower.includes('closing') || lower.includes('showcase')) {
    subtasks.push('Finalisasi rundown acara closing', 'Cek kesiapan peserta showcase', 'Pastikan link streaming / room siap');
  } else if (lower.includes('nilai') || lower.includes('final project')) {
    subtasks.push('Cek repository GitHub peserta', 'Uji coba deployment project', 'Input nilai dan feedback konstruktif');
  } else if (lower.includes('materi')) {
    subtasks.push('Review slide dan code example', 'Pastikan repositori starter kit terupdate', 'Buat ringkasan poin inti sesi');
  } else if (lower.includes('tanya') || lower.includes('grup')) {
    subtasks.push('Buka thread pertanyaan teratas di grup', 'Jawab blocker utama peserta', 'Rangkum FAQ penting');
  } else {
    subtasks.push('Tentukan target output pertama', 'Eksekusi bagian paling krusial', 'Review dan finalisasi');
  }

  // 5. Title & clean extraction
  let title = clean;
  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return {
    title,
    description: clean,
    priority,
    category,
    due_date: dueDate ? dueDate.toISOString() : null,
    estimated_duration_minutes: priority === 'high' ? 45 : 25,
    tags: [category.toLowerCase()],
    subtasks,
    summary: `Task ${category} dengan prioritas ${priority.toUpperCase()}`,
    why_now: priority === 'high' ? 'Deadline mendesak dan berdampak langsung ke peserta bootcamp.' : 'Langkah persiapan penting untuk kelancaran sesi.'
  };
}

export async function parseTask(text: string): Promise<ParsedTaskResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-parse-task', {
      body: { text, type: 'parse' }
    });

    if (error || !data || !data.title) {
      console.warn('Fallback to local parser due to edge function error:', error);
      return localParseTask(text);
    }

    return {
      title: data.title,
      description: data.description || data.summary || text,
      priority: data.priority || 'medium',
      category: data.category || 'Bootcamp',
      due_date: data.due_date || null,
      estimated_duration_minutes: data.estimated_duration_minutes || (data.priority === 'high' ? 45 : 25),
      tags: Array.isArray(data.tags) ? data.tags : [],
      subtasks: Array.isArray(data.subtasks) ? data.subtasks : [],
      summary: data.summary,
      why_now: data.why_now
    };
  } catch (e) {
    console.warn('Local parser fallback active:', e);
    return localParseTask(text);
  }
}

export async function prioritizeDay(tasks: any[]): Promise<PrioritizedDayResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-parse-task', {
      body: { text: JSON.stringify(tasks).slice(0, 8000), type: 'prioritize' }
    });

    if (error || !data || !Array.isArray(data.recommended_order)) {
      throw error || new Error('Format respon tidak sesuai');
    }

    return data;
  } catch (err) {
    // Local fallback for prioritization
    const highTasks = tasks.filter(t => t.priority === 'high');
    const medTasks = tasks.filter(t => t.priority === 'medium');
    const lowTasks = tasks.filter(t => t.priority === 'low');
    const sorted = [...highTasks, ...medTasks, ...lowTasks];

    return {
      strategy_summary: `Fokus tuntaskan ${highTasks.length} task High Priority terlebih dahulu sebelum beralih ke tugas rutin atau chat.`,
      recommended_order: sorted.map((t, idx) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        order: idx + 1,
        reason: t.priority === 'high' ? 'High impact & deadline krusial' : (idx === 0 ? 'Memberikan momentum kerja awal' : 'Dapat dikerjakan setelah prioritas utama aman')
      })),
      quick_wins_suggestion: lowTasks.length > 0 ? `Gunakan task "${lowTasks[0].title}" sebagai jeda rileks di sore hari.` : undefined
    };
  }
}

export async function sliceTask(title: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-parse-task', {
      body: { text: `Pecahkan tugas ini menjadi 3-5 sub-tugas kecil yang dapat ditindaklanjuti. Judul Tugas: ${title}`, type: 'slice' }
    });

    if (error || !data || !Array.isArray(data.subtasks)) {
      return [
        `Siapkan data & checklist untuk ${title}`,
        `Kerjakan blok paling penting dari ${title}`,
        `Review hasil dan pastikan tidak ada yang terlewat`
      ];
    }

    return data.subtasks;
  } catch (err) {
    return [
      `Siapkan data & checklist untuk ${title}`,
      `Kerjakan blok paling penting dari ${title}`,
      `Review hasil dan pastikan tidak ada yang terlewat`
    ];
  }
}

export async function dailyReview(completedTasks: any[], incompleteTasks: any[]): Promise<DailyReviewResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-parse-task', {
      body: {
        text: JSON.stringify({
          completedTasks: completedTasks.map(t => ({ title: t.title, priority: t.priority, category: t.category })),
          incompleteTasks: incompleteTasks.map(t => ({ title: t.title, priority: t.priority, category: t.category, due_date: t.due_date }))
        }).slice(0, 8000),
        type: 'daily_review'
      }
    });

    if (error || !data || !data.headline) {
      throw error || new Error('Gagal memproses daily review');
    }

    return data;
  } catch (err) {
    const highIncomplete = incompleteTasks.filter(t => t.priority === 'high').length;
    return {
      headline: completedTasks.length > 0 ? `Hari yang produktif! ${completedTasks.length} task berhasil dituntaskan.` : 'Evaluasi harian Anda.',
      insight: highIncomplete > 0
        ? `Terdapat ${highIncomplete} task High Priority yang belum tuntas. Pertimbangkan menjadwalkannya di pagi hari esok saat energi masih prima.`
        : `Kerja bagus menjaga task penting tetap terkendali. Anda siap melanjutkan ritme kerja besok.`,
      priority_alert: highIncomplete > 0 ? `${highIncomplete} task penting tertunda.` : null,
      suggested_focus_tomorrow: incompleteTasks.slice(0, 3).map(t => t.title)
    };
  }
}

export async function dailySummary(tasks: any[]) {
  const { data, error } = await supabase.functions.invoke('ai-parse-task', {
    body: { text: JSON.stringify(tasks).slice(0, 8000), type: 'summary' }
  });

  if (error) {
    throw new Error(error.message || 'Gagal membuat ringkasan');
  }

  return data;
}

export async function semanticSearch(query: string, tasks: any[]) {
  const { data, error } = await supabase.functions.invoke('ai-parse-task', {
    body: {
      text: `Query: ${query}\nTasks: ${JSON.stringify(tasks).slice(0, 8000)}`,
      type: 'search'
    }
  });

  if (error) {
    throw new Error(error.message || 'Gagal melakukan pencarian');
  }

  return data;
}

export async function detectAnomaly(history: any[]) {
  const { data, error } = await supabase.functions.invoke('ai-parse-task', {
    body: { text: JSON.stringify(history).slice(0, 8000), type: 'anomaly' }
  });

  if (error) {
    throw new Error(error.message || 'Gagal mendeteksi anomali');
  }

  return data;
}

export async function rescheduleTasks(tasks: any[]) {
  const { data, error } = await supabase.functions.invoke('ai-parse-task', {
    body: { text: JSON.stringify(tasks).slice(0, 8000), type: 'reschedule' }
  });

  if (error) {
    throw new Error(error.message || 'Gagal menjadwalkan ulang tugas');
  }

  return data;
}

export async function generateThemeSuggestion(tasks: any[]) {
  const { data, error } = await supabase.functions.invoke('ai-parse-task', {
    body: { text: JSON.stringify(tasks).slice(0, 8000), type: 'theme_suggest' }
  });

  if (error) {
    throw new Error(error.message || 'Gagal merekomendasikan tema');
  }

  return data;
}

