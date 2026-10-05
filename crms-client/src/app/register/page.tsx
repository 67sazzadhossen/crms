'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../redux/api/baseApi';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }
  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="brand-mark">CR</div>
        <p className="eyebrow">Workspace management</p>
        <h1>
          Start managing
          <br />
          smarter.
        </h1>
        <p className="hero-copy">Create your workspace account and make every meeting count.</p>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <p className="eyebrow">Get started</p>
          <h2>Create account</h2>
          <p className="muted">Set up your company workspace.</p>
          <form onSubmit={submit}>
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Company
              <input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                required
              />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button type="submit">
              Create account <span>→</span>
            </button>
          </form>
          <p className="muted">
            Already registered? <a href="/login">Sign in</a>
          </p>
        </div>
      </section>
    </main>
  );
}
