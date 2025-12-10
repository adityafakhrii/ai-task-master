import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
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
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold m-0">Kebijakan Privasi</h1>
                            <p className="text-muted-foreground mt-1">
                                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pendahuluan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Selamat datang di CatetYuk. Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda.
                                Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>1. Informasi yang Kami Kumpulkan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-muted-foreground">
                                Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat menggunakan aplikasi CatetYuk, termasuk namun tidak terbatas pada:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                <li><strong className="text-foreground">Informasi Akun:</strong> Nama, alamat email, dan foto profil (dari Google Auth atau input manual).</li>
                                <li><strong className="text-foreground">Konten Pengguna:</strong> Tugas, catatan, jadwal, dan preferensi yang Anda simpan dalam aplikasi.</li>
                                <li><strong className="text-foreground">Data Penggunaan:</strong> Log aktivitas, informasi perangkat, dan interaksi dengan fitur aplikasi.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. Penggunaan Informasi Google (Google Auth)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Aplikasi kami menggunakan layanan otentikasi Google (Google Auth) untuk memudahkan Anda masuk.
                                Jika Anda memilih untuk mendaftar atau masuk menggunakan Google, kami akan menerima informasi profil dasar Anda (nama, email, foto profil) yang diizinkan oleh Google.
                            </p>
                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                                <p className="text-sm">
                                    <strong>Penting:</strong> Penggunaan informasi yang diterima dari API Google akan mematuhi <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Kebijakan Data Pengguna Layanan API Google</a>, termasuk persyaratan Penggunaan Terbatas.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>3. Bagaimana Kami Menggunakan Informasi Anda</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-muted-foreground">Kami menggunakan informasi yang dikumpulkan untuk:</p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                <li>Menyediakan, memelihara, dan meningkatkan layanan kami.</li>
                                <li>Mempersonalitasi pengalaman penggunaan Anda.</li>
                                <li>Mengirimkan informasi teknis, pembaruan keamanan, dan notifikasi terkait layanan.</li>
                                <li>Mendeteksi, mencegah, dan mengatasi masalah teknis atau penipuan.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>4. Berbagi Informasi (Pihak Ketiga)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-muted-foreground">
                                Kami tidak menjual data pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi dalam keadaan tertentu seperti:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                <li>Dengan penyedia layanan pihak ketiga yang membantu kami mengoperasikan aplikasi (misalnya, penyedia hosting database seperti Supabase).</li>
                                <li>Jika diwajibkan oleh hukum atau untuk melindungi hak-hak kami.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>5. Keamanan Data & Hak Anda</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi data Anda dari akses, penggunaan, atau pengungkapan yang tidak sah.
                            </p>
                            <p className="text-muted-foreground">
                                Anda memiliki hak untuk mengakses, memperbaiki, atau menghapus data pribadi Anda yang tersimpan di sistem kami.
                                Anda dapat menghapus akun Anda kapan saja melalui halaman Profil.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Hubungi Kami</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-2">
                                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di:
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
