import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function TermsOfService() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali
                </Button>

                <div className="space-y-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold m-0">Syarat dan Ketentuan</h1>
                            <p className="text-muted-foreground mt-1">
                                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>1. Penerimaan Syarat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Dengan mengakses atau menggunakan aplikasi CatetYuk, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini.
                                Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan menggunakan layanan kami.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>2. Akun Pengguna</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Untuk menggunakan fitur tertentu, Anda perlu membuat akun. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda
                                    dan untuk semua aktivitas yang terjadi di bawah akun Anda.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>3. Penggunaan yang Diperbolehkan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-2 text-muted-foreground">
                                    Anda setuju untuk tidak menggunakan aplikasi untuk tujuan ilegal atau melanggar hukum, seperti:
                                </p>
                                <ul className="list-disc list-inside text-muted-foreground ml-2">
                                    <li>Menyebarkan malware atau virus.</li>
                                    <li>Mencoba mengakses sistem kami secara tidak sah.</li>
                                    <li>Mengganggu integritas atau kinerja layanan.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>4. Kekayaan Intelektual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Layanan dan konten aslinya (tidak termasuk konten yang Anda berikan) adalah dan akan tetap menjadi milik eksklusif CatetYuk dan pemberi lisensinya.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>5. Penghentian</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Kami berhak untuk menghentikan atau menangguhkan akses Anda ke layanan segera, tanpa pemberitahuan atau kewajiban sebelumnya,
                                    untuk alasan apa pun, termasuk namun tidak terbatas pada pelanggaran Syarat.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>6. Batasan Tanggung Jawab</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    CatetYuk atau pengembangnya tidak akan bertanggung jawab atas kerusakan tidak langsung, insidental, khusus, atau konsekuensial
                                    yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>7. Hubungi Kami</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-2">
                                Jika Anda memiliki pertanyaan tentang Syarat ini, silakan hubungi kami di:
                            </p>
                            <p className="font-medium text-primary">adityafakhri03@gmail.com</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
}
