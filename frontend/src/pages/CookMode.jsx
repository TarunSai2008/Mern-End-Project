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
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [servings, setServings] = useState(null);

  useEffect(() => {
    client.get(`/recipes/${recipeId}`).then((r) => { setRecipe(r.data); setServings(r.data.servings); }).catch((err) => setError(err.message));
  }, [recipeId]);

  async function confirmCook() {
    setBusy(true);
    try {
      const r = await client.post(`/recipes/${recipeId}/cook`, { servings });
      toast(`Cooked "${r.data.cooked}" — pantry updated (${r.data.deducted.length} items deducted${r.data.removed.length ? `, ${r.data.removed.length} finished` : ''})`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-2xl px-4 py-10"><ErrorState message={error} onRetry={() => window.location.reload()} /></main></div>;
  if (!recipe) return <div className="min-h-screen"><Navbar /><Loading label="Tying the apron…" /></div>;

  const scale = servings / recipe.servings;
  const allChecked = recipe.ingredients.every((_, i) => checked[i]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link to="/kitchen" className="text-sm text-stone-400 hover:text-sage">← Back to the kitchen</Link>
        <h1 className="mt-3 text-3xl font-bold">{recipe.title}</h1>
        <p className="text-stone-500">{recipe.minutes} min · adjust servings below</p>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm font-bold">Servings</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setServings(Math.max(1, servings - 1))} className="h-9 w-9 rounded-full border-2 border-stone-300 font-bold hover:border-sage">−</button>
            <span className="w-8 text-center text-lg font-bold">{servings}</span>
            <button onClick={() => setServings(Math.min(20, servings + 1))} className="h-9 w-9 rounded-full border-2 border-stone-300 font-bold hover:border-sage">+</button>
          </div>
          {scale !== 1 && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">quantities ×{Math.round(scale * 10) / 10}</span>}
        </div>

        <div className="mt-6 rounded-3xl border-2 border-stone-200/70 bg-white p-5">
          <h2 className="font-bold">Ingredients — tick as you go</h2>
          <div className="mt-3 space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <label key={i} className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${checked[i] ? 'border-sage bg-sage-soft' : 'border-stone-100'}`}>
                <input type="checkbox" checked={!!checked[i]} onChange={() => setChecked({ ...checked, [i]: !checked[i] })} className="h-5 w-5 accent-sage" />
                <span className={`flex-1 font-bold capitalize ${checked[i] ? 'text-sage line-through' : ''}`}>{ing.name}</span>
                <span className="text-stone-500">{Math.round(ing.quantity * scale * 100) / 100} {ing.unit}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border-2 border-stone-200/70 bg-white p-5">
          <h2 className="font-bold">Steps</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-stone-600">
            {recipe.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>

        <button onClick={confirmCook} disabled={busy || !allChecked}
          className="mt-6 w-full rounded-full bg-sage py-4 text-lg font-bold text-white disabled:opacity-40">
          {busy ? 'Updating the pantry…' : allChecked ? '✓ Cooked! Deduct from pantry' : 'Tick all ingredients to finish'}
        </button>
        <p className="mt-2 text-center text-xs text-stone-400">Cooking deducts used quantities — if anything is short, nothing changes.</p>
      </main>
    </div>
  );
}
