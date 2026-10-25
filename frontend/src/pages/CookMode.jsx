import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, ErrorState } from '../components/states.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function CookMode() {
  const { recipeId } = useParams();
  const toast = useToast();
  const [recipe, setRecipe] = useState(null);
  const [checked, setChecked] = useState({});
  const [servings, setServings] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.get(`/recipes/${recipeId}`).then((r) => { setRecipe(r.data); setServings(r.data.servings); }).catch((err) => setError(err.message));
  }, [recipeId]);

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-2xl px-4 py-10"><ErrorState message={error} onRetry={() => window.location.reload()} /></main></div>;
  if (!recipe) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-2xl px-4 py-16"><div className="shimmer h-80" /></main></div>;

  const scale = servings / recipe.servings;
  const allChecked = recipe.ingredients.every((_, i) => checked[i]);
  const progress = Object.keys(checked).filter((k) => checked[k]).length / recipe.ingredients.length;

  async function confirmCook() {
    setBusy(true);
    try {
      const r = await client.post(`/recipes/${recipeId}/cook`, { servings });
      toast(`Cooked "${r.data.cooked}" — pantry updated (${r.data.deducted.length} deducted${r.data.removed.length ? `, ${r.data.removed.length} finished` : ''})`);
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link to="/kitchen" className="text-xs font-bold uppercase tracking-[0.3em] text-bark hover:text-basil">← back to the kitchen</Link>

        {/* hero plate */}
        <div className="card-solid relative mt-5 overflow-hidden p-7 sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-honey-soft blur-2xl" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="serif text-4xl font-bold tracking-tight">{recipe.title}</h1>
              <p className="mt-2 text-sm font-semibold text-bark">{recipe.minutes} min · tick ingredients as you go</p>
            </div>
            {/* servings stepper + progress ring */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5">
                <button onClick={() => setServings(Math.max(1, servings - 1))} aria-label="fewer servings" className="btn-ghost grid h-10 w-10 place-items-center rounded-full text-lg font-bold">−</button>
                <span className="serif w-8 text-center text-2xl font-bold">{servings}</span>
                <button onClick={() => setServings(Math.min(20, servings + 1))} aria-label="more servings" className="btn-primary grid h-10 w-10 place-items-center rounded-full text-lg font-bold">+</button>
              </div>
              <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(30,86,49,.12)" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#2e7d32" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 26} strokeDashoffset={2 * Math.PI * 26 * (1 - progress)} style={{ transition: 'stroke-dashoffset .5s cubic-bezier(.2,.7,.3,1)' }} />
              </svg>
            </div>
          </div>
          {scale !== 1 && <span className="chip mt-4 inline-block bg-honey-soft px-3 py-1 text-[#8a6110]">quantities ×{Math.round(scale * 10) / 10}</span>}
        </div>

        {/* ingredient checklist */}
        <section className="card-solid mt-6 p-6 sm:p-7">
          <h2 className="serif text-xl font-bold">Ingredients</h2>
          <div className="mt-4 space-y-2.5">
            {recipe.ingredients.map((ing, i) => (
              <label key={i} className={`flex cursor-pointer items-center gap-4 rounded-2xl border px-5 py-3.5 transition ${checked[i] ? 'border-basil/40 bg-basil/5' : 'border-basil/10 bg-white hover:border-basil/25'}`}>
                <input type="checkbox" checked={!!checked[i]} onChange={() => setChecked({ ...checked, [i]: !checked[i] })} className="h-5 w-5 accent-basil" />
                <span className={`flex-1 font-semibold capitalize transition ${checked[i] ? 'text-basil line-through' : ''}`}>{ing.name}</span>
                <span className="font-semibold text-bark">{Math.round(ing.quantity * scale * 100) / 100} {ing.unit}</span>
              </label>
            ))}
          </div>
        </section>

        {/* steps */}
        <section className="card-solid mt-6 p-6 sm:p-7">
          <h2 className="serif text-xl font-bold">Steps</h2>
          <ol className="mt-4 space-y-3">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="serif grid h-8 w-8 shrink-0 place-items-center rounded-full bg-basil text-sm font-bold text-cream">{i + 1}</span>
                <p className="pt-1 text-bark">{s}</p>
              </li>
            ))}
          </ol>
        </section>

        <button onClick={confirmCook} disabled={busy || !allChecked}
          className="btn-primary mt-7 w-full rounded-full py-5 text-lg font-bold disabled:opacity-40">
          {busy ? 'Updating the pantry…' : allChecked ? '✓ Cooked! Deduct from pantry' : 'Tick every ingredient to finish'}
        </button>
        <p className="mt-3 text-center text-xs text-bark">Cooking deducts used quantities — if anything\u2019s short, nothing changes.</p>
      </main>
    </div>
  );
}
