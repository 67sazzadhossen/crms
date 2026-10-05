'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../redux/hook';
import { setCredentials } from '../../redux/features/auth/authSlice';
import { login } from '../../redux/features/auth/authApi';
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const data = await login({ identifier, password });
      dispatch(setCredentials({ user: data.user, token: data.accessToken }));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }
  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="brand-mark">CR</div>
        <p className="eyebrow">Workspace management</p>
        <h1>
          Make every meeting
          <br />
          count.
        </h1>
        <p className="hero-copy">
          Reserve the right room, keep your team moving, and track every hour with confidence.
        </p>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to CRMS</h2>
          <p className="muted">Use your company email or phone number to continue.</p>
          <form onSubmit={submit}>
            <label>
              Email or phone
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button type="submit">
              Continue <span>→</span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
