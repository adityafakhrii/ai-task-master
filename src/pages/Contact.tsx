import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Instagram, Linkedin, Github, MessageSquare, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function Contact() {
    const navigate = useNavigate();

    const contactMethods = [
        {
            title: 'Email',
            value: 'adityafakhri03@gmail.com',
            link: 'mailto:adityafakhri03@gmail.com',
            icon: Mail,
            color: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
        },
        {
            title: 'LinkedIn',
            value: 'linkedin.com/in/adityafakhrii',
            link: 'https://www.linkedin.com/in/adityafakhrii/',
            icon: Linkedin,
            color: 'text-sky-600 bg-sky-600/10 border-sky-600/20'
        },
        {
            title: 'Instagram',
            value: '@adityafakhrii',
            link: 'https://instagram.com/adityafakhrii',
            icon: Instagram,
            color: 'text-pink-500 bg-pink-500/10 border-pink-500/20'
        },
        {
            title: 'GitHub',
            value: 'github.com/adityafakhrii',
            link: 'https://github.com/adityafakhrii',
            icon: Github,
            color: 'text-slate-700 dark:text-slate-300 bg-slate-500/10 border-slate-500/20'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl space-y-6">
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
                        Bantuan & Kontak
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Punya saran fitur, menemukan kendala, atau ingin berkolaborasi? Hubungi kami melalui saluran berikut.
                    </p>
                </div>

                <div className="grid gap-3.5 pt-2">
                    {contactMethods.map((item) => (
                        <a
                            key={item.title}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                        >
                            <Card className="rounded-2xl border border-border/80 shadow-sm bg-card hover:border-primary/40 hover:shadow transition-all">
                                <CardHeader className="p-4 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3.5">
                                        <div className={`p-2.5 rounded-xl border flex items-center justify-center ${item.color}`}>
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                                            <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors mt-0.5">
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </CardHeader>
                            </Card>
                        </a>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
