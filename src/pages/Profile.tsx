import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Lock, Camera, AlertTriangle, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export default function Profile() {
    const { user, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
            setAvatarUrl(data.avatar_url || user.user_metadata.avatar_url || '');
        } else {
            setAvatarUrl(user.user_metadata.avatar_url || '');
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
                title: "Profil Udah Keupdate",
                description: "Data diri lo udah aman tersimpan."
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Waduh Error",
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
                title: "Waduh Error",
                description: "Password gak sama, coba fokus dikit."
            });
            return;
        }

        setLoading(true);
        try {
            // For non-Google users, verify old password first
            if (!isGoogleAuth) {
                if (!oldPassword) {
                    throw new Error("Password lama wajib diisi ya!");
                }

                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: user?.email || '',
                    password: oldPassword
                });

                if (signInError) {
                    throw new Error("Password lama salah. Cobainget-inget lagi.");
                }
            }

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast({
                title: isGoogleAuth ? "Password Berhasil Dibuat" : "Password Udah Ganti",
                description: "Password baru lo udah aktif dan aman."
            });
            setPassword('');
            setConfirmPassword('');
            setOldPassword('');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Gagal Update Password",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    // Generate crypto-secure random filename for better security
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
            const fileExt = file.name.split('.').pop();
            // Use crypto-secure random instead of Math.random()
            const filePath = `${user!.id}/${generateSecureFileName()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: data.publicUrl })
                .eq('id', user!.id);

            if (updateError) throw updateError;

            setAvatarUrl(data.publicUrl);

            toast({
                title: "Foto Profil Udah Keupdate",
                description: "Foto baru lo kece banget!"
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Waduh Gagal Upload",
                description: error.message
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'HAPUS AKUN SAYA') {
            toast({
                variant: "destructive",
                title: "Konfirmasi Salah",
                description: "Ketik 'HAPUS AKUN SAYA' dengan benar buat konfirmasi."
            });
            return;
        }

        try {
            setLoading(true);

            // Clean up avatar files from storage before deleting account
            try {
                const { data: files } = await supabase.storage
                    .from('avatars')
                    .list(user!.id);

                if (files && files.length > 0) {
                    const filePaths = files.map(file => `${user!.id}/${file.name}`);
                    await supabase.storage.from('avatars').remove(filePaths);
                }
            } catch (storageError) {
                // Continue with deletion even if storage cleanup fails
                console.error('Storage cleanup failed:', storageError);
            }

            // Delete user account (this also deletes profile and todos via the improved function)
            const { error: deleteError } = await supabase.rpc('delete_user' as any);

            if (deleteError) {
                toast({
                    variant: "destructive",
                    title: "Gagal Hapus Akun",
                    description: deleteError.message || "Terjadi kesalahan saat menghapus akun. Coba lagi ya!"
                });
                return;
            }

            toast({
                title: "Akun Berhasil Dihapus",
                description: "Sampai jumpa lagi, semoga sukses selalu!"
            });

            await signOut();
            navigate('/auth');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Waduh Error",
                description: error.message
            });
        } finally {
            setLoading(false);
            setShowSecondDeleteDialog(false);
            setDeleteConfirmText('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/20 p-4">
            <div className="flex-1 container mx-auto max-w-2xl pt-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/todos')}
                    className="mb-6"
                    aria-label="Kembali ke halaman tugas"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                    Balik ke List Tugas
                </Button>

                <h1 className="text-3xl font-bold mb-8">Pengaturan Akun</h1>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" aria-hidden="true" />
                                <CardTitle>Info Profil Lo</CardTitle>
                            </div>
                            <CardDescription>Update data diri lo di sini, biar makin kece.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="flex flex-col items-center gap-4">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={avatarUrl} alt={fullName || 'Foto profil'} />
                                        <AvatarFallback className="text-2xl">
                                            {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            aria-label="Upload foto profil"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            aria-label="Ubah foto profil"
                                        >
                                            <Camera className="h-4 w-4 mr-2" aria-hidden="true" />
                                            {uploading ? 'Lagi diupload...' : avatarUrl ? 'Ganti Foto' : 'Upload Foto'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Lo</Label>
                                    <Input id="email" value={user?.email} disabled className="bg-muted" aria-label="Email akun (tidak bisa diubah)" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nama Lengkap</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Isi nama lengkap lo"
                                        aria-label="Nama lengkap"
                                    />
                                </div>
                                <Button type="submit" loading={loading} aria-label="Simpan perubahan profil">
                                    {loading ? 'Lagi diupdate...' : 'Update Profil'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
                                <CardTitle>{(user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) ? 'Atur Password Login' : 'Ganti Password'}</CardTitle>
                            </div>
                            <CardDescription>
                                {(user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google'))
                                    ? 'Tambahin password biar bisa login pake email juga.'
                                    : 'Ganti password secara berkala biar akun lo tetep aman.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                {!(user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) && (
                                    <div className="space-y-2">
                                        <Label htmlFor="oldPassword">Password Lama</Label>
                                        <Input
                                            id="oldPassword"
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="Masukin password lama dulu"
                                            required
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Isi password baru (min. 6 karakter)"
                                        aria-label="Password baru"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Ulangi password baru"
                                        aria-label="Konfirmasi password baru"
                                    />
                                </div>
                                <Button type="submit" loading={loading} disabled={!password || (!oldPassword && !(user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')))}>
                                    {loading ? 'Lagi proses...' : (user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) ? 'Buat Password Baru' : 'Ganti Password Sekarang'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
                                <CardTitle className="text-destructive">Zona Bahaya</CardTitle>
                            </div>
                            <CardDescription>
                                Aksi di sini bersifat permanen dan gak bisa dibatalin. Mikir mateng-mateng ya!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog open={showFirstDeleteDialog} onOpenChange={setShowFirstDeleteDialog}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        aria-label="Hapus akun permanen"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                                        Hapus Akun Permanen
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Yakin Mau Hapus Akun?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Ini keputusan besar nih! Semua data lo bakal hilang selamanya, termasuk:
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Semua tugas yang udah lo bikin</li>
                                                <li>Riwayat aktivitas lo</li>
                                                <li>Foto profil dan pengaturan</li>
                                            </ul>
                                            <p className="mt-4 font-semibold">Aksi ini GAK BISA dibatalin!</p>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Gak Jadi Deh</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                setShowFirstDeleteDialog(false);
                                                setShowSecondDeleteDialog(true);
                                            }}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            Lanjut, Aku Yakin
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog open={showSecondDeleteDialog} onOpenChange={setShowSecondDeleteDialog}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Konfirmasi Terakhir!</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            <p className="mb-4">
                                                Ketik <strong className="text-destructive">HAPUS AKUN SAYA</strong> di bawah untuk konfirmasi penghapusan akun.
                                            </p>
                                            <Input
                                                value={deleteConfirmText}
                                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                                placeholder="Ketik: HAPUS AKUN SAYA"
                                                className="mb-4"
                                                aria-label="Ketik HAPUS AKUN SAYA untuk konfirmasi"
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Ini beneran terakhir lho, setelah ini gak ada jalan balik!
                                            </p>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                                            Batalin Aja
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            disabled={deleteConfirmText !== 'HAPUS AKUN SAYA' || loading}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {loading ? 'Lagi Proses...' : 'Hapus Akun Selamanya'}
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
