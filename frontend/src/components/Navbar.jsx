import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-basil/10 bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/kitchen" className="group flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-basil-bright to-basil text-lg shadow-[0_10px_22px_-8px_rgba(30,86,49,.55),inset_0_1px_0_rgba(255,255,255,.3)] transition group-hover:scale-105">🥘</span>
          <span className="serif text-xl font-bold tracking-tight">PantryPal</span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm font-semibold">
          {user ? (
            <>
              <span className="hidden text-bark md:block">{user?.name}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost rounded-full px-4 py-2">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-bark hover:text-basil">Log in</Link>
              <Link to="/register" className="btn-primary rounded-full px-5 py-2 font-bold">Open my kitchen</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
