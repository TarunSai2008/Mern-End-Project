import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  { icon: '⏳', title: 'Expiry-smart shelves', body: 'Every tile counts down. Expiring items earn a “use first” ribbon before they become waste.', },
  { icon: '🍳', title: '20 ranked recipes', body: 'From “ready to cook” to “missing 2: garlic, butter” — quantity-aware, not vibes-based.', },
  { icon: '🛒', title: 'One-tap grocery list', body: 'Merge every shortfall into an aisle-grouped list. No duplicates — ever.', },
  { icon: '🗓️', title: 'Weekly meal planner', body: 'Plan five dinners; we aggregate ingredients, net out the pantry, and hand you the list.', },
];

const INGREDIENTS = [
  { e: '🍅', x: '8%', y: '12%', d: '0s', s: 'text-5xl' },
  { e: '🥕', x: '78%', y: '6%', d: '-2s', s: 'text-4xl' },
  { e: '🧄', x: '86%', y: '58%', d: '-4s', s: 'text-3xl' },
  { e: '🥬', x: '4%', y: '62%', d: '-1s', s: 'text-4xl' },
  { e: '🍋', x: '60%', y: '82%', d: '-3s', s: 'text-3xl' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden">
      {INGREDIENTS.map((g) => (
        <span key={g.e} className={`pointer-events-none absolute float-3d select-none opacity-70 ${g.s}`} style={{ left: g.x, top: g.y, animationDelay: g.d }} aria-hidden="true">{g.e}</span>
      ))}

      <header className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-basil-bright to-basil text-lg shadow-[0_10px_22px_-8px_rgba(30,86,49,.55),inset_0_1px_0_rgba(255,255,255,.3)]">🥘</span>
          <span className="serif text-xl font-bold tracking-tight">PantryPal</span>
        </div>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          {user ? (
            <Link to="/kitchen" className="btn-primary rounded-full px-6 py-2.5 font-bold">My kitchen</Link>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-5 py-2.5 text-bark hover:text-basil">Log in</Link>
              <Link to="/register" className="btn-primary rounded-full px-6 py-2.5 font-bold">Open my kitchen</Link>
            </>
          )}
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-4">
        {/* ── hero ── */}
        <section className="reveal grid items-center gap-14 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <p className="serif mb-5 inline-block rounded-full border border-basil/20 bg-white/70 px-5 py-1.5 text-sm italic text-basil">
              ~ the kitchen companion ~
            </p>
            <h1 className="serif text-5xl font-bold leading-[1.04] tracking-tight sm:text-7xl">
              Cook what<br />you <span className="text-gradient italic">have.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-bark">
              Buy only what’s missing. PantryPal tracks your shelves with expiry
              intelligence, matches them against real recipes, and turns every gap into
              a grocery list — <strong className="text-ink">in one tap.</strong>
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary rounded-full px-9 py-4 text-base font-bold">Stock my pantry →</Link>
              <Link to="/login" className="btn-ghost rounded-full px-9 py-4 font-semibold">I have a kitchen</Link>
            </div>
          </div>

          {/* floating 3D plate + cards */}
          <div className="perspective relative mx-auto flex h-[440px] w-full max-w-md items-center justify-center">
            <div className="plate float-3d absolute h-[300px] w-[300px]">
              <div className="absolute inset-0 grid place-items-center">
                <div className="grid grid-cols-2 gap-4 text-4xl" style={{ transform: 'translateZ(30px)' }}>
                  <span>🍅</span><span>🧄</span><span>🥬</span><span>🥕</span>
                </div>
              </div>
            </div>
            <div className="card tilt-card absolute left-0 top-6 w-48 rotate-[-6deg] p-4" style={{ transform: 'perspective(1000px) rotateY(14deg) rotateZ(-6deg)' }}>
              <p className="chip bg-basil/10 px-2 py-1 text-basil">ready ✓</p>
              <p className="serif mt-2 font-bold leading-tight">Grilled Cheese</p>
              <p className="mt-1 text-xs text-bark">4 ingredients on hand</p>
            </div>
            <div className="card tilt-card absolute bottom-4 right-0 w-52 rotate-[5deg] p-4" style={{ transform: 'perspective(1000px) rotateY(-12deg) rotateZ(5deg)' }}>
              <p className="chip bg-honey-soft px-2 py-1 text-[#8a6110]">missing 2</p>
              <p className="serif mt-2 font-bold leading-tight">Masala Chai</p>
              <p className="mt-1 text-xs text-bark">ginger · tea powder</p>
              <button className="btn-tomato mt-3 w-full rounded-full py-2 text-xs font-bold">+ add to list</button>
            </div>
          </div>
        </section>

        {/* ── use-first ticker ── */}
        <section className="reveal card-solid mx-auto mb-14 max-w-2xl overflow-hidden p-0">
          <div className="flex items-center gap-4 border-b border-basil/10 bg-honey-soft/60 px-6 py-3">
            <span className="chip shrink-0 bg-honey px-2.5 py-1 text-white">USE FIRST</span>
            <p className="truncate text-sm font-semibold text-[#8a6110]">tomatoes (2d) · bread (2d) · curd — cook these before anything else</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-basil/10 text-center">
            {[['11', 'recipes ranked'], ['27', 'items tracked'], ['₹0', 'wasted this week']].map(([n, l]) => (
              <div key={l} className="px-4 py-5"><p className="serif text-3xl font-bold text-basil">{n}</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-bark">{l}</p></div>
            ))}
          </div>
        </section>

        {/* ── features ── */}
        <section className="reveal grid gap-5 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card tilt-card p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-honey-soft to-white text-2xl shadow-[0_8px_18px_-8px_rgba(242,166,28,.5)]">{f.icon}</span>
              <h3 className="serif mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bark">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <div className="relative border-y border-basil/10 bg-white/60 py-4">
        <div className="marquee gap-10 text-sm font-bold text-basil/50">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex gap-10 pr-10">
              {['QUANTITY-AWARE MATCHING', 'TRANSACTIONAL COOK MODE', 'EXPIRY ALERTS', 'WASTE REPORTS', 'MEAL PLANNER', 'ZERO DUPLICATES'].map((t) => (
                <span key={t} className="flex items-center gap-10">{t} <span className="text-tomato">✿</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="relative py-12 text-center">
        <p className="serif text-sm italic text-bark">PantryPal — cook what you have.</p>
      </footer>
    </div>
  );
}
