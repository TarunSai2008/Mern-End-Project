import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl font-bold text-tomato">404</p>
      <h1 className="text-xl font-bold">This recipe burnt</h1>
      <p className="text-stone-500">The page you're looking for doesn't exist.</p>
      <Link to="/kitchen" className="rounded-full bg-tomato px-6 py-2.5 font-bold text-white">Back to the kitchen</Link>
    </div>
  );
}
