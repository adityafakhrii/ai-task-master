import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Inbox,
  Play,
  ListTodo,
  CheckSquare,
  Plus,
  LogOut,
  Sparkles,
  User,
  ShieldAlert,
  Menu as MenuIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export type NavTab = 'today' | 'inbox' | 'focus' | 'all' | 'review';

interface AppLayoutProps {
  children: ReactNode;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickAdd: () => void;
  todayCompletedCount: number;
  todayTotalCount: number;
  inboxCount: number;
}

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  onQuickAdd,
  todayCompletedCount,
  todayTotalCount,
  inboxCount
}: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const now = new Date();
  const dateFormatted = format(now, 'EEEE, d MMMM yyyy', { locale: idLocale });

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Mentor';

  const navItems = [
    {
      id: 'today' as NavTab,
      label: 'Today',
      icon: CalendarDays,
      badge: todayTotalCount > 0 ? `${todayCompletedCount}/${todayTotalCount}` : undefined
    },
    {
      id: 'inbox' as NavTab,
      label: 'Inbox',
      icon: Inbox,
      badge: inboxCount > 0 ? `${inboxCount}` : undefined
    },
    {
      id: 'focus' as NavTab,
      label: 'Focus',
      icon: Play
    },
    {
      id: 'all' as NavTab,
      label: 'All Tasks',
      icon: ListTodo
    },
    {
      id: 'review' as NavTab,
      label: 'Review',
      icon: CheckSquare
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-border/80 bg-sidebar p-4 shrink-0 fixed top-0 bottom-0 left-0 z-40">
        <div className="space-y-6">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <img src="/CatetYuk3.png" alt="CatetYuk" className="h-8 w-8 rounded-lg shadow-sm" />
            <div>
              <h1 className="font-bold text-base tracking-tight text-sidebar-foreground">
                CatetYuk
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Execution Copilot
              </p>
            </div>
          </div>

          {/* Quick Add Button */}
          <Button
            onClick={onQuickAdd}
            className="w-full h-10 rounded-xl font-semibold text-xs gap-2 shadow-sm bg-primary text-primary-foreground hover:bg-primary/95 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Add Task</span>
          </Button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all',
                    active
                      ? 'bg-sidebar-accent text-sidebar-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-md text-[10px] font-semibold',
                        active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Theme at Bottom of Sidebar */}
        <div className="pt-4 border-t border-sidebar-border space-y-3">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-sidebar-accent/60 cursor-pointer transition-colors"
          >
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-sidebar-foreground">
                {user?.user_metadata?.full_name || 'Mentor'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/60 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
              <span>{getGreeting()}, {userName}!</span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              {dateFormatted}
            </p>
          </div>

          {/* Daily Progress Counter & Mobile Controls */}
          <div className="flex items-center gap-3">
            {todayTotalCount > 0 && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {todayCompletedCount} dari {todayTotalCount} task
                </span>
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.min(100, (todayCompletedCount / todayTotalCount) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="md:hidden flex items-center gap-1.5">
              <ModeToggle />
              <button
                onClick={() => navigate('/menu')}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground"
              >
                <MenuIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* MOBILE FLOATING ACTION BUTTON (FAB) */}
      <button
        type="button"
        onClick={onQuickAdd}
        className="fixed bottom-20 right-4 z-50 md:hidden h-13 w-13 p-3.5 rounded-full bg-primary text-primary-foreground shadow-2xl hover:bg-primary/95 border-2 border-background flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105"
        title="Tambah Task Baru"
        aria-label="Tambah Task Baru"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/80 pb-safe md:hidden shadow-lg">
        <div className="grid grid-cols-5 h-16 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center h-full gap-1 transition-colors relative py-1',
                  active ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                <span className="text-[10px] tracking-tight">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-2 right-3 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
