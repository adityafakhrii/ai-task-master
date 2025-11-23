export async function parseTask(text: string) {
  const res = await fetch('/api/ai/parse-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal memproses AI');
  }
  return res.json();
}

export async function dailySummary(tasks: any[]) {
  const res = await fetch('/api/ai/daily-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal membuat ringkasan');
  }
  return res.json();
}

export async function semanticSearch(query: string, tasks: any[]) {
  const res = await fetch('/api/ai/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, tasks })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal melakukan pencarian');
  }
  return res.json();
}

export async function detectAnomaly(history: any[]) {
  const res = await fetch('/api/ai/anomaly', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mendeteksi anomali');
  }
  return res.json();
}