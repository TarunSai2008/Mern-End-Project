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
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Open your kitchen</h1>
          <p className="text-sm text-stone-500">Track shelves, cook more, waste less</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border-2 border-stone-200/70 bg-white p-6">
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-tomato">{error}</p>}
          <label className="block"><span className="text-sm font-bold">Name</span>
            <input value={form.name} onChange={set('name')} className="mt-1 w-full rounded-2xl border-2 border-stone-200 px-3 py-2.5 outline-none focus:border-sage" /></label>
          <label className="block"><span className="text-sm font-bold">Email</span>
            <input type="email" value={form.email} onChange={set('email')} className="mt-1 w-full rounded-2xl border-2 border-stone-200 px-3 py-2.5 outline-none focus:border-sage" /></label>
          <label className="block"><span className="text-sm font-bold">Password</span>
            <input type="password" value={form.password} onChange={set('password')} className="mt-1 w-full rounded-2xl border-2 border-stone-200 px-3 py-2.5 outline-none focus:border-sage" /></label>
          <button disabled={busy} className="w-full rounded-2xl bg-tomato py-2.5 font-bold text-white disabled:opacity-60">{busy ? 'Stocking…' : 'Create account'}</button>
          <p className="text-center text-sm text-stone-500">Have one? <Link to="/login" className="font-bold text-tomato hover:underline">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
