import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    User,
    Shield,
    FileText,
    History,
    Mail,
    LogOut,
    ChevronRight,
    ArrowLeft,
    Palette,
    Sparkles
} from 'lucide-react';
import Footer from '@/components/Footer';

export default function Menu() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    const menuItems = [
        {
            icon: Shield,
            label: 'Kebijakan Privasi Data',
            path: '/privacy'
        },
        {
            icon: FileText,
            label: 'Syarat & Ketentuan',
            path: '/terms'
        },
        {
            icon: History,
            label: 'Catatan Rilis & Fitur Baru',
            path: '/changelog'
        },
        {
            icon: Mail,
            label: 'Kontak & Ngobrol Santai',
            path: '/contact'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <div className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 space-y-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/todos')}
                        className="h-8 w-8 rounded-lg text-muted-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-xl font-bold tracking-tight">Menu Utama</h1>
                </div>

                {/* Profile Shortcut Card */}
                <div
                    onClick={() => navigate('/profile')}
                    className="bg-card hover:bg-card/90 border border-border/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm active:scale-[0.99] transition-all cursor-pointer"
                >
                    <Avatar className="h-14 w-14 border border-primary/20 shadow-xs">
                        <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-sm sm:text-base truncate">
                            {user?.user_metadata?.full_name || 'Mentor'}
                        </h2>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                        </p>
                        <p className="text-[11px] text-primary mt-0.5 font-medium">
                            Lihat & Edit Profil Lo →
                        </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                    <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tema Visual
                    </h3>
                    <div className="bg-card border border-border/80 p-3.5 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <Palette className="h-4 w-4 text-primary" />
                            <span>Pilih Vibe Tema</span>
                        </div>
                        <Select value={theme} onValueChange={(val) => setTheme(val)}>
                            <SelectTrigger id="theme-select" className="w-[160px] h-9 text-xs rounded-xl bg-background">
                                <SelectValue placeholder="Pilih tema..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Terang (Light)</SelectItem>
                                <SelectItem value="dark">Gelap (Dark)</SelectItem>
                                <SelectItem value="neon-dark">Neon Cyberpunk</SelectItem>
                                <SelectItem value="deep-ocean">Deep Ocean</SelectItem>
                                <SelectItem value="system">Ikut Sistem HP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Navigation Links Group */}
                <div className="space-y-2">
                    <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Info & Bantuan
                    </h3>
                    <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden divide-y divide-border/60">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="w-full p-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors text-left"
                            >
                                <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center text-primary">
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <span className="flex-1 text-xs sm:text-sm font-medium">{item.label}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="pt-2">
                    <Button
                        variant="outline"
                        className="w-full h-11 text-xs sm:text-sm font-semibold rounded-2xl gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-4 w-4" />
                        Cabut / Keluar Akun
                    </Button>
                </div>
            </div>
            <Footer />
        </div>
    );
}
