import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, GitCommit, Sparkles, Zap, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';

interface LogEntry {
    date: string;
    version: string;
    title: string;
    description: string;
    type: 'feature' | 'fix' | 'style';
}

const changelogData: LogEntry[] = [
    {
        date: '10 Des 2025',
        version: 'v1.6.0',
        title: 'Final Polish & Auto-Redirect',
        description: 'Kalo udah login ya langsung gaskeun ke tugas lah, ngapain liat form login lagi. Auto-redirect activated! Plus legal pages udah rapi jali.',
        type: 'fix',
    },
    {
        date: '10 Des 2025',
        version: 'v1.5.0',
        title: 'Legal Stuff & UI Glow Up',
        description: 'Nambahin halaman Privacy Policy & Terms biar keliatan profesh. Layoutnya udah pake Card biar aesthetic parah. No drama legalitas!',
        type: 'feature',
    },
    {
        date: '10 Des 2025',
        version: 'v1.4.0',
        title: 'Modals & Overdue Tab',
        description: 'Tab baru "Lewat Deadline" buat tugas yang udah basi. Jangan dilupain woi! Modal ringkasan juga udah bener scroll-nya, gak nyangkut lagi.',
        type: 'feature',
    },
    {
        date: '10 Des 2025',
        version: 'v1.3.0',
        title: 'Password Security Upgrade',
        description: 'Update flow ganti password. Login email wajib setor password lama, login Google tinggal gaskeun bikin baru. Aman sentosa.',
        type: 'feature',
    },
    {
        date: '10 Des 2025',
        version: 'v1.2.0',
        title: 'PWA Ready, Install Skuy!',
        description: 'CatetYuk resmi jadi PWA! Bisa install di HP, icon HD gak burik. Akses sat set wat wet tanpa ribet buka browser.',
        type: 'feature',
    },
    {
        date: '23 Nov 2025',
        version: 'v1.1.0',
        title: 'Otak AI Masuk',
        description: 'Integrasi Gemini AI nih bos! Bisa rangkum tugas harian, cari pinter (semantic search), sampe deteksi anomali. Canggih bet dah.',
        type: 'feature',
    },
    {
        date: '21 Nov 2025',
        version: 'v1.0.1',
        title: 'Bahasa Gaul Mode On',
        description: 'Transisisi bahasa jadi Indonesia santuy biar makin relatable. Gak kaku kayak robot, asik kan? User experience ++.',
        type: 'style',
    },
    {
        date: '20 Nov 2025',
        version: 'v1.0.0',
        title: 'The Beginning',
        description: 'Lahirnya CatetYuk. Awal mula segalanya. Masih polos, tapi punya mimpi gede buat bikin lo makin produktif.',
        type: 'feature',
    },
];

export default function Changelog() {
    const navigate = useNavigate();

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'feature': return <Sparkles className="h-4 w-4 text-yellow-500" />;
            case 'fix': return <Bug className="h-4 w-4 text-red-500" />;
            case 'style': return <Zap className="h-4 w-4 text-blue-500" />;
            default: return <GitCommit className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'feature': return 'bg-yellow-500/10 text-yellow-500 border-yellow-200';
            case 'fix': return 'bg-red-500/10 text-red-500 border-red-200';
            case 'style': return 'bg-blue-500/10 text-blue-500 border-blue-200';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back Dulu
                </Button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-full animate-pulse">
                        <GitCommit className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold m-0">Catatan Update (Changelog)</h1>
                        <p className="text-muted-foreground mt-1">
                            Jejak digital perjalanan kita hari ini ✨
                        </p>
                    </div>
                </div>

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
                    {changelogData.map((log, index) => (
                        <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* Icon Marker */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                {getTypeIcon(log.type)}
                            </div>

                            {/* Card Content */}
                            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-0 hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant="outline" className={getTypeColor(log.type)}>{log.version}</Badge>
                                        <span className="text-xs text-muted-foreground">{log.date}</span>
                                    </div>
                                    <CardTitle className="text-lg">{log.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {log.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground text-sm italic">
                        "Terus update biar gak kudet." - Developer, 2025
                    </p>
                </div>

            </div>
            <Footer />
        </div>
    );
}
