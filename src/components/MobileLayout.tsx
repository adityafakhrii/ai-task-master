import { BottomNav } from './BottomNav';

interface MobileLayoutProps {
    children: React.ReactNode;
    className?: string;
    showNav?: boolean;
}

export function MobileLayout({ children, className = "", showNav = true }: MobileLayoutProps) {
    return (
        <div className={`min-h-[100dvh] bg-background ${className}`}>
            <div className={showNav ? "pb-24" : ""}>
                {children}
            </div>
            {showNav && <BottomNav />}
        </div>
    );
}
