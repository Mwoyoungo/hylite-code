'use client';

import { useState } from 'react';
import { UserPlus, Mail, Lock, User, Loader2, GraduationCap, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/firebase/auth';
import GoogleSignInButton from './GoogleSignInButton';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name, role);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      if (message.includes('email-already-in-use')) {
        setError('An account with this email already exists');
      } else if (message.includes('weak-password')) {
        setError('Password is too weak — use at least 6 characters');
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

      {/* Role toggle */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">I am a</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex items-center justify-center gap-2 py-2.5 text-[13px] font-mono border transition-colors ${
              role === 'student'
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-bg-input border-border text-text-muted hover:text-text-primary hover:border-text-muted'
            }`}
          >
            <GraduationCap size={16} />
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('tutor')}
            className={`flex items-center justify-center gap-2 py-2.5 text-[13px] font-mono border transition-colors ${
              role === 'tutor'
                ? 'bg-teal/15 border-teal text-teal'
                : 'bg-bg-input border-border text-text-muted hover:text-text-primary hover:border-text-muted'
            }`}
          >
            <BookOpen size={16} />
            Tutor
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">Display Name</label>
        <div className="flex items-center bg-bg-input border border-border focus-within:border-accent">
          <User size={14} className="text-text-muted ml-3" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-transparent text-[13px] font-mono text-text-primary px-3 py-2 outline-none placeholder:text-text-muted"
            placeholder="Your name"
            required
          />
        </div>
      </div>

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
            placeholder="••••••••  (min 6 characters)"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-[13px] font-mono py-2 transition-colors"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] font-mono text-text-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <GoogleSignInButton />

      <p className="text-[11px] font-mono text-text-muted text-center mt-2">
        Already have an account?{' '}
        <Link href="/login" className="text-accent hover:text-accent-hover">
          Sign in
        </Link>
      </p>
    </form>
  );
}
