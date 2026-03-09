import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { MdHome, MdPeople, MdSchool, MdDateRange, MdCalendarMonth } from 'react-icons/md';

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);

  const parentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: MdHome },
    { name: 'My Students', path: '/students', icon: MdPeople },
    { name: 'Browse Lessons', path: '/lessons', icon: MdSchool },
    { name: 'Sessions', path: '/sessions', icon: MdCalendarMonth },
    { name: 'My Bookings', path: '/bookings', icon: MdDateRange },
  ];

  const mentorLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: MdHome },
    { name: 'My Lessons', path: '/lessons', icon: MdSchool },
    { name: 'My Sessions', path: '/sessions', icon: MdDateRange },
  ];

  const links = user?.role === 'parent' ? parentLinks : mentorLinks;

  return (
    <aside className="bg-forest-50 w-64 min-h-screen p-4 border-r border-sage-200 shadow-sm">
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-forest-700 hover:bg-sage-100 hover:text-forest-800 transition font-medium"
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
