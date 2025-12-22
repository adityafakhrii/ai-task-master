import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    User,
    Shield,
    FileText,
    History,
    Mail,
    LogOut,
    ChevronRight,
    Heart
} from 'lucide-react';

export default function Menu() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    const menuItems = [
        {
            icon: Shield,
            label: 'Privacy Policy',
            path: '/privacy'
        },
        {
            icon: FileText,
            label: 'Terms of Service',
            path: '/terms'
        },
        {
            icon: History,
            label: 'Updates & Changelog',
            path: '/changelog'
        },
        {
            icon: Mail,
            label: 'Contact Support',
            path: '/contact'
        }
    ];

    return (
        <MobileLayout>
            <div className="p-4 space-y-6">
                <h1 className="text-2xl font-bold px-2">Menu</h1>

                {/* Profile Card */}
                <div
                    onClick={() => navigate('/profile')}
                    className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-xl flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
                >
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                            {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-lg truncate">
                            {user?.user_metadata?.full_name || 'Pengguna'}
                        </h2>
                        <p className="text-sm text-muted-foreground truncate">
                            {user?.email}
                        </p>
                        <p className="text-xs text-primary mt-1 font-medium">
                            Lihat Profil
                        </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                    <h3 className="px-2 text-sm font-medium text-muted-foreground">
                        Tentang Aplikasi
                    </h3>
                    <div className="bg-card/30 rounded-xl border border-border/40 overflow-hidden divide-y divide-border/40">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                            >
                                <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-foreground/80">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <span className="flex-1 font-medium">{item.label}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="pt-4">
                    <Button
                        variant="destructive"
                        className="w-full h-12 text-base rounded-xl gap-2"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-5 w-5" />
                        Keluar Aplikasi
                    </Button>
                </div>

                {/* Footer Info */}
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground/80">
                        <span>Dibuat dengan</span>
                        <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                        <span>oleh Aditya</span>
                    </div>
                    <p className="text-xs text-muted-foreground/60">
                        v1.6.0 • © {new Date().getFullYear()} CatetYuk
                    </p>
                </div>
            </div>
        </MobileLayout>
    );
}
