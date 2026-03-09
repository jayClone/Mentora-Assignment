import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-forest-700 text-cream-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 
              className="text-2xl font-bold cursor-pointer text-cream-100 hover:text-cream-50 transition" 
              onClick={() => navigate('/dashboard')}
            >
              🌿 Mentora
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-cream-100">{user.name}</span>
              <span className="text-cream-200 text-sm capitalize">({user.role})</span>
              <button
                onClick={handleLogout}
                className="bg-sage-600 hover:bg-sage-700 px-4 py-2 rounded font-medium transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
