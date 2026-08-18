import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="text-center max-w-md space-y-5 p-8 rounded-3xl border border-border/80 bg-card shadow-xl">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold font-mono">
          404
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">Halaman Tidak Ditemukan</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Alamat yang Anda tuju tidak tersedia atau telah dipindahkan.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            onClick={() => navigate('/todos')}
            className="rounded-xl text-xs font-semibold gap-2 shadow-sm"
          >
            <Home className="h-4 w-4" />
            <span>Ke Dashboard</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="rounded-xl text-xs gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
