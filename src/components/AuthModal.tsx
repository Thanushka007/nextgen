import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { registerAccount, loginAccount, switchDemoAccount } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name or nickname.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please provide a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const response = await registerAccount(name.trim(), email.trim(), password);
        setSuccessMessage('🎉 Account created successfully starting with 0-day streak! Welcome aboard.');
        
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#f97316', '#10b981', '#3b82f6'],
        });

        setTimeout(() => {
          onAuthSuccess(response.user);
          onClose();
        }, 1200);

      } else {
        // Login mode
        if (!email.trim()) {
          throw new Error('Please enter your email.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }

        const response = await loginAccount(email.trim(), password);
        setSuccessMessage(`Welcome back, ${response.user.name}!`);

        setTimeout(() => {
          onAuthSuccess(response.user);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await switchDemoAccount();
      setSuccessMessage('Switched to Demo Explorer account (Alex Morgan)');
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to switch to demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-orange-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Brand Icon & Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 text-white shadow-md mb-3">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {mode === 'signup' ? 'Create Your Radar Account' : 'Sign In to Your Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {mode === 'signup' 
                ? 'Join thousands of builders discovering internships, hackathons & tracking streaks.'
                : 'Welcome back! Enter your email and password to resume your daily streak.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Create Account</span>
              <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.2 rounded-full">
                0d Streak
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Sign In</span>
            </button>
          </div>

          {/* New Account 0-Streak Callout Banner (when creating account) */}
          {mode === 'signup' && (
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-200/80 flex items-start gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                0🔥
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-orange-950 flex items-center gap-1">
                  Fresh Start: 0-Day Streak Initialized
                </div>
                <p className="text-[11px] text-orange-800 leading-snug mt-0.5">
                  Your new account begins with a clean <strong className="font-semibold text-orange-900">0-day streak</strong>, ready for you to check in daily and build momentum from day one!
                </p>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Chen or Arjun Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="builder@university.edu"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {mode === 'signup' && (
                  <span className="text-[10px] text-slate-400">Min 6 characters</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'signup' ? (
                <>
                  <span>Create Account & Start 0-Streak</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">Or Quick Access</span>
            </div>
          </div>

          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={isLoading}
            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                AM
              </div>
              <div className="text-left">
                <span className="font-semibold block text-slate-800 text-xs">Explore with Demo Profile</span>
                <span className="text-[10px] text-slate-500">Alex Morgan (37d active streak)</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
              Load &rarr;
            </span>
          </button>

          {/* Footer note */}
          <div className="mt-4 text-center">
            {mode === 'signup' ? (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Need a new account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Create account (0d streak)
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
