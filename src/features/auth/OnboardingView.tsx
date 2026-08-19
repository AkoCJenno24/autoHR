import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { isSlugAvailable } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Building2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/** Auto-generate a URL-safe slug from a company name */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 40);
}

export function OnboardingView() {
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createCompany, firebaseUser, hasOrg } = useAuth();
  const navigate = useNavigate();

  // If user already has an org, send them to dashboard
  useEffect(() => {
    if (hasOrg) navigate('/dashboard', { replace: true });
  }, [hasOrg, navigate]);

  // Auto-generate slug from company name
  useEffect(() => {
    if (!slugEdited && companyName) {
      setSlug(nameToSlug(companyName));
    }
  }, [companyName, slugEdited]);

  // Debounced slug availability check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const available = await isSlugAvailable(slug);
        setSlugStatus(available ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Please enter your company name.');
      return;
    }
    if (slug.length < 3) {
      setError('Company URL must be at least 3 characters.');
      return;
    }
    if (slugStatus === 'taken') {
      setError('That company URL is already taken. Please choose another.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await createCompany({ companyName, slug });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
            Set up your company
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Hi {firebaseUser?.displayName?.split(' ')[0] || 'there'} — just one more step.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-sm py-7 px-5 sm:py-8 sm:px-8 rounded-2xl border border-white/10 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Company name"
              type="text"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g. Ayala Tech Corp"
              leftIcon={<Building2 className="w-4 h-4" />}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />

            {/* Slug field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Company URL
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <span className="px-3 py-2.5 text-xs text-slate-500 border-r border-white/10 whitespace-nowrap bg-white/5 select-none">
                  autohr.app/login/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  placeholder="ayala-tech"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent text-white placeholder:text-slate-500 focus:outline-none font-mono"
                />
                <div className="px-3">
                  {slugStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  {slugStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-success" />}
                  {slugStatus === 'taken' && <AlertCircle className="w-4 h-4 text-danger" />}
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {slugStatus === 'available' && (
                  <span className="text-success">✓ Available — your employees will sign in at this URL</span>
                )}
                {slugStatus === 'taken' && (
                  <span className="text-danger">This URL is already taken. Try a different one.</span>
                )}
                {(slugStatus === 'idle' || slugStatus === 'checking') && slug.length >= 3 && (
                  <span>Your employees will log in at autohr.app/login/{slug || '…'}</span>
                )}
                {slug.length < 3 && (
                  <span>Choose a short, memorable URL for your company's login page.</span>
                )}
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
              isLoading={isLoading}
              disabled={slugStatus === 'taken' || slugStatus === 'checking'}
            >
              Create company & go to dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">AutoHR · Built for the Philippines</p>
      </div>
    </div>
  );
}
