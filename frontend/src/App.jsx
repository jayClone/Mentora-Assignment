import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

// Auth Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Other Pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ParentDashboard from './pages/ParentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import StudentsList from './pages/Students/StudentsList';
import LessonsList from './pages/Lessons/LessonsList';
import BookingsList from './pages/Bookings/BookingsList';
import SessionsList from './pages/Sessions/SessionsList';
import Summarizer from './pages/LLM/Summarizer';
import NotFound from './pages/NotFound';

function AppLayout({ children }) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return children;
  }

  return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 bg-cream-50">
            {children}
          </main>
        </div>
      </div>
  );
}

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" /> : <Signup />}
          />

          {/* Main Dashboard - Routes to role-specific dashboard */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          {/* Role-Specific Dashboards */}
          <Route
            path="/parent-dashboard"
            element={
              <AppLayout>
                <ProtectedRoute>
                  <ParentDashboard />
                </ProtectedRoute>
              </AppLayout>
            }
          />
          <Route
            path="/mentor-dashboard"
            element={
              <AppLayout>
                <ProtectedRoute>
                  <MentorDashboard />
                </ProtectedRoute>
              </AppLayout>
            }
          />
          <Route
            path="/students"
            element={
              <AppLayout>
                <ProtectedRoute>
                  <StudentsList />
                </ProtectedRoute>
              </AppLayout>
            }
          />
          <Route
            path="/lessons"
            element={
              <AppLayout>
                <ProtectedRoute>
                  <LessonsList />
                </ProtectedRoute>
              </AppLayout>
            }
          />
          <Route
            path="/bookings"
            element={
              <AppLayout>
                <ProtectedRoute>
                  <BookingsList />
                </ProtectedRoute>
              </AppLayout>
            }
          />
          <Route
            path="/sessions"
            element={
              <AppLayout>
                <ProtectedRoute>
                  <SessionsList />
                </ProtectedRoute>
              </AppLayout>
            }
          />
          <Route
            path="/llm"
            element={
              <AppLayout>
                <ProtectedRoute>
                  <Summarizer />
                </ProtectedRoute>
              </AppLayout>
            }
          />

          {/* Root route - Home page */}
          <Route path="/" element={<HomePage />} />

          {/* Root redirect for authenticated users */}
          <Route path="/home" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
