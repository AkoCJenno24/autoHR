import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Lock, Eye, EyeOff, AlertCircle, User } from 'lucide-react';

export function RegisterView() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await register({ fullName, email, password });
      navigate('/onboarding', { replace: true });
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
            Create your account
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            You'll set up your company on the next step.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-sm py-7 px-5 sm:py-8 sm:px-8 rounded-2xl border border-white/10 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Juan dela Cruz"
              leftIcon={<User className="w-4 h-4" />}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />

            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="juan@company.ph"
              leftIcon={<Mail className="w-4 h-4" />}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-300 hover:underline">
              Find your company
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">AutoHR · Built for the Philippines</p>
      </div>
    </div>
  );
}
