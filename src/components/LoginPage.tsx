import { useState } from 'react';
import { Activity, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { loginWithEmail, loginWithGoogle, loginWithGithub } from '../firebase/auth';
import { toast } from 'sonner@2.0.3';
import { FirebaseErrorAlert } from './FirebaseErrorAlert';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: () => void;
}

export default function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFirebaseError(null);
    
    try {
      await loginWithEmail(email, password);
      toast.success('Connexion réussie !');
      onLogin();
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la connexion';
      setFirebaseError(errorMessage);
      
      // Si c'est une erreur de credentials invalides, suggérer de créer un compte
      if (error.message.includes('incorrect') || error.message.includes('credential')) {
        toast.error(errorMessage, {
          duration: 5000,
          action: {
            label: 'Créer un compte',
            onClick: () => onNavigate('register')
          }
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setFirebaseError(null);
    try {
      await loginWithGoogle();
      toast.success('Connexion avec Google réussie !');
      onLogin();
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la connexion avec Google';
      setFirebaseError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setFirebaseError(null);
    try {
      await loginWithGithub();
      toast.success('Connexion avec GitHub réussie !');
      onLogin();
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de la connexion avec GitHub';
      setFirebaseError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#22C55E]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#00D1FF]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-[#151923] rounded-2xl border border-white/5 p-8 md:p-10 shadow-2xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-2xl">BodyGoal</span>
            </div>
            <h1 className="mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to continue your fitness journey</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Firebase Error Alert */}
            {firebaseError && (
              <FirebaseErrorAlert 
                error={firebaseError} 
                onDismiss={() => setFirebaseError(null)} 
              />
            )}
            
            {/* Helper Message - First Time Users */}
            <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/20 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00D1FF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#00D1FF] text-xs">💡</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p className="mb-1">
                    <span className="text-[#00D1FF]">First time here?</span> You need to create an account first.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="text-[#22C55E] hover:underline text-sm"
                  >
                    Create your free account →
                  </button>
                </div>
              </div>
            </div>
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 bg-[#0B0B0F] border-white/10 focus:border-[#22C55E] h-12"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 bg-[#0B0B0F] border-white/10 focus:border-[#22C55E] h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="border-white/20 data-[state=checked]:bg-[#22C55E] data-[state=checked]:border-[#22C55E]"
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-[#00D1FF] hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Sign In'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#151923] text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-12 bg-[#0B0B0F] border-white/10 hover:border-white/20 hover:bg-[#0B0B0F]"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 bg-[#0B0B0F] border-white/10 hover:border-white/20 hover:bg-[#0B0B0F]"
                onClick={handleGithubLogin}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => onNavigate('register')}
                className="text-[#22C55E] hover:underline"
              >
                Sign up for free
              </button>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By signing in, you agree to our{' '}
          <a href="#" className="text-gray-400 hover:text-white">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="text-gray-400 hover:text-white">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}