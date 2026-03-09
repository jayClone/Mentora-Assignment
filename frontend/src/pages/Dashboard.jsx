import { useAuthStore } from '../store/authStore';
import ParentDashboard from './ParentDashboard';
import MentorDashboard from './MentorDashboard';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return user?.role === 'parent' ? <ParentDashboard /> : <MentorDashboard />;
}
