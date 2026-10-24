import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-tomato/10 bg-kitchen/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <NavLink to="/kitchen" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-tomato text-sm text-white">🥘</span>
          PantryPal
        </NavLink>
        <nav className="flex items-center gap-1 text-sm font-bold">
          <NavLink to="/kitchen" className={({ isActive }) => `rounded-full px-3 py-2 ${isActive ? 'bg-sage-soft text-sage' : 'hover:text-sage'}`}>Kitchen</NavLink>
          {user ? (
            <button onClick={() => { logout(); navigate('/'); }} className="ml-2 rounded-full border-2 border-stone-300 px-4 py-1.5 hover:border-tomato hover:text-tomato">
              Log out
            </button>
          ) : (
            <>
              <NavLink to="/login" className="rounded-full px-3 py-2 hover:text-tomato">Log in</NavLink>
              <NavLink to="/register" className="rounded-full bg-tomato px-4 py-2 text-white hover:bg-red-700">Open my kitchen</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
