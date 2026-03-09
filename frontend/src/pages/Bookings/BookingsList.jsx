import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getBookings, deleteBooking, createBooking } from '../../services/bookings';
import { getLessons } from '../../services/lessons';
import { getStudents } from '../../services/students';
import { useAuthStore } from '../../store/authStore';
import { MdDateRange, MdDelete, MdAdd } from 'react-icons/md';

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsData, lessonsData, studentsData] = await Promise.all([
        getBookings(),
        getLessons(),
        getStudents(),
      ]);
      setBookings(bookingsData);
      setLessons(lessonsData);
      setStudents(studentsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await deleteBooking(id);
      setBookings(bookings.filter((b) => b._id !== id));
      toast.success('Booking cancelled');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    if (!selectedLesson || !selectedStudent) {
      toast.error('Please select both a lesson and a student');
      return;
    }

    setBookingLoading(true);
    try {
      await createBooking({ lessonId: selectedLesson, studentId: selectedStudent });
      toast.success('Lesson booked successfully!');
      setSelectedLesson('');
      setSelectedStudent('');
      setShowBookingForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book lesson');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sage-600">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-forest-700">My Bookings</h1>
          <p className="text-sage-600 mt-2">Manage your lesson bookings</p>
        </div>
        {user?.role === 'parent' && (
          <button
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="flex items-center gap-2 bg-forest-600 text-cream-50 px-6 py-3 rounded-lg hover:bg-forest-700 font-semibold transition"
          >
            <MdAdd /> {showBookingForm ? 'Cancel' : 'Book Lesson'}
          </button>
        )}
      </div>

      {showBookingForm && user?.role === 'parent' && (
        <form
          onSubmit={handleCreateBooking}
          className="bg-white rounded-xl shadow-md p-8 mb-8 border-2 border-sage-200"
        >
          <h2 className="text-2xl font-bold text-forest-700 mb-6">Book a Lesson</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-3 border-2 border-sage-200 rounded-lg text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} (Age {student.age})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">
                Select Lesson
              </label>
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full px-4 py-3 border-2 border-sage-200 rounded-lg text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
              >
                <option value="">Choose a lesson...</option>
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title} (Mentor: {lesson.mentorId?.name || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={bookingLoading}
            className="mt-6 w-full bg-forest-600 text-cream-50 py-3 rounded-lg hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition"
          >
            {bookingLoading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-forest-700 mb-6">Your Bookings</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-forest-600 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-forest-700">
                  {booking.lessonId?.title}
                </h3>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Active</span>
              </div>
              {booking.lessonId?.description && (
                <p className="text-sage-500 text-sm mt-1 line-clamp-2">{booking.lessonId.description}</p>
              )}
              <div className="mt-4 space-y-2 text-sage-600">
                <p><span className="font-semibold">👤 Student:</span> {booking.studentId?.name}</p>
                <p><span className="font-semibold">👨‍🏫 Mentor:</span> {booking.lessonId?.mentorId?.name}</p>
                <p className="flex items-center gap-2">
                  <MdDateRange className="w-4 h-4" />
                  <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
              {user?.role === 'parent' && (
                <button
                  onClick={() => handleCancel(booking._id)}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-red-600 text-cream-50 px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition"
                >
                  <MdDelete className="w-4 h-4" /> Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="mt-12 text-center text-sage-600 py-12 bg-cream-50 rounded-xl">
            No bookings yet. 
            {user?.role === 'parent' && ' Start by booking a lesson for your student!'}
          </div>
        )}
      </div>
    </div>
  );
}
