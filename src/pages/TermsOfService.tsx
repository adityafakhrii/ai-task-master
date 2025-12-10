import { Button } from '@/components/ui/button';
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

                <div className="prose dark:prose-invert max-w-none">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold m-0">Syarat dan Ketentuan (Terms of Service)</h1>
                    </div>

                    <p className="lead text-xl text-muted-foreground">
                        Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
                    </p>

                    <h3>1. Penerimaan Syarat</h3>
                    <p>
                        Dengan mengakses atau menggunakan aplikasi CatetYuk, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini.
                        Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan menggunakan layanan kami.
                    </p>

                    <h3>2. Akun Pengguna</h3>
                    <p>
                        Untuk menggunakan fitur tertentu, Anda perlu membuat akun. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda
                        dan untuk semua aktivitas yang terjadi di bawah akun Anda.
                    </p>

                    <h3>3. Penggunaan yang Diperbolehkan</h3>
                    <p>
                        Anda setuju untuk tidak menggunakan aplikasi untuk tujuan ilegal atau melanggar hukum, termasuk namun tidak terbatas pada:
                    </p>
                    <ul>
                        <li>Menyebarkan malware atau virus.</li>
                        <li>Mencoba mengakses sistem kami secara tidak sah.</li>
                        <li>Melakukan tindakan yang mengganggu integritas atau kinerja layanan.</li>
                    </ul>

                    <h3>4. Kekayaan Intelektual</h3>
                    <p>
                        Layanan dan konten aslinya (tidak termasuk konten yang Anda berikan) adalah dan akan tetap menjadi milik eksklusif CatetYuk dan pemberi lisensinya.
                    </p>

                    <h3>5. Penghentian</h3>
                    <p>
                        Kami berhak untuk menghentikan atau menangguhkan akses Anda ke layanan segera, tanpa pemberitahuan atau kewajiban sebelumnya,
                        untuk alasan apa pun, termasuk namun tidak terbatas pada pelanggaran Syarat.
                    </p>

                    <h3>6. Batasan Tanggung Jawab</h3>
                    <p>
                        CatetYuk atau pengembangnya tidak akan bertanggung jawab atas kerusakan tidak langsung, insidental, khusus, atau konsekuensial
                        yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan.
                    </p>

                    <h3>7. Perubahan Syarat</h3>
                    <p>
                        Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Syarat ini kapan saja.
                        Jika revisi tersebut material, kami akan mencoba memberikan pemberitahuan setidaknya 30 hari sebelum syarat baru berlaku.
                    </p>

                    <h3>8. Hubungi Kami</h3>
                    <p>
                        Jika Anda memiliki pertanyaan tentang Syarat ini, silakan hubungi kami di:
                        <br />
                        Email: adityafakhri09@gmail.com
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
