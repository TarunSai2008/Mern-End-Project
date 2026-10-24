import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/kitchen" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-tomato text-sm text-white">🥘</span> PantryPal
        </Link>
        <Link to={user ? '/kitchen' : '/register'} className="rounded-full bg-tomato px-5 py-2 text-sm font-bold text-white">
          {user ? 'My kitchen' : 'Open my kitchen'}
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-4">
        <section className="py-20 text-center">
          <h1 className="mx-auto max-w-2xl text-5xl font-bold leading-tight">
            Cook what you have.<br /><span className="text-sage">Buy only what's missing.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-stone-500">
            Households forget what's in the pantry, bin expired food and shop from
            memory. PantryPal tracks your shelves, matches them against recipes,
            and builds a grocery list of exactly what's missing.
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <Link to="/register" className="rounded-full bg-tomato px-8 py-3 font-bold text-white shadow-lg shadow-red-200">Stock my pantry</Link>
            <Link to="/login" className="rounded-full border-2 border-stone-300 px-8 py-3 font-bold hover:border-tomato">Log in</Link>
          </div>
        </section>
        <section className="grid gap-4 pb-24 sm:grid-cols-3">
          {[
            ['Expiry-smart shelves', 'Every tile shows days left. Expiring items get a "use first" badge before they become waste.'],
            ['What can I cook?', '20 built-in recipes ranked by match — from "ready to cook" to "missing 2: garlic, butter".'],
            ['Smart grocery list', 'One tap merges every recipe shortfall into an aisle-grouped list — no duplicates, ever.'],
          ].map(([t, b]) => (
            <div key={t} className="rounded-3xl border-2 border-stone-200/70 bg-white p-6">
              <h3 className="font-bold">{t}</h3>
              <p className="mt-2 text-sm text-stone-500">{b}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t-2 border-tomato/10 py-6 text-center text-sm text-stone-400">PantryPal — cook what you have.</footer>
    </div>
  );
}
