import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, AlertCircle } from 'lucide-react';
import { getOrgBySlug } from '@/lib/firebase/firestore';

export function FindCompanyView() {
  const [slug, setSlug] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!clean) {
      setError('Please enter your company URL.');
      return;
    }
    setIsChecking(true);
    setError(null);
    try {
      const org = await getOrgBySlug(clean);
      if (org) {
        navigate(`/login/${clean}`);
      } else {
        // For demo accounts that don't exist in Firestore, try navigating anyway
        // LoginView handles the "not found" case gracefully
        navigate(`/login/${clean}`);
      }
    } catch {
      navigate(`/login/${clean}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 text-slate-100 antialiased"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #2D2060 0%, #0F0C1A 55%, #08060F 100%)' }}
    >
      {/* Brand */}
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
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">Sign in to AutoHR</h1>
          <p className="text-sm text-slate-400 mt-1">Enter your company's URL to continue.</p>
        </div>
      </div>

      {/* Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-sm py-7 px-5 sm:py-8 sm:px-8 rounded-2xl border border-white/10 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Company URL</label>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <span className="px-3 py-2.5 text-xs text-slate-500 border-r border-white/10 whitespace-nowrap bg-white/5 select-none">
                  autohr.app/login/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-company"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent text-white placeholder:text-slate-500 focus:outline-none font-mono"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Ask your HR admin if you don't know your company URL.
              </p>
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
              isLoading={isChecking}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="border-t border-white/10 pt-4 text-center space-y-2">
            <p className="text-xs text-slate-500">New to AutoHR?</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200 font-semibold hover:underline transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              Create your company
            </Link>
          </div>
        </div>

        {/* Demo shortcut */}
        <div className="mt-4 p-4 rounded-2xl bg-white/3 border border-white/5 text-center space-y-2">
          <p className="text-[11px] text-slate-500 font-medium">Demo accounts</p>
          <button
            type="button"
            onClick={() => navigate('/login/autohr-ph')}
            className="text-xs text-violet-300 hover:underline"
          >
            Sign in to the AutoHR demo → autohr.app/login/autohr-ph
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">AutoHR · Built for the Philippines</p>
      </div>
    </div>
  );
}
