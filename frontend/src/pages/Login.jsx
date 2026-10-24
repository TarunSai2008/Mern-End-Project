import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      await login(form.email, form.password);
      toast("Kitchen's open!");
      navigate('/kitchen');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-tomato text-xl text-white">🥘</span>
          <h1 className="mt-3 text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-stone-500">What's cooking tonight?</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border-2 border-stone-200/70 bg-white p-6">
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-tomato">{error}</p>}
          <label className="block"><span className="text-sm font-bold">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email"
              className="mt-1 w-full rounded-2xl border-2 border-stone-200 px-3 py-2.5 outline-none focus:border-sage" /></label>
          <label className="block"><span className="text-sm font-bold">Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password"
              className="mt-1 w-full rounded-2xl border-2 border-stone-200 px-3 py-2.5 outline-none focus:border-sage" /></label>
          <button disabled={busy} className="w-full rounded-2xl bg-tomato py-2.5 font-bold text-white hover:bg-red-700 disabled:opacity-60">{busy ? 'Checking…' : 'Log in'}</button>
          <p className="text-center text-sm text-stone-500">New kitchen? <Link to="/register" className="font-bold text-tomato hover:underline">Stock it</Link></p>
        </form>
        <p className="mt-4 text-center text-xs text-stone-400">Demo: arav@demo.com · Demo@1234</p>
      </div>
    </div>
  );
}
