import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Menu as MenuIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const handleAddClick = () => {
        // Navigate to todos with action=new to trigger the dialog
        navigate('/todos?action=new');
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/40 pb-safe block md:hidden">
            <div className="flex items-center justify-around h-16 px-2">
                <button
                    onClick={() => navigate('/todos')}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                        isActive('/todos') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Home className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Home</span>
                </button>

                <button
                    onClick={handleAddClick}
                    className="flex flex-col items-center justify-center w-full h-full -mt-6"
                >
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform active:scale-95">
                        <Plus className="h-7 w-7" />
                    </div>
                </button>

                <button
                    onClick={() => navigate('/menu')}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                        isActive('/menu') ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <MenuIcon className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Menu</span>
                </button>
            </div>
        </nav>
    );
}
