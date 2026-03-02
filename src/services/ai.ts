import { supabase } from '@/integrations/supabase/client';

export async function parseTask(text: string) {
  const { data, error } = await supabase.functions.invoke('ai-parse-task', {
    body: { text, type: 'parse' }
  });

  if (error) {
    throw new Error(error.message || 'Gagal memproses AI');
  }

  return data;
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
