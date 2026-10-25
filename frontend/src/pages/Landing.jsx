import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden">
      <span className="float absolute right-[10%] top-20 text-5xl opacity-70">🥕</span>
      <span className="float absolute left-[7%] top-56 text-4xl opacity-60" style={{ animationDelay: '-3s' }}>🍅</span>
      <span className="float absolute bottom-40 right-[18%] text-4xl opacity-50" style={{ animationDelay: '-5s' }}>🧄</span>

      <header className="relative mx-auto flex h-20 max-w-5xl items-center justify-between px-4">
        <Link to="/kitchen" className="flex items-center gap-2.5 text-xl font-bold">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-tomato text-xl text-white shadow-lg shadow-red-300">🥘</span> PantryPal
        </Link>
        <Link to={user ? '/kitchen' : '/register'} className="rounded-full bg-tomato px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5">
          {user ? 'My kitchen' : 'Open my kitchen'}
        </Link>
      </header>

      <main className="relative mx-auto max-w-5xl px-4">
        <section className="reveal py-14 text-center sm:py-20">
          <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight sm:text-6xl">
            Cook what you have.<br /><span className="text-sage">Buy only what's missing.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg text-stone-500">
            Households forget what's in the pantry, bin expired food and shop from
            memory. PantryPal tracks your shelves, matches them against recipes,
            and builds a grocery list of exactly what's missing.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-3d hover-lift rounded-full bg-tomato px-9 py-4 font-bold text-white shadow-xl shadow-red-200">Stock my pantry →</Link>
            <Link to="/login" className="btn-3d glass tilt-card rounded-full px-9 py-4 font-bold text-stone-700">Log in</Link>
          </div>
        </section>

        {/* recipe match demo */}
        <section className="reveal mx-auto mb-10 max-w-3xl">
          <div className="float-3d glass tilt-card rounded-[2.5rem] p-8">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-sage">what can I cook tonight?</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Grilled Cheese', 'Ready ✓', 'bg-sage-soft text-sage', 'wobble'],
                ['Curd Rice', 'Ready ✓', 'bg-sage-soft text-sage', ''],
                ['Masala Chai', 'Missing 2', 'bg-amber-100 text-amber-700', ''],
              ].map(([title, badge, tone, extra], i) => (
                <div key={title} className={`rounded-3xl border-2 border-stone-100 bg-white p-5 text-center shadow-sm ${extra}`} style={{ transform: `rotate(${(i - 1) * 2}deg)` }}>
                  <p className="text-3xl">{['🧀', '🍚', '☕'][i]}</p>
                  <p className="mt-2 font-bold">{title}</p>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{badge}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-2xl bg-tomato/5 px-4 py-3 text-center text-sm font-semibold text-tomato">⚠️ Use first: tomatoes (2d), bread (2d)</p>
          </div>
        </section>

        <section className="reveal grid gap-6 pb-16 sm:grid-cols-3">
          {[
            ['⏳', 'Expiry-smart shelves', 'Every tile shows days left. Expiring items get a "use first" badge before they become waste.'],
            ['🍳', '20 built-in recipes', 'Ranked by match — from "ready to cook" to "missing 2: garlic, butter".'],
            ['🛒', 'Smart grocery list', 'One tap merges every shortfall into an aisle-grouped list — no duplicates, ever.'],
          ].map(([icon, t, b]) => (
            <div key={t} className="rounded-3xl border-2 border-stone-100 bg-white p-7 hover-lift">
              <span className="text-3xl">{icon}</span>
              <h3 className="mt-3 font-bold">{t}</h3>
              <p className="mt-2 text-sm text-stone-500">{b}</p>
            </div>
          ))}
        </section>
      </main>

      <div className="border-y-2 border-tomato/10 bg-white/70 py-4">
        <div className="marquee gap-10 text-sm font-bold text-stone-400">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex gap-10 pr-10">
              {['QUANTITY-AWARE MATCHING', 'TRANSACTIONAL COOK MODE', 'EXPIRY ALERTS', 'WASTE REPORTS', 'ZERO DUPLICATES'].map((t) => (
                <span key={t} className="flex items-center gap-10">{t} <span className="text-sage">✿</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <footer className="py-10 text-center text-sm text-stone-400">PantryPal — cook what you have.</footer>
    </div>
  );
}
