import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function TermsOfService() {
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
                        <FileText className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Syarat & Ketentuan
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">1. Penerimaan Ketentuan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Dengan mengakses atau menggunakan aplikasi CatetYuk, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">2. Penggunaan Layanan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Anda setuju untuk menggunakan CatetYuk hanya untuk tujuan produktivitas yang sah dan mematuhi aturan berikut:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-muted-foreground ml-1">
                                <li>Menjaga kerahasiaan kredensial dan kata sandi akun Anda.</li>
                                <li>Tidak menggunakan aplikasi untuk aktivitas yang melanggar hukum atau merusak sistem.</li>
                                <li>Bertanggung jawab penuh atas konten dan tugas yang Anda kelola.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">3. Fitur AI & Layanan Pihak Ketiga</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                CatetYuk menyediakan fitur bantuan kecerdasan buatan (AI) untuk membantu menstrukturkan dan memprioritaskan tugas. Keputusan eksekusi kerja sepenuhnya berada di tangan Anda sebagai pengguna.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
}
