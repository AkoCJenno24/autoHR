import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { getOrgBySlug, OrgSlug } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Loader2,
} from 'lucide-react';

// Seed demo slug for local development
const DEMO_SLUG = 'autohr-ph';
const DEMO_ORG_NAME = 'AutoHR Philippines';

export function LoginView() {
  const { slug } = useParams<{ slug: string }>();
  const [orgData, setOrgData] = useState<OrgSlug | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgNotFound, setOrgNotFound] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const { login, isAuthenticated, hasOrg, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && hasOrg) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, hasOrg, navigate, location]);

  // Resolve org from slug
  useEffect(() => {
    if (!slug) {
      navigate('/login', { replace: true });
      return;
    }

    setOrgLoading(true);
    setOrgNotFound(false);

    // Check if it's the demo slug
    if (slug === DEMO_SLUG) {
      setOrgData({ orgId: 'org_autohr_ph', orgName: DEMO_ORG_NAME, slug: DEMO_SLUG });
      setOrgLoading(false);
      // Pre-fill demo creds for convenience
      setEmail('eleanor.santos@autohr.ph');
      setPassword('AutoHR2026!PH');
      return;
    }

    getOrgBySlug(slug).then(result => {
      if (result) {
        setOrgData(result);
      } else {
        setOrgNotFound(true);
      }
      setOrgLoading(false);
    });
  }, [slug]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password, slug);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setResetError(null);
    setResetSuccess(false);
    try {
      await resetPassword(resetEmail || email);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // ── Loading state while resolving slug ──
  if (orgLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #2D2060 0%, #0F0C1A 55%, #08060F 100%)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Org not found ──
  if (orgNotFound) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-slate-100"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #2D2060 0%, #0F0C1A 55%, #08060F 100%)' }}
      >
        <div className="max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">Company not found</h2>
          <p className="text-sm text-slate-400">
            <strong className="text-white">autohr.app/login/{slug}</strong> doesn't match any company.
            Check the URL with your HR admin.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-violet-300 hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Try a different company
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 text-slate-100 antialiased"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #2D2060 0%, #0F0C1A 55%, #08060F 100%)' }}
    >
      {/* Brand & Company Name */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div
          className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #5B4CF5 0%, #8B5CF6 100%)' }}
        >
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
            <rect x="0" y="0" width="20" height="4" rx="2" fill="white" fillOpacity="0.95"/>
            <rect x="4" y="7" width="12" height="4" rx="2" fill="white" fillOpacity="0.7"/>
            <rect x="8" y="14" width="4" height="4" rx="2" fill="white" fillOpacity="0.45"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
            {orgData?.orgName}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to your HR portal</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-sm py-7 px-5 sm:py-8 sm:px-8 rounded-2xl border border-white/10 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.ph"
              leftIcon={<Mail className="w-4 h-4" />}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setIsForgotOpen(true);
                  }}
                  className="text-xs text-violet-300 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-9 pr-10 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 p-1 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold h-11"
              isLoading={isLoading}
            >
              Sign in <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Demo accounts (only shown on demo slug) */}
          {slug === DEMO_SLUG && (
            <div className="border-t border-white/10 pt-4 space-y-2">
              <p className="text-[11px] text-slate-500 text-center">Try a demo account</p>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                {[
                  { label: 'HR Owner', name: 'Eleanor', email: 'eleanor.santos@autohr.ph', color: 'text-violet-300' },
                  { label: 'Manager', name: 'Marcus', email: 'marcus.reyes@autohr.ph', color: 'text-amber-300' },
                  { label: 'Employee', name: 'Sarah', email: 'sarah.bautista@autohr.ph', color: 'text-emerald-300' },
                ].map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword('AutoHR2026!PH');
                    }}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-center border border-white/5 hover:border-white/15 text-slate-300 transition-all"
                  >
                    <span className={`block font-semibold ${acc.color}`}>{acc.label}</span>
                    <span className="text-[10px] text-slate-500">{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              to="/login"
              className="text-xs text-slate-500 hover:text-slate-400 inline-flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Sign in to a different company
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">AutoHR · Built for the Philippines</p>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        title="Reset your password"
        description="We'll send a reset link to your email."
        maxWidth="md"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            placeholder="you@company.ph"
            leftIcon={<Mail className="w-4 h-4" />}
          />
          {resetSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Reset link sent — check your inbox.</span>
            </div>
          )}
          {resetError && (
            <div className="p-3 bg-red-50 text-danger border border-rose-200 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{resetError}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border">
            <Button type="button" variant="ghost" onClick={() => setIsForgotOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isResetting}>Send reset link</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
