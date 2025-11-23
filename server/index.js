import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. AI endpoints will return 500.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) : null;

const toJson = (text) => {
  try {
    if (!text) return null;
    let t = String(text).trim();
    // strip any code fences everywhere
    t = t.replace(/```[a-zA-Z]*\s*/g, '').replace(/```/g, '').trim();
    // direct parse attempt
    try {
      return JSON.parse(t);
    } catch (_) {}
    // find JSON object or array
    const firstBrace = t.indexOf('{');
    const firstBracket = t.indexOf('[');
    let start = -1;
    let end = -1;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = t.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = t.lastIndexOf(']');
    }
    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = t.slice(start, end + 1);
      return JSON.parse(jsonStr);
    }
  } catch (_) {}
  return null;
};

app.post('/api/ai/parse-task', async (req, res) => {
  try {
    if (!model) throw new Error('AI model not initialized');
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text is required' });

    const prompt = `Anda adalah asisten manajemen tugas. Ubah deskripsi menjadi JSON terstruktur dengan schema:
{
  "title": string,
  "due_date": string | null, // ISO 8601 (YYYY-MM-DD) jika ada
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
Pertimbangkan bahasa Indonesia (contoh: "besok pagi", "minggu depan"). Balas hanya JSON tanpa code fence atau penjelasan tambahan. Input: "${text}"`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const json = toJson(raw);
    if (!json) return res.status(502).json({ error: 'Failed to parse AI response', raw });
    return res.json(json);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/daily-summary', async (req, res) => {
  try {
    if (!model) throw new Error('AI model not initialized');
    const { tasks } = req.body || {};
    if (!Array.isArray(tasks)) return res.status(400).json({ error: 'tasks array is required' });
    const prompt = `Buat ringkasan tugas harian berdasarkan data berikut (JSON). Sorot yang urgent, urutkan, dan rekap progres. Balas dalam JSON saja tanpa code fence:
{
  "today_list": {"title": string, "id": string, "priority": string}[],
  "urgent": {"title": string, "id": string}[],
  "progress_summary": string,
  "recommendations": string[]
}
Data: ${JSON.stringify(tasks).slice(0, 8000)}`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const json = toJson(raw);
    if (!json) return res.status(502).json({ error: 'Failed to parse AI response', raw });
    return res.json(json);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/search', async (req, res) => {
  try {
    if (!model) throw new Error('AI model not initialized');
    const { query, tasks } = req.body || {};
    if (!query || !Array.isArray(tasks)) return res.status(400).json({ error: 'query and tasks required' });
    const prompt = `Cari secara semantik berdasarkan query dan kembalikan ranking relevansi. Balas dalam JSON array (hanya array string id), tanpa code fence.
Query: ${query}
Tasks: ${JSON.stringify(tasks).slice(0, 8000)}`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const json = toJson(raw);
    if (!json || !Array.isArray(json)) return res.status(502).json({ error: 'Failed to parse AI response', raw });
    return res.json(json);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/anomaly', async (req, res) => {
  try {
    if (!model) throw new Error('AI model not initialized');
    const { history } = req.body || {};
    if (!Array.isArray(history)) return res.status(400).json({ error: 'history array is required' });
    const prompt = `Deteksi anomali perilaku tugas (sering ditunda, estimasi vs aktual). Balas dalam JSON saja tanpa code fence:
{
  "insights": string[],
  "recommendations": string[]
}
History: ${JSON.stringify(history).slice(0, 8000)}`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const json = toJson(raw);
    if (!json) return res.status(502).json({ error: 'Failed to parse AI response', raw });
    return res.json(json);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`AI server listening on http://localhost:${port}`);
});