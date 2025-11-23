import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CatetYuk. Semua hak dilindungi.
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
