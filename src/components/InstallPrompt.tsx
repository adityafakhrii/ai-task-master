import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check for iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    // If installed or not installable (and not iOS), don't show
    // Note: iOS doesn't support beforeinstallprompt, so we might want to show a manual instruction if desired
    // But for now, we only show button if deferredPrompt exists (Android/Desktop)
    if (!deferredPrompt && !isIOS) return null;

    if (isIOS) {
        // Optional: Render something specific for iOS or just return null if we don't want to handle it manually yet
        // The user specifically mentioned "PWA", so maybe they want it everywhere.
        // But for now let's focus on the standard install prompt.
        // If deferredPrompt is missing on iOS, we can't programmatically trigger it anyway.
        return null;
    }

    return (
        <Button
            onClick={handleInstallClick}
            variant="outline"
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-all"
        >
            <Download className="h-5 w-5" />
            Install Aplikasi
        </Button>
    );
}
