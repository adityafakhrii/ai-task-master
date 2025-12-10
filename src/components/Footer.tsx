import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CatetYuk. Semua hak dilindungi.
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/changelog" className="hover:text-primary transition-colors">Updates</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dibuat dengan</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" aria-hidden="true" />
            <span>menggunakan AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
