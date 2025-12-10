import { Button } from '@/components/ui/button';
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

                <div className="prose dark:prose-invert max-w-none">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold m-0">Kebijakan Privasi (Privacy Policy)</h1>
                    </div>

                    <p className="lead text-xl text-muted-foreground">
                        Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
                    </p>

                    <p>
                        Selamat datang di CatetYuk. Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda.
                        Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
                    </p>

                    <h3>1. Informasi yang Kami Kumpulkan</h3>
                    <p>
                        Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat menggunakan aplikasi CatetYuk, termasuk namun tidak terbatas pada:
                    </p>
                    <ul>
                        <li>Informasi Akun: Nama, alamat email, dan foto profil (dari Google Auth atau input manual).</li>
                        <li>Konten Pengguna: Tugas, catatan, jadwal, dan preferensi yang Anda simpan dalam aplikasi.</li>
                        <li>Data Penggunaan: Log aktivitas, informasi perangkat, dan interaksi dengan fitur aplikasi.</li>
                    </ul>

                    <h3>2. Penggunaan Informasi Google (Google Auth)</h3>
                    <p>
                        Aplikasi kami menggunakan layanan otentikasi Google (Google Auth) untuk memudahkan Anda masuk.
                        Jika Anda memilih untuk mendaftar atau masuk menggunakan Google, kami akan menerima informasi profil dasar Anda (nama, email, foto profil) yang diizinkan oleh Google.
                    </p>
                    <p>
                        <strong>Penting:</strong> Penggunaan informasi yang diterima dari API Google akan mematuhi <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Kebijakan Data Pengguna Layanan API Google</a>, termasuk persyaratan Penggunaan Terbatas.
                    </p>

                    <h3>3. Bagaimana Kami Menggunakan Informasi Anda</h3>
                    <p>Kami menggunakan informasi yang dikumpulkan untuk:</p>
                    <ul>
                        <li>Menyediakan, memelihara, dan meningkatkan layanan kami.</li>
                        <li>Mempersonalitasi pengalaman penggunaan Anda.</li>
                        <li>Mengirimkan informasi teknis, pembaruan keamanan, dan notifikasi terkait layanan.</li>
                        <li>Mendeteksi, mencegah, dan mengatasi masalah teknis atau penipuan.</li>
                    </ul>

                    <h3>4. Berbagi Informasi (Pihak Ketiga)</h3>
                    <p>
                        Kami tidak menjual data pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi dalam keadaan tertentu seperti:
                    </p>
                    <ul>
                        <li>Dengan penyedia layanan pihak ketiga yang membantu kami mengoperasikan aplikasi (misalnya, penyedia hosting database seperti Supabase).</li>
                        <li>Jika diwajibkan oleh hukum atau untuk melindungi hak-hak kami.</li>
                    </ul>

                    <h3>5. Keamanan Data</h3>
                    <p>
                        Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi data Anda dari akses, penggunaan, atau pengungkapan yang tidak sah.
                    </p>

                    <h3>6. Hak Anda</h3>
                    <p>
                        Anda memiliki hak untuk mengakses, memperbaiki, atau menghapus data pribadi Anda yang tersimpan di sistem kami.
                        Anda dapat menghapus akun Anda kapan saja melalui halaman Profil.
                    </p>

                    <h3>7. Hubungi Kami</h3>
                    <p>
                        Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di:
                        <br />
                        Email: adityafakhri09@gmail.com
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
