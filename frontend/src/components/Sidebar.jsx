import { Link } from 'react-router-dom';
import {
  MdAutoAwesome,
  MdCalendarMonth,
  MdClose,
  MdDateRange,
  MdHome,
  MdPeople,
  MdSchool,
} from 'react-icons/md';
import { useAuthStore } from '../store/authStore';

export default function Sidebar({ isOpen = false, onClose }) {
  const user = useAuthStore((state) => state.user);

  const parentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: MdHome },
    { name: 'My Students', path: '/students', icon: MdPeople },
    { name: 'Browse Lessons', path: '/lessons', icon: MdSchool },
    { name: 'Sessions', path: '/sessions', icon: MdCalendarMonth },
    { name: 'My Bookings', path: '/bookings', icon: MdDateRange },
    { name: 'AI Summarizer', path: '/LLM', icon: MdAutoAwesome },
  ];

  const mentorLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: MdHome },
    { name: 'My Lessons', path: '/lessons', icon: MdSchool },
    { name: 'My Sessions', path: '/sessions', icon: MdDateRange },
  ];

  const links = user?.role === 'parent' ? parentLinks : mentorLinks;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-forest-900/40 transition-opacity md:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] border-r border-sage-200 bg-forest-50 p-4 shadow-lg transition-transform md:static md:min-h-screen md:w-64 md:translate-x-0 md:shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between md:hidden">
          <p className="text-lg font-semibold text-forest-700">Navigation</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-forest-700 transition hover:bg-sage-100"
            aria-label="Close navigation"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1.5 sm:space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-forest-700 transition hover:bg-sage-100 hover:text-forest-800"
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
