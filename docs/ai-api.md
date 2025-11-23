# AI API (Gemini)

## Env
- `GEMINI_API_KEY`: kunci API Gemini (jangan taruh di frontend)

## Server
- Start dev: `npm run dev` (menghidupkan Vite dan server AI)
- Port server: `http://localhost:8787`

## Endpoints

### POST `/api/ai/parse-task`
- Body: `{ "text": string }`
- Response:
```
{
  "title": string,
  "due_date": string | null,
  "priority": "low" | "medium" | "high",
  "estimated_duration_minutes": number | null,
  "category": string | null,
  "tags": string[],
  "suggestions": {
    "subtasks": string[],
    "checklist": string[],
    "templates": string[]
  }
}
```

### POST `/api/ai/daily-summary`
- Body: `{ "tasks": Task[] }`
- `Task` contoh: `{ id, title, description, priority, category, completed, created_at, updated_at }`
- Response:
```
{
  "today_list": {"title": string, "id": string, "priority": string}[],
  "urgent": {"title": string, "id": string}[],
  "progress_summary": string,
  "recommendations": string[]
}
```

### POST `/api/ai/search`
- Body: `{ "query": string, "tasks": Task[] }`
- Response: `string[]` berisi daftar `id` tugas terurut dari paling relevan

### POST `/api/ai/anomaly`
- Body: `{ "history": HistoryItem[] }`
- `HistoryItem` contoh: `{ id, timestamp, actor, data: TaskSnapshot }`
- Response:
```
{
  "insights": string[],
  "recommendations": string[]
}
```

## Error
- Status 400: request tidak valid
- Status 500: model belum diinisialisasi atau kegagalan internal
- Status 502: gagal parse output AI

## Keamanan
- Kunci API hanya di server (`process.env.GEMINI_API_KEY`)
- Frontend memanggil endpoint server, tidak langsung ke Gemini