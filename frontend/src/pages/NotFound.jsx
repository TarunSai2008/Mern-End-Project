import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="perspective"><p className="serif float-3d text-8xl font-bold text-gradient sm:text-9xl">404</p></div>
      <h1 className="serif text-xl font-bold">This recipe burnt</h1>
      <p className="max-w-sm text-bark">The page you\u2019re looking for isn\u2019t on the shelf.</p>
      <Link to="/kitchen" className="btn-primary rounded-full px-8 py-3 font-bold">Back to the kitchen</Link>
    </div>
  );
}
