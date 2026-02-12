'use client';

import { useState } from 'react';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/firebase/auth';
import GoogleSignInButton from './GoogleSignInButton';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      if (message.includes('invalid-credential') || message.includes('wrong-password')) {
        setError('Invalid email or password');
      } else if (message.includes('user-not-found')) {
        setError('No account found with this email');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[360px]">
      {error && (
        <div className="px-3 py-2 bg-error/10 border border-error/20 text-error text-[12px] font-mono rounded-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Email</label>
        <div className="flex items-center bg-bg-input border border-border focus-within:border-accent">
          <Mail size={14} className="text-text-muted ml-3" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent text-[13px] font-mono text-text-primary px-3 py-2 outline-none placeholder:text-text-muted"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Password</label>
        <div className="flex items-center bg-bg-input border border-border focus-within:border-accent">
          <Lock size={14} className="text-text-muted ml-3" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent text-[13px] font-mono text-text-primary px-3 py-2 outline-none placeholder:text-text-muted"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-[13px] font-mono py-2 transition-colors"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] font-mono text-text-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <GoogleSignInButton />

      <p className="text-[11px] font-mono text-text-muted text-center mt-2">
        No account?{' '}
        <Link href="/signup" className="text-accent hover:text-accent-hover">
          Sign up
        </Link>
      </p>
    </form>
  );
}
