import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, Empty, ErrorState } from '../components/states.jsx';
import { useToast } from '../context/ToastContext.jsx';

const AISLES = ['produce', 'dairy', 'dry goods', 'spices', 'frozen', 'bakery', 'other'];
const AISLE_DOT = { produce: 'bg-basil-bright', dairy: 'bg-sky-500', 'dry goods': 'bg-honey', spices: 'bg-orange-500', frozen: 'bg-cyan-500', bakery: 'bg-amber-600', other: 'bg-stone-400' };
const EXPIRY_TONE = { expired: 'bg-tomato text-white', 'use-first': 'bg-honey text-white', ok: 'bg-basil/10 text-basil' };
const TYPICAL = { g: 1000, ml: 1000, kg: 5, l: 5, pc: 10, bunch: 3, pack: 3, tbsp: 10, tsp: 10, cup: 5 };

const TABS = [
  ['cook', '🍳 Cook'],
  ['pantry', '🫙 Pantry'],
  ['grocery', '🛒 Grocery'],
  ['waste', '🌱 Waste'],
];

export default function Kitchen() {
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('cook');
  const tabRefs = useRef([]);
  const [thumb, setThumb] = useState({ left: 0, width: 0 });

  const [pantry, setPantry] = useState(null);
  const [matches, setMatches] = useState(null);
  const [grocery, setGrocery] = useState(null);
  const [waste, setWaste] = useState(null);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'pc', aisle: 'other', expiresAt: '' });
  const [plan, setPlan] = useState(null);
  const [planBusy, setPlanBusy] = useState(false);

  useEffect(() => {
    tabRefs.current.forEach((el) => { if (el?.dataset.tab === tab && el) setThumb({ left: el.offsetLeft, width: el.offsetWidth }); });
  }, [tab]);

  async function load() {
    setError('');
    try {
      const [p, m, g, w] = await Promise.all([
        client.get('/pantry'), client.get('/recipes/match'),
        client.get('/grocery'), client.get('/reports/waste'),
      ]);
      setPantry(p.data); setMatches(m.data); setGrocery(g.data); setWaste(w.data);
    } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name, quantity: item.quantity, unit: item.unit, aisle: item.aisle, expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : '' });
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
      name: form.name.trim(), quantity: Number(form.quantity), unit: form.unit, aisle: form.aisle,
      ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
    };
    if (body.name.length < 2) return toast('Name the ingredient', 'error');
    if (Number.isNaN(body.quantity) || body.quantity < 0) return toast('Quantity must be 0 or more', 'error');
    try {
      if (editing) await client.patch(`/pantry/${editing._id}`, body);
      else await client.post('/pantry', body);
      toast(editing ? 'Shelf updated' : 'Added to the pantry');
      setShowAdd(false);
      load();
    } catch (err) { toast(err.message, 'error'); }
  }

  async function remove(item) {
    try { await client.delete(`/pantry/${item._id}`); toast(`Removed ${item.name}`); load(); }
    catch (err) { toast(err.message, 'error'); }
  }

  async function makePlan() {
    setPlanBusy(true);
    try {
      const r = await client.post('/mealplan', { recipeIds: matches.filter((m) => m.cookable).slice(0, 5).map((m) => m._id) });
      setPlan(r.data);
      toast(`Plan built — ${r.data.shoppingList.length} to buy · ${r.data.coveredFromPantry} covered`);
    } catch (err) { toast(err.message, 'error'); } finally { setPlanBusy(false); }
  }

  async function pushPlan() {
    try {
      const r = await client.post('/mealplan/push', { items: plan.shoppingList.map((s) => ({ name: s.name, quantity: s.quantity, unit: s.unit })) });
      toast(`Added ${r.data.added} items to the grocery list`);
      setTab('grocery'); load();
    } catch (err) { toast(err.message, 'error'); }
  }

  async function toggleGrocery(item) {
    try { await client.patch(`/grocery/${item._id}`, { done: !item.done }); load(); }
    catch (err) { toast(err.message, 'error'); }
  }

  const useFirst = pantry?.filter((i) => i.expiryStatus === 'use-first' || i.expiryStatus === 'expired') || [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-basil">your kitchen</p>
            <h1 className="serif mt-2 text-4xl font-bold tracking-tight sm:text-5xl">What’s cooking tonight?</h1>
          </div>
          <button onClick={openAdd} className="btn-tomato rounded-full px-6 py-3 text-sm font-bold">+ Stock an item</button>
        </div>

        {useFirst.length > 0 && (
          <div className="mt-6 flex items-center gap-4 overflow-hidden rounded-2xl border border-honey/40 bg-honey-soft px-5 py-3">
            <span className="chip shrink-0 bg-honey px-2.5 py-1 text-white">USE FIRST</span>
            <p className="truncate text-sm font-semibold text-[#8a6110]">{useFirst.map((i) => i.name).join(' · ')}</p>
          </div>
        )}

        {/* segmented tabs */}
        <div className="mt-8 flex justify-center sm:justify-start">
          <div className="tabs" role="tablist">
            <span className="tabs-thumb" style={{ left: thumb.left, width: thumb.width }} />
            {TABS.map(([key, label]) => (
              <button key={key} role="tab" aria-selected={tab === key} data-tab={key}
                ref={(el) => { tabRefs.current[TABS.findIndex(([k]) => k === key)] = el; }}
                onClick={() => setTab(key)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${tab === key ? 'text-basil' : 'text-bark hover:text-ink'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="mt-8"><ErrorState message={error} onRetry={load} /></div>}

        {/* ── COOK tab ── */}
        {tab === 'cook' && (
          matches === null ? <div className="mt-8 space-y-4">{[0, 1, 2].map((i) => <div key={i} className="shimmer h-40" />)}</div> : (
            <>
              {matches.filter((m) => m.cookable).length > 0 && (
                <div className="card-solid mt-8 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="serif text-lg font-bold">🗓️ Weekly plan — cook the top ready recipes?</p>
                    <button onClick={makePlan} disabled={planBusy} className="btn-primary rounded-full px-6 py-2.5 text-sm font-bold disabled:opacity-60">
                      {planBusy ? 'Planning…' : 'Build plan'}
                    </button>
                  </div>
                  {plan && (
                    <div className="mt-4 border-t border-basil/10 pt-4">
                      <p className="text-sm text-bark">{plan.shoppingList.length} to buy · {plan.coveredFromPantry} covered by your pantry</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {plan.shoppingList.slice(0, 10).map((s) => (
                          <span key={s.name} className="rounded-full border border-basil/15 bg-white px-3 py-1.5 text-xs font-semibold capitalize">{s.name} ×{s.quantity}{s.unit}</span>
                        ))}
                      </div>
                      <button onClick={pushPlan} className="btn-tomato mt-4 rounded-full px-6 py-2.5 text-sm font-bold">🛒 Push to grocery list</button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((r, i) => (
                  <div key={r._id} className="card tilt-card flex flex-col p-6" style={{ animation: `fadeUp .6s ${i * 0.06}s cubic-bezier(.2,.7,.3,1) both` }}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="serif text-xl font-bold leading-tight">{r.title}</h3>
                      <span className={`chip shrink-0 px-2.5 py-1 ${r.cookable ? 'bg-basil/10 text-basil' : 'bg-honey-soft text-[#8a6110]'}`}>
                        {r.cookable ? 'READY ✓' : `MISSING ${r.shortfallCount}`}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-bark">{r.minutes} min · serves {r.servings}</p>
                    {!r.cookable && (
                      <p className="mt-3 rounded-xl bg-honey-soft/70 px-3 py-2 text-xs font-semibold text-[#8a6110]">
                        needs: {r.shortfalls.slice(0, 3).map((s) => s.name).join(', ')}{r.shortfalls.length > 3 ? ` +${r.shortfalls.length - 3}` : ''}
                      </p>
                    )}
                    <div className="mt-auto flex gap-2 pt-5">
                      <button onClick={() => navigate(`/cook/${r._id}`)} disabled={!r.cookable}
                        className="btn-primary flex-1 rounded-full py-2.5 text-sm font-bold disabled:opacity-30">Cook it</button>
                      {!r.cookable && (
                        <button onClick={async () => {
                          try {
                            const res = await client.post(`/recipes/${r._id}/add-missing`, {});
                            toast(`Added ${res.data.added} item${res.data.added === 1 ? '' : 's'} to the list`);
                            load();
                          } catch (err) { toast(err.message, 'error'); }
                        }} className="btn-ghost rounded-full px-4 py-2.5 text-xs font-bold">+ list</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* ── PANTRY tab ── */}
        {tab === 'pantry' && (
          pantry === null ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(8)].map((_, i) => <div key={i} className="shimmer h-44" />)}</div> : (
            pantry.length === 0 ? <div className="mt-8"><Empty title="Empty shelves" hint="Add what's in your fridge and cupboards." action={<button onClick={openAdd} className="btn-primary rounded-full px-6 py-2.5 text-sm font-bold">Stock your first item</button>} /></div> : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {pantry.map((item, i) => (
                  <div key={item._id} className="tile-3d p-5" style={{ animation: `fadeUp .5s ${i * 0.04}s both` }}>
                    <div className="flex items-start justify-between">
                      <span className={`h-2.5 w-2.5 rounded-full ${AISLE_DOT[item.aisle] || 'bg-stone-400'}`} title={item.aisle} />
                      <div className="flex gap-1 text-xs">
                        <button onClick={() => openEdit(item)} aria-label={`edit ${item.name}`} className="rounded-full border border-basil/15 px-2 py-0.5 text-bark hover:border-basil hover:text-basil">✎</button>
                        <button onClick={() => remove(item)} aria-label={`remove ${item.name}`} className="rounded-full border border-basil/15 px-2 py-0.5 text-bark hover:border-tomato hover:text-tomato">✕</button>
                      </div>
                    </div>
                    <h3 className="serif mt-2 text-lg font-bold capitalize leading-tight">{item.name}</h3>
                    <p className="serif mt-1 text-2xl font-bold text-basil">{item.quantity}<span className="ml-1 text-sm font-semibold text-bark">{item.unit}</span></p>
                    <div className="mt-2 h-1.5 rounded-full bg-basil/10">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-basil-bright to-basil" style={{ width: `${Math.max(4, Math.min(100, (item.quantity / (TYPICAL[item.unit] || 10)) * 100))}%` }} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.expiresAt && <span className={`chip px-2 py-0.5 ${EXPIRY_TONE[item.expiryStatus]}`}>{item.expiryStatus === 'expired' ? `expired ${-item.expiryDays}d` : item.expiryStatus === 'use-first' ? `${item.expiryDays}d left` : `${item.expiryDays}d`}</span>}
                      {item.opened && <span className="chip bg-stone-200 px-2 py-0.5 text-stone-600">opened</span>}
                    </div>
                  </div>
                ))}
              </div>
            )
          )
        )}

        {/* ── GROCERY tab ── */}
        {tab === 'grocery' && (
          grocery === null ? <div className="mt-8 max-w-xl space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="shimmer h-14" />)}</div> : (
            <div className="mt-8 max-w-xl space-y-2.5">
              {grocery.length === 0 && <Empty title="List is empty" hint='Use "+ list" on any recipe or push a weekly plan.' />}
              {grocery.map((g, i) => (
                <label key={g._id} className="card flex cursor-pointer items-center gap-4 px-5 py-4" style={{ animation: `fadeUp .5s ${i * 0.05}s both` }}>
                  <input type="checkbox" checked={g.done} onChange={() => toggleGrocery(g)} className="peer h-5 w-5 shrink-0 accent-basil" />
                  <span className={`flex-1 font-semibold capitalize transition ${g.done ? 'text-stone-400 line-through' : ''}`}>{g.name}</span>
                  <span className="text-sm text-bark">{g.quantity} {g.unit}</span>
                  <span className={`h-2 w-2 rounded-full ${AISLE_DOT[g.aisle] || 'bg-stone-400'}`} title={g.aisle} />
                  <button onClick={async (e) => { e.preventDefault(); await client.delete(`/grocery/${g._id}`); load(); }} aria-label={`remove ${g.name}`} className="text-stone-300 hover:text-tomato">✕</button>
                </label>
              ))}
            </div>
          )
        )}

        {/* ── WASTE tab ── */}
        {tab === 'waste' && (
          waste === null ? <div className="mt-8 grid gap-4 sm:grid-cols-3">{[...Array(3)].map((_, i) => <div key={i} className="shimmer h-40" />)}</div> : (
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              <div className="card-solid p-6">
                <p className="chip bg-tomato-soft px-2.5 py-1 text-tomato">expired</p>
                <p className="serif mt-3 text-5xl font-bold text-tomato">{waste.wastedCount}</p>
                <ul className="mt-3 space-y-1 text-sm text-bark">
                  {waste.expired.slice(0, 4).map((i) => <li key={i._id} className="flex justify-between"><span className="capitalize">{i.name}</span><span className="font-semibold">{i.expiryDays * -1}d ago</span></li>)}
                  {waste.expired.length === 0 && <li className="text-basil">Nothing expired — spotless. ✓</li>}
                </ul>
              </div>
              <div className="card-solid p-6">
                <p className="chip bg-honey-soft px-2.5 py-1 text-[#8a6110]">use within 3 days</p>
                <p className="serif mt-3 text-5xl font-bold text-honey">{waste.expiringSoon.length}</p>
                <ul className="mt-3 space-y-1 text-sm text-bark">
                  {waste.expiringSoon.slice(0, 4).map((i) => <li key={i._id} className="flex justify-between"><span className="capitalize">{i.name}</span><span className="font-semibold">{i.expiryDays}d</span></li>)}
                  {waste.expiringSoon.length === 0 && <li>All clear.</li>}
                </ul>
              </div>
              <div className="card-solid p-6">
                <p className="chip bg-basil/10 px-2.5 py-1 text-basil">shelves by aisle</p>
                <ul className="mt-4 space-y-2.5">
                  {Object.entries(waste.byAisle).sort((a, b) => b[1] - a[1]).map(([aisle, n]) => (
                    <li key={aisle}>
                      <div className="flex justify-between text-sm font-semibold capitalize"><span>{aisle}</span><span>{n}</span></div>
                      <div className="mt-1 h-2 rounded-full bg-basil/10">
                        <div className="h-2 rounded-full bg-gradient-to-r from-basil-bright to-basil" style={{ width: `${(n / Math.max(...Object.values(waste.byAisle))) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
      </main>

      {/* ── add/edit modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#2a2416]/50 p-4 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="card-solid tilt-card w-full max-w-md p-7" style={{ animation: 'fadeUp .35s cubic-bezier(.2,.7,.3,1) both' }}>
            <h2 className="serif text-xl font-bold">{editing ? `Edit ${editing.name}` : 'Stock the pantry'}</h2>
            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-bark">Ingredient</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!!editing}
                className="mt-1.5 w-full rounded-xl border border-basil/20 bg-white px-4 py-3 outline-none transition focus:border-basil focus:ring-2 focus:ring-basil/15 disabled:bg-linen" />
            </label>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <label className="col-span-2 block">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-bark">Quantity</span>
                <input type="number" min="0" step="0.1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-basil/20 bg-white px-4 py-3 outline-none focus:border-basil focus:ring-2 focus:ring-basil/15" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-bark">Unit</span>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-basil/20 bg-white px-2 py-3 outline-none focus:border-basil">
                  {['pc', 'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'bunch', 'pack'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-bark">Aisle</span>
                <select value={form.aisle} onChange={(e) => setForm({ ...form, aisle: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-basil/20 bg-white px-3 py-3 outline-none focus:border-basil">
                  {AISLES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-bark">Expiry (opt.)</span>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-basil/20 bg-white px-3 py-3 outline-none focus:border-basil" />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1 rounded-xl py-3 font-bold">Cancel</button>
              <button className="btn-primary flex-1 rounded-xl py-3 font-bold">{editing ? 'Save changes' : 'Add to shelf'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
