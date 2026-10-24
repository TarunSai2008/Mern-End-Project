import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Kitchen from './pages/Kitchen.jsx';
import CookMode from './pages/CookMode.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/cook/:recipeId" element={<CookMode />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
