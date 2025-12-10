import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 flex-1">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 hover:bg-secondary/50 group"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Kembali
                </Button>

                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">Kebijakan Privasi</h1>
                        <p className="text-muted-foreground">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <ScrollArea className="h-[65vh] rounded-md border p-6 bg-card/50 backdrop-blur-sm">
                        <div className="space-y-8 pr-4">
                            <section className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-primary">1. Pendahuluan</h2>
                                <div className="text-muted-foreground space-y-2 leading-relaxed">
                                    <p>
                                        Selamat datang di CatetYuk ("kami", "kita", atau "milik kami"). Kami mengoperasikan aplikasi CatetYuk (selanjutnya disebut sebagai "Layanan").
                                    </p>
                                    <p>
                                        Halaman ini memberi tahu Anda tentang kebijakan kami mengenai pengumpulan, penggunaan, dan pengungkapan Data Pribadi saat Anda menggunakan Layanan kami dan pilihan yang Anda miliki terkait data tersebut.
                                    </p>
                                    <p>
                                        Kami menggunakan data Anda untuk menyediakan dan meningkatkan Layanan. Dengan menggunakan Layanan, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-primary">2. Definisi</h2>
                                <ul className="list-disc pl-5 text-muted-foreground space-y-2 leading-relaxed">
                                    <li>
                                        <strong>Layanan</strong>: Layanan adalah aplikasi CatetYuk yang dioperasikan oleh kami.
                                    </li>
                                    <li>
                                        <strong>Data Pribadi</strong>: Data Pribadi berarti data tentang individu yang hidup yang dapat diidentifikasi dari data tersebut (atau dari data tersebut dan informasi lain yang kami miliki atau mungkin kami miliki).
                                    </li>
                                    <li>
                                        <strong>Data Penggunaan</strong>: Data Penggunaan adalah data yang dikumpulkan secara otomatis baik yang dihasilkan oleh penggunaan Layanan atau dari infrastruktur Layanan itu sendiri (misalnya, durasi kunjungan halaman).
                                    </li>
                                    <li>
                                        <strong>Cookies</strong>: Cookies adalah file kecil yang disimpan di perangkat Anda (komputer atau perangkat seluler).
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-primary">3. Pengumpulan dan Penggunaan Informasi</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Kami mengumpulkan beberapa jenis informasi berbeda untuk berbagai tujuan guna menyediakan dan meningkatkan Layanan kami kepada Anda.
                                </p>

                                <h3 className="text-xl font-medium pt-2">Jenis Data yang Dikumpulkan</h3>

                                <div className="pl-4 space-y-4">
                                    <div>
                                        <h4 className="font-medium text-foreground">Data Pribadi</h4>
                                        <p className="text-muted-foreground leading-relaxed mt-1">
                                            Saat menggunakan Layanan kami, kami mungkin meminta Anda untuk memberikan kami informasi pengenal pribadi tertentu yang dapat digunakan untuk menghubungi atau mengidentifikasi Anda ("Data Pribadi"). Informasi pengenal pribadi mungkin termasuk, tetapi tidak terbatas pada:
                                        </p>
                                        <ul className="list-disc pl-5 text-muted-foreground mt-2">
                                            <li>Alamat Email</li>
                                            <li>Nama Depan dan Nama Belakang</li>
                                            <li>Cookies dan Data Penggunaan</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-foreground">Data Penggunaan</h4>
                                        <p className="text-muted-foreground leading-relaxed mt-1">
                                            Kami juga dapat mengumpulkan informasi yang dikirimkan browser Anda setiap kali Anda mengunjungi Layanan kami atau ketika Anda mengakses Layanan dengan atau melalui perangkat seluler ("Data Penggunaan").
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-primary">4. Penggunaan Data</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    CatetYuk menggunakan data yang dikumpulkan untuk berbagai tujuan:
                                </p>
                                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                    <li>Untuk menyediakan dan memelihara Layanan kami</li>
                                    <li>Untuk memberitahu Anda tentang perubahan pada Layanan kami</li>
                                    <li>Untuk memungkinkan Anda berpartisipasi dalam fitur interaktif Layanan kami ketika Anda memilih untuk melakukannya</li>
                                    <li>Untuk memberikan dukungan pelanggan</li>
                                    <li>Untuk mengumpulkan analisis atau informasi berharga sehingga kami dapat meningkatkan Layanan kami</li>
                                    <li>Untuk memantau penggunaan Layanan kami</li>
                                    <li>Untuk mendeteksi, mencegah, dan mengatasi masalah teknis</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-primary">5. Keamanan Data</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Keamanan data Anda penting bagi kami, tetapi ingatlah bahwa tidak ada metode transmisi melalui Internet, atau metode penyimpanan elektronik yang 100% aman. Meskipun kami berusaha menggunakan cara yang dapat diterima secara komersial untuk melindungi Data Pribadi Anda, kami tidak dapat menjamin keamanan mutlaknya.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-primary">6. Penyedia Layanan</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Kami dapat mempekerjakan perusahaan dan individu pihak ketiga untuk memfasilitasi Layanan kami ("Penyedia Layanan"), untuk menyediakan Layanan atas nama kami, untuk melakukan layanan terkait Layanan, atau untuk membantu kami dalam menganalisis bagaimana Layanan kami digunakan.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-primary">7. Tautan ke Situs Lain</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Layanan kami mungkin berisi tautan ke situs lain yang tidak dioperasikan oleh kami. Jika Anda mengklik tautan pihak ketiga, Anda akan diarahkan ke situs pihak ketiga tersebut. Kami sangat menyarankan Anda untuk meninjau Kebijakan Privasi setiap situs yang Anda kunjungi.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-primary">8. Perubahan pada Kebijakan Privasi Ini</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Kami akan memberi tahu Anda tentang setiap perubahan dengan memposting Kebijakan Privasi baru di halaman ini.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-primary">9. Hubungi Kami</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui email: adityafakhri03@gmail.com
                                </p>
                            </section>
                        </div>
                    </ScrollArea>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
