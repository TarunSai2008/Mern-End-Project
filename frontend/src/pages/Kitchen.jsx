import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import PantryTile from '../components/PantryTile.jsx';
import { Loading, Empty, ErrorState } from '../components/states.jsx';
import { useToast } from '../context/ToastContext.jsx';

const AISLES = ['produce', 'dairy', 'dry goods', 'spices', 'frozen', 'bakery', 'other'];

export default function Kitchen() {
  const toast = useToast();
  const navigate = useNavigate();
  const [pantry, setPantry] = useState(null);
  const [matches, setMatches] = useState(null);
  const [grocery, setGrocery] = useState(null);
  const [waste, setWaste] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('cook');
  const [plan, setPlan] = useState(null);
  const [planBusy, setPlanBusy] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'pc', aisle: 'other', expiresAt: '' });

  async function load() {
    setError('');
    try {
      const [p, m, g, w] = await Promise.all([
        client.get('/pantry'),
        client.get('/recipes/match'),
        client.get('/grocery'),
        client.get('/reports/waste'),
      ]);
      setPantry(p.data);
      setMatches(m.data);
      setGrocery(g.data);
      setWaste(w.data);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => { load(); }, []);

  function openEdit(item) {
    setEditing(item);
    setForm({
      name: item.name, quantity: item.quantity, unit: item.unit, aisle: item.aisle,
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : '',
    });
    setShowAdd(true);
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', quantity: '', unit: 'pc', aisle: 'other', expiresAt: '' });
    setShowAdd(true);
  }

  async function save(e) {
    e.preventDefault();
    const body = {
      name: form.name.trim(),
      quantity: Number(form.quantity),
      unit: form.unit,
      aisle: form.aisle,
      ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
    };
    if (body.name.length < 2) return toast('Name the ingredient', 'error');
    if (Number.isNaN(body.quantity) || body.quantity < 0) return toast('Quantity must be 0 or more', 'error');
    try {
      if (editing) await client.patch(`/pantry/${editing._id}`, body);
      else await client.post('/pantry', body);
      toast(editing ? 'Updated' : 'Added to the pantry');
      setShowAdd(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove(item) {
    try {
      await client.delete(`/pantry/${item._id}`);
      toast(`Removed ${item.name}`);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function cook(recipe) {
    navigate(`/cook/${recipe._id}`);
  }

  async function addMissing(recipe) {
    try {
      const r = await client.post(`/recipes/${recipe._id}/add-missing`, {});
      toast(r.body?.added !== undefined ? undefined : undefined);
      toast(`Added ${r.data.added} item${r.data.added === 1 ? '' : 's'} to the grocery list${r.data.skipped.length ? ` (${r.data.skipped.length} already listed)` : ''}`);
      setTab('grocery');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function makePlan() {
    setPlanBusy(true);
    try {
      const r = await client.post('/mealplan', { recipeIds: matches.filter((m) => m.cookable).slice(0, 5).map((m) => m._id) });
      setPlan(r.data);
      toast(`Plan built — ${r.data.shoppingList.length} items to buy, ${r.data.coveredFromPantry} covered by pantry`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setPlanBusy(false);
    }
  }

  async function pushPlan() {
    try {
      const r = await client.post('/mealplan/push', { items: plan.shoppingList.map((s) => ({ name: s.name, quantity: s.quantity, unit: s.unit })) });
      toast(`Added ${r.data.added} items to the grocery list${r.data.skipped ? ` (${r.data.skipped} already there)` : ''}`);
      setTab('grocery');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function toggleGrocery(item) {
    try {
      await client.patch(`/grocery/${item._id}`, { done: !item.done });
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const useFirst = pantry?.filter((i) => i.expiryStatus === 'use-first' || i.expiryStatus === 'expired') || [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {useFirst.length > 0 && (
          <div className="mb-6 rounded-3xl border-2 border-tomato/30 bg-tomato/5 p-4">
            <p className="font-bold text-tomato">⚠️ Use first: {useFirst.map((i) => i.name).join(', ')}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-full bg-white p-1 shadow-sm">
            {[['cook', '🍳 What can I cook?'], ['pantry', '🥫 Pantry'], ['grocery', '🛒 Grocery list'], ['waste', '🗑️ Waste']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${tab === key ? 'bg-sage text-white' : 'text-stone-500 hover:text-stone-700'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={openAdd} className="rounded-full bg-tomato px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">+ Add item</button>
        </div>

        {error && <div className="mt-6"><ErrorState message={error} onRetry={load} /></div>}
        {!error && pantry === null && <Loading label="Opening the fridge…" />}

        {tab === 'cook' && matches !== null && matches.length > 0 && (
          <div className="mt-4 rounded-3xl border-2 border-sage/30 bg-sage-soft/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-sage">🗓️ Weekly plan: cook the top {Math.min(5, matches.filter((m) => m.cookable).length)} ready recipes?</p>
              <button onClick={makePlan} disabled={planBusy || !matches.some((m) => m.cookable)}
                className="rounded-full bg-sage px-5 py-2 text-sm font-bold text-white disabled:opacity-40">
                {planBusy ? 'Planning…' : 'Build plan'}
              </button>
            </div>
            {plan && (
              <div className="mt-3">
                <p className="text-xs text-stone-500">{plan.shoppingList.length} to buy · {plan.coveredFromPantry} covered from pantry</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {plan.shoppingList.slice(0, 10).map((s) => (
                    <span key={s.name} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold capitalize">{s.name} ×{s.quantity}{s.unit}</span>
                  ))}
                </div>
                <button onClick={pushPlan} className="mt-3 rounded-full bg-tomato px-5 py-2 text-sm font-bold text-white">🛒 Push to grocery list</button>
              </div>
            )}
          </div>
        )}

        {tab === 'cook' && matches !== null && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((r) => (
              <div key={r._id} className="flex flex-col rounded-3xl border-2 border-stone-200/70 bg-white p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">{r.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.cookable ? 'bg-sage-soft text-sage' : 'bg-amber-100 text-amber-700'}`}>
                    {r.cookable ? 'Ready ✓' : `Missing ${r.shortfallCount}`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-400">{r.minutes} min · serves {r.servings}</p>
                {!r.cookable && (
                  <p className="mt-2 text-sm text-amber-700">
                    Missing: {r.shortfalls.slice(0, 3).map((s) => s.name).join(', ')}{r.shortfalls.length > 3 ? ` +${r.shortfalls.length - 3}` : ''}
                  </p>
                )}
                <div className="mt-auto flex gap-2 pt-4">
                  <button onClick={() => cook(r)} disabled={!r.cookable}
                    className="flex-1 rounded-full bg-sage py-2 text-sm font-bold text-white disabled:opacity-30">Cook it</button>
                  {!r.cookable && (
                    <button onClick={() => addMissing(r)} className="rounded-full border-2 border-stone-300 px-3 py-2 text-xs font-bold hover:border-sage hover:text-sage">
                      + missing to list
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'pantry' && pantry !== null && (
          pantry.length === 0 ? (
            <div className="mt-8"><Empty title="Empty shelves" hint="Add what's in your fridge and cupboards." /></div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pantry.map((item) => (
                <PantryTile key={item._id} item={item} onDelete={remove} onEdit={openEdit} />
              ))}
            </div>
          )
        )}

        {tab === 'grocery' && grocery !== null && (
          <div className="mt-8 max-w-xl space-y-2">
            {grocery.length === 0 && <Empty title="List is empty" hint='Use "+ missing to list" on any recipe.' />}
            {grocery.map((g) => (
              <label key={g._id} className="flex items-center gap-3 rounded-2xl border-2 border-stone-200/70 bg-white px-4 py-3">
                <input type="checkbox" checked={g.done} onChange={() => toggleGrocery(g)} className="h-5 w-5 accent-sage" />
                <span className={`flex-1 ${g.done ? 'text-stone-300 line-through' : 'font-bold capitalize'}`}>{g.name}</span>
                <span className="text-sm text-stone-400">{g.quantity} {g.unit}</span>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-500">{g.aisle}</span>
                <button onClick={async () => { await client.delete(`/grocery/${g._id}`); load(); }} className="text-stone-300 hover:text-tomato">✕</button>
              </label>
            ))}
          </div>
        )}

        {tab === 'waste' && waste !== null && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border-2 border-red-200 bg-white p-5">
              <p className="text-xs font-bold uppercase text-stone-400">Expired in pantry</p>
              <p className="text-3xl font-bold text-tomato">{waste.wastedCount}</p>
              <ul className="mt-2 space-y-1 text-sm text-stone-500">
                {waste.expired.map((i) => <li key={i._id}>{i.name} — {i.expiryDays * -1}d ago</li>)}
              </ul>
            </div>
            <div className="rounded-3xl border-2 border-amber-200 bg-white p-5">
              <p className="text-xs font-bold uppercase text-stone-400">Use within 3 days</p>
              <p className="text-3xl font-bold text-amber-600">{waste.expiringSoon.length}</p>
              <ul className="mt-2 space-y-1 text-sm text-stone-500">
                {waste.expiringSoon.map((i) => <li key={i._id}>{i.name} — {i.expiryDays}d left</li>)}
              </ul>
            </div>
            <div className="rounded-3xl border-2 border-sage/30 bg-white p-5">
              <p className="text-xs font-bold uppercase text-stone-400">Shelves by aisle</p>
              <ul className="mt-2 space-y-1 text-sm">
                {Object.entries(waste.byAisle).sort((a, b) => b[1] - a[1]).map(([aisle, n]) => (
                  <li key={aisle} className="flex justify-between"><span className="capitalize">{aisle}</span><span className="font-bold">{n}</span></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="w-full max-w-sm rounded-3xl bg-white p-6">
            <h2 className="text-lg font-bold">{editing ? `Edit ${editing.name}` : 'Add to pantry'}</h2>
            <label className="mt-4 block"><span className="text-sm font-bold">Ingredient</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!!editing}
                className="mt-1 w-full rounded-2xl border-2 border-stone-200 px-3 py-2 outline-none focus:border-sage disabled:bg-stone-50" /></label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <label className="col-span-2 block"><span className="text-sm font-bold">Quantity</span>
                <input type="number" min="0" step="0.1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="mt-1 w-full rounded-2xl border-2 border-stone-200 px-3 py-2 outline-none focus:border-sage" /></label>
              <label className="block"><span className="text-sm font-bold">Unit</span>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="mt-1 w-full rounded-2xl border-2 border-stone-200 bg-white px-2 py-2 outline-none focus:border-sage">
                  {['pc', 'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'bunch', 'pack'].map((u) => <option key={u}>{u}</option>)}
                </select></label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="block"><span className="text-sm font-bold">Aisle</span>
                <select value={form.aisle} onChange={(e) => setForm({ ...form, aisle: e.target.value })}
                  className="mt-1 w-full rounded-2xl border-2 border-stone-200 bg-white px-2 py-2 outline-none focus:border-sage">
                  {AISLES.map((a) => <option key={a}>{a}</option>)}
                </select></label>
              <label className="block"><span className="text-sm font-bold">Expiry (optional)</span>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="mt-1 w-full rounded-2xl border-2 border-stone-200 px-2 py-2 outline-none focus:border-sage" /></label>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-2xl border-2 border-stone-200 py-2.5 font-bold text-stone-600">Cancel</button>
              <button className="flex-1 rounded-2xl bg-tomato py-2.5 font-bold text-white">{editing ? 'Save' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
