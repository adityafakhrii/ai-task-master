import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { Eye, EyeOff, ArrowLeft, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import Footer from '@/components/Footer';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(6, 'Password minimal 6 karakter.')
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter.').max(100, 'Nama maksimal 100 karakter.'),
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter.')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok.",
  path: ["confirmPassword"]
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/todos');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (!error) navigate('/todos');
      } else {
        const result = signupSchema.safeParse({ email, password, fullName, confirmPassword });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (!error) navigate('/todos');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-background via-background to-secondary/30 p-4 sm:p-6 relative">
      {/* Top Back Nav */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="gap-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Button>
      </div>

      {/* Main Form Container */}
      <div className="flex-1 flex items-center justify-center my-6">
        <Card className="w-full max-w-md shadow-xl border-border/80 rounded-2xl bg-card">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="flex justify-center mb-1">
              <img src="/CatetYuk3.png" alt="CatetYuk Logo" className="h-16 w-16 rounded-2xl shadow-sm" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              CatetYuk
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Atur tugas lo dibantu AI, biar makin sat-set dan produktif!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Tabs
              value={isLogin ? 'login' : 'signup'}
              onValueChange={(v) => {
                setIsLogin(v === 'login');
                setErrors({});
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-5 h-10 p-1 bg-muted/60 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg text-xs font-semibold">
                  Masuk Skuy
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg text-xs font-semibold">
                  Daftar Akun
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="login" className="space-y-3.5 mt-0">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-xs sm:text-sm rounded-xl"
                      required
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-medium">Kata Sandi</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 text-xs sm:text-sm rounded-xl pr-10"
                        autoComplete="off"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-3.5 mt-0">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-medium">Nama Lengkap</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nama lengkap Anda"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10 text-xs sm:text-sm rounded-xl"
                      required
                    />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-xs sm:text-sm rounded-xl"
                      required
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs font-medium">Kata Sandi</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 text-xs sm:text-sm rounded-xl pr-10"
                        autoComplete="off"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-xs font-medium">Konfirmasi Kata Sandi</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Ulangi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10 text-xs sm:text-sm rounded-xl"
                      required
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                </TabsContent>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl text-xs sm:text-sm font-semibold shadow-sm mt-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isLogin ? (
                    'Gas Masuk Sekarang'
                  ) : (
                    'Daftar Sekarang Skuy'
                  )}
                </Button>
              </form>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">atau</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-11 rounded-xl text-xs sm:text-sm font-medium gap-2.5 border-border hover:bg-muted/50 transition-colors"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>Lanjut pake Akun Google</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
