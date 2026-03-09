import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { getStudents } from '../services/students';
import { getBookings } from '../services/bookings';
import { MdPeople, MdSchool, MdDateRange, MdAutoAwesome, MdAdd, MdArrowForward } from 'react-icons/md';

export default function ParentDashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, bookingsData] = await Promise.all([
        getStudents(),
        getBookings(),
      ]);
      setStudents(studentsData);
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
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-sage-50 to-cream-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-forest-600 to-forest-700 text-cream-50 px-8 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Welcome back, {user?.name}! 👋</h1>
          <p className="text-lg text-cream-100">Manage your students' learning journey and book lessons</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Students Stat */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-8 border-l-4 border-forest-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-600 text-sm font-semibold uppercase tracking-wide">My Students</p>
                <p className="text-4xl font-bold text-forest-700 mt-3">{students.length}</p>
                <button
                  onClick={() => navigate('/students')}
                  className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-700 font-semibold mt-4 text-sm"
                >
                  View All <MdArrowForward />
                </button>
              </div>
              <MdPeople className="w-16 h-16 text-forest-100" />
            </div>
          </div>

          {/* Bookings Stat */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-8 border-l-4 border-sage-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-600 text-sm font-semibold uppercase tracking-wide">Active Bookings</p>
                <p className="text-4xl font-bold text-forest-700 mt-3">{bookings.length}</p>
                <button
                  onClick={() => navigate('/bookings')}
                  className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700 font-semibold mt-4 text-sm"
                >
                  View All <MdArrowForward />
                </button>
              </div>
              <MdDateRange className="w-16 h-16 text-sage-100" />
            </div>
          </div>

          {/* Lessons Stat */}
          <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-8 border-l-4 border-cream-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sage-600 text-sm font-semibold uppercase tracking-wide">Available Lessons</p>
                <p className="text-4xl font-bold text-forest-700 mt-3">5+</p>
                <button
                  onClick={() => navigate('/lessons')}
                  className="inline-flex items-center gap-2 text-cream-700 hover:text-cream-800 font-semibold mt-4 text-sm"
                >
                  Browse <MdArrowForward />
                </button>
              </div>
              <MdSchool className="w-16 h-16 text-cream-100" />
            </div>
          </div>
        </div>

        {/* Action Buttons - Large and Prominent */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-forest-700 mb-6">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/students')}
              className="bg-forest-600 hover:bg-forest-700 text-cream-50 rounded-2xl p-8 text-left transition transform hover:scale-105 shadow-lg group"
            >
              <MdPeople className="w-12 h-12 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-2xl font-bold mb-2">Add or Manage Students</h3>
              <p className="text-cream-100">Add your children and manage their profiles for lesson bookings</p>
            </button>

            <button
              onClick={() => navigate('/lessons')}
              className="bg-sage-600 hover:bg-sage-700 text-cream-50 rounded-2xl p-8 text-left transition transform hover:scale-105 shadow-lg group"
            >
              <MdSchool className="w-12 h-12 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-2xl font-bold mb-2">Browse & Book Lessons</h3>
              <p className="text-cream-100">Explore available lessons from expert mentors and book sessions</p>
            </button>

            <button
              onClick={() => navigate('/bookings')}
              className="bg-cream-700 hover:bg-cream-800 text-cream-50 rounded-2xl p-8 text-left transition transform hover:scale-105 shadow-lg group"
            >
              <MdDateRange className="w-12 h-12 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-2xl font-bold mb-2">View My Bookings</h3>
              <p className="text-cream-100">Check upcoming lessons and manage your booking schedule</p>
            </button>

            <button
              onClick={() => navigate('/llm')}
              className="bg-forest-500 hover:bg-forest-600 text-cream-50 rounded-2xl p-8 text-left transition transform hover:scale-105 shadow-lg group"
            >
              <MdAutoAwesome className="w-12 h-12 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-2xl font-bold mb-2">AI Summarizer</h3>
              <p className="text-cream-100">Use AI to summarize and analyze lesson notes</p>
            </button>
          </div>
        </div>

        {/* Your Students Section */}
        {students.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-forest-700 mb-6">Your Students</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.slice(0, 6).map((student) => (
                <div
                  key={student._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-t-4 border-forest-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-forest-700">{student.name}</h3>
                      <p className="text-sage-600 text-sm">Age {student.age}</p>
                    </div>
                    <MdPeople className="w-8 h-8 text-forest-100" />
                  </div>
                  <p className="text-sage-600 text-sm mb-4">Ready to learn and grow</p>
                  <button
                    onClick={() => navigate('/lessons')}
                    className="text-forest-600 hover:text-forest-700 text-sm font-semibold inline-flex items-center gap-1"
                  >
                    Book a lesson <MdArrowForward className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-forest-700 mb-6">Recent Bookings</h2>
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 border-l-4 border-sage-600 flex items-center justify-between"
                >
                  <div>
                    <p className="text-forest-700 font-semibold">Booking #{idx + 1}</p>
                    <p className="text-sage-600 text-sm">Scheduled and pending</p>
                  </div>
                  <MdDateRange className="w-6 h-6 text-sage-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
