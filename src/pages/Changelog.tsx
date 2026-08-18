import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Zap, Bug, GitCommit, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

interface LogEntry {
    date: string;
    version: string;
    title: string;
    description: string;
    type: 'feature' | 'fix' | 'style';
}

const changelogData: LogEntry[] = [
    {
        date: '18 Agt 2026',
        version: 'v2.0.0',
        title: 'Redesign Besar: Execution-First Copilot',
        description: 'Perombakan arsitektur UX berorientasi eksekusi kerja mentor: Focus Now dominan dengan rekomendasi AI, 5 navigasi terfokus (Today, Inbox, Focus, All, Review), Quick Add natural language + voice, deep work timer, dan daily review triaging.',
        type: 'feature',
    },
    {
        date: '10 Des 2025',
        version: 'v1.6.0',
        title: 'Final Polish & Auto-Redirect',
        description: 'Penyempurnaan alur login langsung ke dashboard tugas dan optimasi halaman legal & kebijakan privasi.',
        type: 'fix',
    },
    {
        date: '10 Des 2025',
        version: 'v1.5.0',
        title: 'Privacy Policy & Terms of Service',
        description: 'Penambahan halaman kepatuhan data pengguna Google API dan pembaharuan komponen antarmuka modern.',
        type: 'feature',
    },
    {
        date: '10 Des 2025',
        version: 'v1.4.0',
        title: 'Overdue Triaging & Summary',
        description: 'Peningkatan pelacakan tugas melewati tenggat waktu dan perbaikan dialog ringkasan.',
        type: 'feature',
    },
    {
        date: '23 Nov 2025',
        version: 'v1.1.0',
        title: 'AI Copilot Integration',
        description: 'Integrasi AI untuk parsing tugas cerdas, pencarian semantik, dan deteksi anomali jadwal.',
        type: 'feature',
    },
    {
        date: '20 Nov 2025',
        version: 'v1.0.0',
        title: 'Peluncuran Perdana CatetYuk',
        description: 'Rilis versi awal manajemen tugas harian yang cepat, ringan, dan terenkripsi aman di cloud.',
        type: 'feature',
    },
];

export default function Changelog() {
    const navigate = useNavigate();

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'feature': return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
            case 'fix': return <Bug className="h-3.5 w-3.5 text-rose-500" />;
            case 'style': return <Zap className="h-3.5 w-3.5 text-sky-500" />;
            default: return <GitCommit className="h-3.5 w-3.5 text-primary" />;
        }
    };

    const getTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'feature': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'fix': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            case 'style': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
            default: return 'bg-secondary text-secondary-foreground border-border';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="gap-2 rounded-xl text-xs text-muted-foreground hover:text-foreground mb-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali</span>
                </Button>

                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Catatan Rilis & Pembaruan
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Riwayat pembaruan fitur, perbaikan bug, dan optimasi berkala CatetYuk.
                    </p>
                </div>

                <div className="space-y-4 pt-2">
                    {changelogData.map((log, index) => (
                        <Card key={index} className="rounded-2xl border border-border/80 shadow-sm bg-card transition-all hover:shadow">
                            <CardHeader className="pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold ${getTypeBadgeClass(log.type)}`}>
                                        {getTypeIcon(log.type)}
                                        <span className="capitalize">{log.type}</span>
                                    </div>
                                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                                        {log.version}
                                    </span>
                                    <CardTitle className="text-base font-semibold">{log.title}</CardTitle>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">{log.date}</span>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {log.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
