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
      toast('Kitchen’s open!');
      navigate('/kitchen');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <span className="pointer-events-none absolute left-[10%] top-24 float-3d select-none text-5xl opacity-60">🍅</span>
      <span className="pointer-events-none absolute bottom-24 right-[12%] float-3d select-none text-4xl opacity-60" style={{ animationDelay: '-3s' }}>🥬</span>

      <div className="card tilt-card relative w-full max-w-md p-8 sm:p-10">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-basil-bright to-basil text-2xl shadow-[0_14px_28px_-10px_rgba(30,86,49,.55),inset_0_1px_0_rgba(255,255,255,.3)]">🥘</span>
          <h1 className="serif mt-5 text-3xl font-bold">Welcome back</h1>
          <p className="mt-1.5 text-sm text-bark">What’s cooking tonight?</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {error && <p className="rounded-xl bg-tomato-soft px-4 py-2.5 text-sm font-semibold text-tomato" role="alert">{error}</p>}
          {[['Email', 'email', 'email', form.email, (v) => setForm({ ...form, email: v })],
            ['Password', 'password', 'current-password', form.password, (v) => setForm({ ...form, password: v })]].map(([label, type, ac, val, set]) => (
            <label key={label} className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-bark">{label}</span>
              <input type={type} value={val} onChange={(e) => set(e.target.value)} autoComplete={ac}
                className="mt-1.5 w-full rounded-xl border border-basil/20 bg-white px-4 py-3 outline-none transition focus:border-basil focus:ring-2 focus:ring-basil/15" />
            </label>
          ))}
          <button disabled={busy} className="btn-primary w-full rounded-xl py-3.5 text-base font-bold disabled:opacity-70">{busy ? 'Opening…' : 'Log in'}</button>
          <p className="text-center text-sm text-bark">New kitchen? <Link to="/register" className="font-bold text-basil hover:underline">Stock it</Link></p>
        </form>
        <p className="mt-6 rounded-xl border border-dashed border-basil/20 bg-white/60 px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-bark">
          DEMO · arav@demo.com · Demo@1234
        </p>
      </div>
    </div>
  );
}
