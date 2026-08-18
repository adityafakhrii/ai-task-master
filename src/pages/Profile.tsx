import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Lock, Camera, AlertTriangle, Trash2, Eye, EyeOff, Palette, ShieldAlert } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/components/theme-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Footer from '@/components/Footer';

const compressAndConvertToWebP = (file: File, maxDimension = 400, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDimension) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Gagal membuat context 2d canvas'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Gagal mengonversi gambar ke WebP'));
                        }
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export default function Profile() {
    const { user, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [showFirstDeleteDialog, setShowFirstDeleteDialog] = useState(false);
    const [showSecondDeleteDialog, setShowSecondDeleteDialog] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (authLoading) return;
        if (user) {
            setFullName(user.user_metadata.full_name || '');
            loadProfile();
        } else {
            navigate('/auth');
        }
    }, [user, authLoading, navigate]);

    const loadProfile = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

        if (!error && data) {
            setAvatarUrl(data.avatar_url || user.user_metadata.avatar_url || user.user_metadata.picture || '');
        } else {
            setAvatarUrl(user.user_metadata.avatar_url || user.user_metadata.picture || '');
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;

            toast({
                title: "Profil Berhasil Diperbarui",
                description: "Informasi profil Anda telah disimpan."
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Terjadi Kesalahan",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const isGoogleAuth = user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google');

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Password Tidak Cocok",
                description: "Pastikan konfirmasi kata sandi sama."
            });
            return;
        }

        setLoading(true);
        try {
            if (!isGoogleAuth) {
                if (!oldPassword) {
                    throw new Error("Password lama wajib diisi.");
                }

                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: user?.email || '',
                    password: oldPassword
                });

                if (signInError) {
                    throw new Error("Password lama salah. Silakan coba lagi.");
                }
            }

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast({
                title: isGoogleAuth ? "Password Berhasil Dibuat" : "Password Berhasil Diperbarui",
                description: "Password baru Anda telah aktif."
            });
            setPassword('');
            setConfirmPassword('');
            setOldPassword('');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Gagal Memperbarui Password",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const generateSecureFileName = () => {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const webpBlob = await compressAndConvertToWebP(file);
            const filePath = `${user!.id}/${generateSecureFileName()}.webp`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, webpBlob, { 
                    contentType: 'image/webp',
                    upsert: true 
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: data.publicUrl })
                .eq('id', user!.id);

            if (updateError) throw updateError;

            await supabase.auth.updateUser({
                data: { avatar_url: data.publicUrl }
            });

            setAvatarUrl(data.publicUrl);

            toast({
                title: "Foto Profil Berhasil Diperbarui",
                description: "Foto profil Anda telah disinkronkan."
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Gagal Mengunggah Foto",
                description: error.message
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'HAPUS') {
            toast({
                variant: "destructive",
                title: "Konfirmasi Tidak Sesuai",
                description: 'Ketik "HAPUS" untuk mengonfirmasi penghapusan akun.'
            });
            return;
        }

        setLoading(true);
        try {
            const { error: deleteError } = await supabase.rpc('delete_user' as any);

            if (deleteError) {
                toast({
                    variant: "destructive",
                    title: "Gagal Hapus Akun",
                    description: deleteError.message || "Terjadi kesalahan saat menghapus akun."
                });
                return;
            }

            toast({
                title: "Akun Berhasil Dihapus",
                description: "Semua data akun Anda telah dihapus secara permanen."
            });

            await signOut();
            navigate('/auth');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Terjadi Kesalahan",
                description: error.message
            });
        } finally {
            setLoading(false);
            setShowSecondDeleteDialog(false);
            setDeleteConfirmText('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <div className="flex-1 container mx-auto px-4 py-8 max-w-2xl space-y-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/todos')}
                    className="gap-2 rounded-xl text-xs text-muted-foreground hover:text-foreground mb-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Dashboard</span>
                </Button>

                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Pengaturan Akun
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Kelola profil, preferensi tema, dan keamanan akun lo di sini.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Profile Information Card */}
                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base font-semibold">Info Profil Lo</CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                Update nama dan foto profil lo biar makin kece.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-5">
                                <div className="flex flex-col items-center gap-3">
                                    <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-sm">
                                        <AvatarImage src={avatarUrl} alt={fullName || 'Foto profil'} />
                                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                            {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="h-8 text-xs rounded-xl gap-1.5"
                                        >
                                            <Camera className="h-3.5 w-3.5" />
                                            <span>{uploading ? 'Mengunggah...' : avatarUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
                                    <Input id="email" value={user?.email} disabled className="h-10 text-xs sm:text-sm rounded-xl bg-muted/60" />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="fullName" className="text-xs font-medium">Nama Lengkap</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        className="h-10 text-xs sm:text-sm rounded-xl"
                                    />
                                </div>

                                <Button type="submit" disabled={loading} className="h-10 rounded-xl text-xs sm:text-sm font-semibold shadow-sm px-5">
                                    {loading ? 'Menyimpan...' : 'Simpan Profil'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Theme Selection Card */}
                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base font-semibold">Tema Tampilan</CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                Sesuaikan skema warna tampilan antarmuka CatetYuk.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="theme-select" className="text-xs font-medium">Pilihan Tema</Label>
                                <Select value={theme} onValueChange={(val) => setTheme(val)}>
                                    <SelectTrigger id="theme-select" className="h-10 text-xs sm:text-sm rounded-xl">
                                        <SelectValue placeholder="Pilih tema..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Terang (Light)</SelectItem>
                                        <SelectItem value="dark">Gelap (Dark)</SelectItem>
                                        <SelectItem value="neon-dark">Neon Cyberpunk</SelectItem>
                                        <SelectItem value="deep-ocean">Deep Ocean</SelectItem>
                                        <SelectItem value="system">Mengikuti Sistem</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security & Password Card */}
                    <Card className="rounded-2xl border border-border/80 shadow-sm bg-card">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base font-semibold">
                                    {(user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) ? 'Atur Kata Sandi' : 'Ubah Kata Sandi'}
                                </CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                Perbarui kata sandi secara berkala untuk menjaga keamanan akun.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                {!(user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="oldPassword" className="text-xs font-medium">Kata Sandi Lama</Label>
                                        <div className="relative">
                                            <Input
                                                id="oldPassword"
                                                type={showOldPassword ? "text" : "password"}
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="h-10 text-xs sm:text-sm rounded-xl pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowOldPassword(!showOldPassword)}
                                            >
                                                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor="newPassword" className="text-xs font-medium">Kata Sandi Baru</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            className="h-10 text-xs sm:text-sm rounded-xl pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="confirmPassword" className="text-xs font-medium">Konfirmasi Kata Sandi Baru</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi kata sandi baru"
                                            className="h-10 text-xs sm:text-sm rounded-xl pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="h-10 rounded-xl text-xs sm:text-sm font-semibold shadow-sm px-5">
                                    {loading ? 'Memperbarui...' : 'Simpan Kata Sandi'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Danger Zone: Delete Account */}
                    <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 text-destructive">
                                <ShieldAlert className="h-4 w-4" />
                                <CardTitle className="text-base font-semibold">Hapus Akun</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-destructive/80">
                                Tindakan ini bersifat permanen. Semua data tugas dan profil akan dihapus.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog open={showFirstDeleteDialog} onOpenChange={setShowFirstDeleteDialog}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="h-9 text-xs rounded-xl gap-1.5 font-semibold">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Hapus Akun Saya</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin ingin menghapus akun?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-xs sm:text-sm">
                                            Seluruh tugas, riwayat eksekusi, dan preferensi akun Anda akan dihapus secara permanen dari server.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-xl text-xs">Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                setShowFirstDeleteDialog(false);
                                                setShowSecondDeleteDialog(true);
                                            }}
                                            className="rounded-xl text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                                        >
                                            Lanjutkan Hapus
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            {/* Second Confirmation Dialog */}
                            <AlertDialog open={showSecondDeleteDialog} onOpenChange={setShowSecondDeleteDialog}>
                                <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Konfirmasi Terakhir</AlertDialogTitle>
                                        <AlertDialogDescription className="space-y-2 text-xs sm:text-sm">
                                            <p>Ketik kata <strong>HAPUS</strong> di bawah ini untuk mengonfirmasi penghapusan permanen:</p>
                                            <Input
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                placeholder='Ketik "HAPUS"'
                                                className="mt-2 text-xs rounded-xl"
                                            />
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setDeleteConfirmText('')} className="rounded-xl text-xs">Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            disabled={deleteConfirmText !== 'HAPUS' || loading}
                                            className="rounded-xl text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                                        >
                                            {loading ? 'Menghapus Akun...' : 'Hapus Akun Permanen'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
}
