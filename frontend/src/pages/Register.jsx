import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    if (form.name.trim().length < 2) return 'Enter your name (2+ characters).';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      return 'Password needs 8+ characters with a letter and a number.';
    return '';
  }

  async function submit(e) {
    e.preventDefault();
    const v = validate();
    setError(v);
    if (v) return;
    setBusy(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast('Kitchen stocked with 20 recipes to start!');
      navigate('/kitchen');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <span className="pointer-events-none absolute right-[8%] top-24 float-3d select-none text-5xl opacity-60">🥕</span>
      <span className="pointer-events-none absolute bottom-24 left-[8%] float-3d select-none text-4xl opacity-60" style={{ animationDelay: '-2s' }}>🧄</span>

      <div className="card tilt-card relative w-full max-w-md p-8 sm:p-10">
        <div className="text-center">
          <h1 className="serif text-3xl font-bold">Open your kitchen</h1>
          <p className="mt-1.5 text-sm text-bark">Track shelves · cook more · waste less</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {error && <p className="rounded-xl bg-tomato-soft px-4 py-2.5 text-sm font-semibold text-tomato" role="alert">{error}</p>}
          {[['Name', 'name', 'name'], ['Email', 'email', 'email'], ['Password', 'password', 'new-password']].map(([label, key, ac]) => (
            <label key={key} className="block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-bark">{label}</span>
              <input type={key === 'email' ? 'email' : key === 'password' ? 'password' : 'text'} value={form[key]} onChange={set(key)} autoComplete={ac}
                className="mt-1.5 w-full rounded-xl border border-basil/20 bg-white px-4 py-3 outline-none transition focus:border-basil focus:ring-2 focus:ring-basil/15" />
            </label>
          ))}
          <button disabled={busy} className="btn-primary w-full rounded-xl py-3.5 text-base font-bold disabled:opacity-70">{busy ? 'Stocking…' : 'Create account'}</button>
          <p className="text-center text-sm text-bark">Have one? <Link to="/login" className="font-bold text-basil hover:underline">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
