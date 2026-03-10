import { useNavigate } from 'react-router-dom';
import { MdMenu } from 'react-icons/md';
import { useAuthStore } from '../store/authStore';

export default function Navbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-forest-700 text-cream-50 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {user && (
              <button
                type="button"
                onClick={onMenuToggle}
                className="inline-flex rounded-lg p-2 text-cream-50 transition hover:bg-forest-600 md:hidden"
                aria-label="Toggle navigation"
              >
                <MdMenu className="h-6 w-6" />
              </button>
            )}
            <h1
              className="cursor-pointer text-xl font-bold text-cream-100 transition hover:text-cream-50 sm:text-2xl"
              onClick={() => navigate('/dashboard')}
            >
              Mentora
            </h1>
          </div>
          {user && (
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
              <div className="hidden text-right sm:block">
                <p className="max-w-40 truncate text-sm font-medium text-cream-100 lg:max-w-56">{user.name}</p>
                <p className="text-xs capitalize text-cream-200">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded bg-sage-600 px-3 py-2 text-sm font-medium transition hover:bg-sage-700 sm:px-4"
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
