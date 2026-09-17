import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import Button from '../components/Button';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, loginAsDemo, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user, error: err } = await signIn(email, password);
    setLoading(false);

    if (err) {
      setError(err.message || 'Failed to authenticate. Check email and password.');
    } else if (user) {
      navigate('/admin');
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-md group-hover:bg-brand-secondary transition-colors">
            <GraduationCap className="w-7 h-7 text-brand-accent" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight">
          MAX ADMIN
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-brand-muted">
          Institutional Administration & Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-premium border border-brand-border">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3 text-xs sm:text-sm text-red-800 font-bold animate-fade-in shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-extrabold text-red-900 text-sm">Access Restricted</span>
                <span className="font-semibold text-red-700">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wide mb-1.5">
                Admin Username / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin@2006"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wide mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin@2006"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full shadow-md"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          {/* Fill Official Credentials Button */}
          <div className="mt-8 pt-6 border-t border-brand-border/70 text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={ShieldCheck}
              onClick={() => {
                setEmail('Admin@2006');
                setPassword('Admin@2006');
              }}
              className="w-full bg-blue-50/50 hover:bg-blue-100/50 text-brand-primary border-blue-200 text-xs"
            >
              Fill Official Admin Credentials (Admin@2006)
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-brand-secondary hover:text-brand-primary font-semibold">
              ← Return to Public Website
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
