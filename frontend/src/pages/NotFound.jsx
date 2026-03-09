import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-sage-50">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-forest-700 mb-4">404</h1>
        <p className="text-3xl font-bold text-sage-700 mb-4">Oops!</p>
        <p className="text-lg text-sage-600 mb-8">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-forest-600 text-cream-50 px-8 py-4 rounded-lg hover:bg-forest-700 font-semibold text-lg transition transform hover:scale-105"
        >
          🌿 Go Back Home
        </button>
      </div>
    </div>
  );
}
