import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { getMentorLessons } from '../services/lessons';
import { getMentorSessions } from '../services/sessions';
import { getBookings } from '../services/bookings';
import { MdSchool, MdDateRange, MdAutoAwesome, MdAdd, MdTrendingUp, MdPeople, MdCheckCircle } from 'react-icons/md';

export default function MentorDashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lessonsData, sessionsData, bookingsData] = await Promise.all([
        getMentorLessons(),
        getMentorSessions(),
        getBookings(),
      ]);
      setLessons(lessonsData);
      setSessions(sessionsData);
      setBookings(bookingsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sage-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-900 via-forest-800 to-forest-900">
      {/* Header with Mentor Profile */}
      <div className="bg-gradient-to-br from-forest-700 to-forest-800 px-8 py-12 text-cream-50 border-b-4 border-sage-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sage-200 text-sm font-semibold uppercase tracking-widest">Mentor Dashboard</p>
            <h1 className="text-4xl font-bold mt-2">Welcome back, {user?.name}</h1>
            <p className="text-cream-100 mt-2 text-lg">Manage your lessons and track student progress</p>
          </div>
          <MdSchool className="w-24 h-24 text-sage-300 opacity-80" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Lessons Card */}
          <div className="bg-gradient-to-br from-sage-600 to-sage-700 text-cream-50 rounded-xl shadow-xl p-8 border-r-4 border-sage-300 hover:shadow-2xl transition">
            <div className="flex items-center justify-between mb-4">
              <MdSchool className="w-12 h-12 opacity-80" />
              <span className="bg-sage-500 text-cream-50 px-3 py-1 rounded-full text-sm font-semibold">{lessons.length}</span>
            </div>
            <p className="text-sage-100 text-sm uppercase tracking-wide font-semibold">Total Lessons</p>
            <p className="text-3xl font-bold mt-2">Created</p>
          </div>

          {/* Sessions Card */}
          <div className="bg-gradient-to-br from-forest-600 to-forest-700 text-cream-50 rounded-xl shadow-xl p-8 border-r-4 border-forest-300 hover:shadow-2xl transition">
            <div className="flex items-center justify-between mb-4">
              <MdDateRange className="w-12 h-12 opacity-80" />
              <span className="bg-forest-500 text-cream-50 px-3 py-1 rounded-full text-sm font-semibold">{sessions.length}</span>
            </div>
            <p className="text-forest-100 text-sm uppercase tracking-wide font-semibold">Active Sessions</p>
            <p className="text-3xl font-bold mt-2">In Progress</p>
          </div>

          {/* Student Bookings */}
          <div className="bg-gradient-to-br from-cream-600 to-cream-700 text-cream-50 rounded-xl shadow-xl p-8 border-r-4 border-cream-300 hover:shadow-2xl transition">
            <div className="flex items-center justify-between mb-4">
              <MdPeople className="w-12 h-12 opacity-80" />
              <span className="bg-cream-500 text-cream-50 px-3 py-1 rounded-full text-sm font-semibold">{bookings.length}</span>
            </div>
            <p className="text-cream-100 text-sm uppercase tracking-wide font-semibold">Student Bookings</p>
            <p className="text-3xl font-bold mt-2">Confirmed</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 text-cream-50 rounded-xl shadow-xl p-8 border-r-4 border-cyan-300 hover:shadow-2xl transition">
            <div className="flex items-center justify-between mb-4">
              <MdTrendingUp className="w-12 h-12 opacity-80" />
              <span className="bg-cyan-500 text-cream-50 px-3 py-1 rounded-full text-sm font-semibold">92%</span>
            </div>
            <p className="text-cyan-100 text-sm uppercase tracking-wide font-semibold">Completion</p>
            <p className="text-3xl font-bold mt-2">Rate</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cream-50 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/lessons')}
              className="bg-gradient-to-br from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-cream-50 rounded-xl p-8 text-left transition transform hover:scale-105 shadow-xl group"
            >
              <MdSchool className="w-10 h-10 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold mb-2">Manage Lessons</h3>
              <p className="text-sage-100 text-sm">Create, edit, or delete your lessons</p>
            </button>

            <button
              onClick={() => navigate('/sessions')}
              className="bg-gradient-to-br from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-cream-50 rounded-xl p-8 text-left transition transform hover:scale-105 shadow-xl group"
            >
              <MdDateRange className="w-10 h-10 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold mb-2">View Sessions</h3>
              <p className="text-forest-100 text-sm">Track all upcoming and past sessions</p>
            </button>
          </div>
        </div>

        {/* Your Lessons Section */}
        {lessons.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cream-50">Your Lessons</h2>
              <button
                onClick={() => navigate('/lessons')}
                className="bg-sage-600 hover:bg-sage-700 text-cream-50 px-6 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <MdAdd /> New Lesson
              </button>
            </div>
            <div className="space-y-4">
              {lessons.slice(0, 5).map((lesson, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-forest-700 to-forest-800 text-cream-50 rounded-lg p-6 hover:shadow-lg transition flex items-center justify-between border-l-4 border-sage-600"
                >
                  <div>
                    <h3 className="text-lg font-bold">{lesson.title || `Lesson ${idx + 1}`}</h3>
                    <p className="text-forest-100 text-sm mt-1">{lesson.description || 'Expert-led mentoring session'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">${lesson.price || 'TBD'}</p>
                      <p className="text-forest-100 text-sm">per session</p>
                    </div>
                    <MdCheckCircle className="w-8 h-8 text-sage-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-cream-50 mb-6">Upcoming Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.slice(0, 4).map((session, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-forest-700 to-forest-800 text-cream-50 rounded-lg p-6 border-l-4 border-cyan-400 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-cyan-300 text-sm font-semibold uppercase">Session #{idx + 1}</p>
                      <h3 className="text-xl font-bold mt-1">Student Learning Session</h3>
                    </div>
                    <MdDateRange className="w-6 h-6 text-cyan-300" />
                  </div>
                  <p className="text-forest-100 text-sm">Progress tracking and feedback pending</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Bookings */}
        {bookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-cream-50 mb-6">Student Bookings</h2>
            <div className="space-y-3">
              {bookings.slice(0, 6).map((booking, idx) => (
                <div
                  key={idx}
                  className="bg-forest-700 rounded-lg p-4 flex items-center justify-between border-l-4 border-sage-500 hover:bg-forest-600 transition"
                >
                  <div className="flex items-center gap-4">
                    <MdPeople className="w-6 h-6 text-sage-400" />
                    <div>
                      <p className="text-cream-50 font-semibold">Booking #{idx + 1}</p>
                      <p className="text-forest-200 text-sm">Student enrolled and confirmed</p>
                    </div>
                  </div>
                  <MdCheckCircle className="w-6 h-6 text-sage-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
