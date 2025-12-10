import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ListTodo, Sparkles, Zap, Search, FileText, ScanEye } from 'lucide-react';
import Footer from '@/components/Footer';
import { InstallPrompt } from '@/components/InstallPrompt';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/todos');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Sabar ya bestie...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="flex-1 flex flex-col items-center p-4">
        {/* Hero Section */}
        <section className="text-center space-y-8 p-8 max-w-2xl mt-10 md:mt-20">
          <div className="flex justify-center mb-6">
            <img src="/CatetYuk3.png" alt="CatetYuk Logo" className="h-24 w-24 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text">
            CatetYuk
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto font-light">
            simplify your task.
          </p>



          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button onClick={() => navigate('/auth')} size="lg" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto">
              Gas Mulai!
            </Button>
            <InstallPrompt />
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl px-4 w-full">
          <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all">
            <ListTodo className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Organisasi Sat-Set</h3>
            <p className="text-muted-foreground">Bikin, update, sama atur to-do list lo di satu tempat. Gampang banget!</p>
          </div>
          <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all">
            <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Pantau Progres</h3>
            <p className="text-muted-foreground">Liat seberapa produktif lo hari ini, ceklis yang udah kelar biar makin semangat!</p>
          </div>
          <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all">
            <Sparkles className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Prioritasin Aja</h3>
            <p className="text-muted-foreground">Fokus ke yang penting-penting dulu, biar gak burnout.</p>
          </div>
        </section>

        {/* AI Features Section */}
        <section className="w-full max-w-5xl px-4 mt-24">
          <div className="text-center mb-12">
            <span className="block mb-4 text-sm font-medium text-primary">
              Powered by AI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text mb-4">
              Asisten Pribadi yang <span className="text-primary italic">Peka Banget</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gak cuma nyatet, CatetYuk pake AI canggih biar hidup lo makin smooth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border hover:border-primary/50 transition-all hover:-translate-y-1">
              <Zap className="h-8 w-8 mb-4" />
              <h3 className="font-bold mb-2">Input Suka-Suka</h3>
              <p className="text-sm text-muted-foreground">
                "Besok meeting jam 9". Lo ketik gitu doang, AI langsung bikinin tugas lengkap sama jamnya.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border hover:border-primary/50 transition-all hover:-translate-y-1">
              <Search className="h-8 w-8 mb-4" />
              <h3 className="font-bold mb-2">Cari Pake Perasaan</h3>
              <p className="text-sm text-muted-foreground">
                Lupa judul tugas? Cari deskripsinya aja, AI kita ngerti kok maksud lo apa.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border hover:border-primary/50 transition-all hover:-translate-y-1">
              <FileText className="h-8 w-8 mb-4" />
              <h3 className="font-bold mb-2">Ringkasan Kilat</h3>
              <p className="text-sm text-muted-foreground">
                Kebanyakan tugas? Minta AI bikinin rangkuman harian biar lo tau harus mulai darimana.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border hover:border-primary/50 transition-all hover:-translate-y-1">
              <ScanEye className="h-8 w-8 mb-4" />
              <h3 className="font-bold mb-2">Deteksi Anomali</h3>
              <p className="text-sm text-muted-foreground">
                Ada deadline tabrakan atau tugas aneh? AI bakal kasih warning biar lo gak blunder.
              </p>
            </div>
          </div>
        </section>

        {/* About & Data Usage Section (Critical for Google Auth Verification) */}
        <section className="mt-24 max-w-4xl px-4 w-full space-y-12 mb-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-center">Tentang CatetYuk</h2>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              CatetYuk itu aplikasi buat bantu lo ngatur tugas biar hidup lo lebih teratur.
              Misi kita simpel: bikin lo bisa ngerjain goals harian tanpa gangguan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center bg-card rounded-2xl p-8 border">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Kenapa Kita Butuh Data Lo?</h3>
              <p className="text-muted-foreground mb-4">
                Biar pengalaman lo mulus di semua device, CatetYuk butuh lo login dulu nih.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                  <span className="text-sm text-foreground/80"><strong>Bikin Akun:</strong> Kita pake profil Google lo (nama, email, foto) buat bikin akun khusus buat lo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                  <span className="text-sm text-foreground/80"><strong>Sinkronisasi Data:</strong> Tugas-tugas lo aman di cloud kita, jadi bisa dibuka dari hp, laptop, mana aja.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                  <span className="text-sm text-foreground/80"><strong>Privasi Nomor Satu:</strong> Kita gak bakal jual data lo. Kita cuma pake buat layanan ini doang, beneran.</span>
                </li>
              </ul>
            </div>
            <div className="bg-secondary/20 p-6 rounded-xl flex flex-col justify-center h-full">
              <h3 className="text-xl font-semibold mb-3">Kebijakan Penggunaan Terbatas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Penggunaan dan transfer informasi yang diterima CatetYuk dari Google API ke aplikasi lain akan mematuhi <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Kebijakan Data Pengguna Layanan Google API</a>, termasuk persyaratan Penggunaan Terbatas.
              </p>
              <Button variant="outline" onClick={() => navigate('/privacy')}>Baca Kebijakan Privasi</Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
