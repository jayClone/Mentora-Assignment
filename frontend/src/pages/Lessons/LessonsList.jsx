import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getLessons, getMentorLessons, deleteLesson } from '../../services/lessons';
import { getStudents } from '../../services/students';
import { getBookings, createBooking } from '../../services/bookings';
import { useAuthStore } from '../../store/authStore';
import LessonForm from './LessonForm';
import { MdAdd, MdEdit, MdDelete, MdBookmark, MdCheckCircle } from 'react-icons/md';

export default function LessonsList() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [bookingLesson, setBookingLesson] = useState(null); // lesson being booked
  const [selectedStudent, setSelectedStudent] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchLessons();
  }, [user?.role]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const lessonsData = user?.role === 'mentor' ? await getMentorLessons() : await getLessons();
      setLessons(lessonsData);
      if (user?.role === 'parent') {
        const [studentsData, bookingsData] = await Promise.all([getStudents(), getBookings()]);
        setStudents(studentsData);
        setBookings(bookingsData);
      }
    } catch (error) {
      toast.error('Failed to fetch lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await deleteLesson(id);
      setLessons(lessons.filter((l) => l._id !== id));
      toast.success('Lesson deleted');
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLesson(null);
    fetchLessons();
  };

  const isLessonBooked = (lessonId) => {
    return bookings.some((b) => b.lessonId?._id === lessonId || b.lessonId === lessonId);
  };

  const getBookedStudents = (lessonId) => {
    return bookings
      .filter((b) => b.lessonId?._id === lessonId || b.lessonId === lessonId)
      .map((b) => b.studentId?.name)
      .filter(Boolean);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    setBookingLoading(true);
    try {
      await createBooking({ lessonId: bookingLesson._id, studentId: selectedStudent });
      toast.success(`"${bookingLesson.title}" booked successfully!`);
      setBookingLesson(null);
      setSelectedStudent('');
      fetchLessons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book lesson');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-sage-600 sm:p-6 lg:p-8">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest-700 sm:text-4xl">
            {user?.role === 'mentor' ? 'My Lessons' : 'Browse Lessons'}
          </h1>
          <p className="text-sage-600 mt-2">
            {user?.role === 'mentor' 
              ? 'Manage your lessons' 
              : 'Book lessons for your students'}
          </p>
        </div>
        {user?.role === 'mentor' && (
          <button
            onClick={() => {
              setEditingLesson(null);
              setShowForm(!showForm);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-forest-600 px-5 py-3 font-semibold text-cream-50 transition hover:bg-forest-700 sm:w-auto"
          >
            <MdAdd /> {showForm ? 'Cancel' : 'Create Lesson'}
          </button>
        )}
      </div>

      {showForm && (
        <LessonForm lesson={editingLesson} onClose={handleFormClose} />
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-sage-600 hover:shadow-lg transition">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-xl font-semibold text-forest-700 break-words">{lesson.title}</h3>
              {user?.role === 'parent' && isLessonBooked(lesson._id) && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  <MdCheckCircle className="w-3 h-3" /> Booked
                </span>
              )}
            </div>
            <p className="text-sage-600 mt-3 line-clamp-2">{lesson.description}</p>
            <p className="text-sm text-sage-500 mt-4">
              👨‍🏫 {lesson.mentorId?.name || 'N/A'}
            </p>
            {user?.role === 'parent' && isLessonBooked(lesson._id) && (
              <p className="text-xs text-sage-500 mt-2">
                Booked for: {getBookedStudents(lesson._id).join(', ')}
              </p>
            )}
            {user?.role === 'mentor' && user?._id === lesson.mentorId?._id && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setEditingLesson(lesson);
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 flex-1 bg-sage-600 text-cream-50 px-3 py-2 rounded-lg hover:bg-sage-700 font-medium transition text-sm"
                >
                  <MdEdit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(lesson._id)}
                  className="flex items-center gap-2 flex-1 bg-red-600 text-cream-50 px-3 py-2 rounded-lg hover:bg-red-700 font-medium transition text-sm"
                >
                  <MdDelete className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
            {user?.role === 'parent' && (
              <button
                onClick={() => {
                  setBookingLesson(bookingLesson?._id === lesson._id ? null : lesson);
                  setSelectedStudent('');
                }}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-forest-600 text-cream-50 px-4 py-2 rounded-lg hover:bg-forest-700 font-medium transition"
              >
                <MdBookmark className="w-4 h-4" />
                {bookingLesson?._id === lesson._id ? 'Cancel' : 'View & Book'}
              </button>
            )}

            {/* Inline Booking Form */}
            {user?.role === 'parent' && bookingLesson?._id === lesson._id && (
              <form onSubmit={handleBookSubmit} className="mt-4 p-4 bg-cream-50 rounded-lg border border-sage-200">
                <p className="text-sm font-semibold text-forest-700 mb-3">Book for which student?</p>
                {students.length === 0 ? (
                  <p className="text-sm text-sage-500">No students found. Add a student first.</p>
                ) : (
                  <>
                    <select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-sage-200 rounded-lg text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-600 mb-3 text-sm"
                    >
                      <option value="">Choose a student...</option>
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name} (Age {student.age})
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full bg-forest-600 text-cream-50 py-2 rounded-lg hover:bg-forest-700 disabled:opacity-50 font-semibold text-sm transition"
                    >
                      {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        ))}
      </div>

      {lessons.length === 0 && !showForm && (
        <div className="text-center text-sage-600 py-12 bg-cream-50 rounded-xl">
          {user?.role === 'mentor' 
            ? 'No lessons created yet. Create your first lesson!' 
            : 'No lessons available yet.'}
        </div>
      )}
    </div>
  );
}
