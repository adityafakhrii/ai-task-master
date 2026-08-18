import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="gap-2 rounded-xl text-xs text-muted-foreground hover:text-foreground mb-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali</span>
                </Button>

                <div className="flex items-center gap-3 pb-2">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                        <Shield className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Kebijakan Privasi
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Pendahuluan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Selamat datang di CatetYuk. Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda.
                                Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">1. Informasi yang Kami Kumpulkan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Kami mengumpulkan informasi yang Anda berikan secara langsung saat menggunakan aplikasi CatetYuk:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-muted-foreground ml-1">
                                <li><strong className="text-foreground">Informasi Akun:</strong> Nama, alamat email, dan foto profil (dari Google Auth atau input manual).</li>
                                <li><strong className="text-foreground">Konten Tugas:</strong> Judul tugas, deskripsi, estimasi waktu, subtask, dan prioritas yang Anda simpan.</li>
                                <li><strong className="text-foreground">Data Penggunaan:</strong> Log interaksi dan preferensi tema.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">2. Penggunaan Google API (Google Auth)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Aplikasi kami menggunakan layanan otentikasi Google (Google Auth) untuk memudahkan Anda masuk.
                                Jika Anda memilih masuk dengan Google, kami hanya mengakses informasi profil dasar (nama, email, foto profil) yang diizinkan.
                            </p>
                            <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 text-xs text-muted-foreground">
                                <strong className="text-foreground">Kepatuhan:</strong> Penggunaan data dari API Google mematuhi <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Kebijakan Data Pengguna Layanan API Google</a>.
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">3. Keamanan Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Seluruh data tugas dan komunikasi dienkripsi menggunakan standar keamanan industri (SSL/TLS dan Row Level Security database Supabase). Data Anda tidak pernah dijual kepada pihak ketiga.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
}
