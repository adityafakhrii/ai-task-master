import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="hidden sm:block mt-12 py-6 border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">

          {/* Copyright section */}
          <div className="text-sm text-muted-foreground order-2 md:order-1">
            © {new Date().getFullYear()} CatetYuk. Semua hak dilindungi.
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground order-1 md:order-2">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/changelog" className="hover:text-primary transition-colors">Updates</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>

          {/* Made With section */}
          <div className="flex flex-col items-center md:items-end gap-1 order-3">
            <a
              href="https://instagram.com/adityafakhrii"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <span>Dibuat dengan</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span>oleh Aditya</span>
            </a>
            <span className="text-[10px] text-muted-foreground/60 font-mono">v1.6.0</span>
          </div>

        </div>
      </div>
    </footer >
  );
}
