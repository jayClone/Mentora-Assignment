import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSessions, getMentorSessions, deleteSession, createSession, joinSession, leaveSession, updateSession } from '../../services/sessions';
import { getMentorLessons } from '../../services/lessons';
import { getStudents } from '../../services/students';
import { useAuthStore } from '../../store/authStore';
import { MdDateRange, MdDelete, MdAdd, MdEdit, MdLogout, MdAutoAwesome } from 'react-icons/md';

export default function SessionsList() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    lessonId: '',
    topic: '',
    date: '',
    summary: '',
  });
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsData, lessonsData, studentsData] = await Promise.all([
        user?.role === 'mentor' ? getMentorSessions() : getSessions(),
        user?.role === 'mentor' ? getMentorLessons() : [],
        user?.role === 'parent' ? getStudents() : [],
      ]);
      setSessions(sessionsData);
      setLessons(lessonsData);
      setStudents(studentsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lessonId || !formData.topic || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await updateSession(editingId, formData);
        toast.success('Session updated successfully!');
      } else {
        await createSession(formData);
        toast.success('Session created successfully!');
      }
      setFormData({ lessonId: '', topic: '', date: '', summary: '' });
      setEditingId(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save session');
    }
  };

  const handleEdit = (session) => {
    setEditingId(session._id);
    setFormData({
      lessonId: session.lessonId._id,
      topic: session.topic,
      date: session.date.split('T')[0],
      summary: session.summary || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    try {
      await deleteSession(id);
      setSessions(sessions.filter((s) => s._id !== id));
      toast.success('Session deleted');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const handleJoinSession = async (sessionId, studentId) => {
    try {
      await joinSession(sessionId, studentId);
      toast.success('You joined the session!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join session');
    }
  };

  const handleLeaveSession = async (sessionId, studentId) => {
    try {
      await leaveSession(sessionId, studentId);
      toast.success('You left the session');
      fetchData();
    } catch (error) {
      toast.error('Failed to leave session');
    }
  };

  const isStudentAttending = (session, studentId) => {
    return session.attendees?.includes(studentId);
  };



  if (loading) {
    return <div className="p-4 text-center text-sage-600 sm:p-6 lg:p-8">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forest-700 sm:text-4xl">
            {user?.role === 'mentor' ? 'My Sessions' : 'Sessions'}
          </h1>
          <p className="text-sage-600 mt-2">
            {user?.role === 'mentor' 
              ? 'Manage your lesson sessions' 
              : 'Join sessions to attend lessons'}
          </p>
        </div>
        {user?.role === 'mentor' && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ lessonId: '', topic: '', date: '', summary: '' });
              setShowForm(!showForm);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-forest-600 px-5 py-3 font-semibold text-cream-50 transition hover:bg-forest-700 sm:w-auto"
          >
            <MdAdd /> Create Session
          </button>
        )}
      </div>

      {/* Create/Edit Session Form */}
      {showForm && user?.role === 'mentor' && (
        <div className="mb-8 rounded-xl border-2 border-forest-600 bg-white p-5 shadow-lg sm:p-8">
          <h2 className="text-2xl font-bold text-forest-700 mb-6">
            {editingId ? 'Edit Session' : 'Create New Session'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-forest-700 mb-2">
                  Select Lesson *
                </label>
                <select
                  name="lessonId"
                  value={formData.lessonId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
                >
                  <option value="">-- Choose a lesson --</option>
                  {lessons.map((lesson) => (
                    <option key={lesson._id} value={lesson._id}>
                      {lesson.title || `Lesson ${lesson._id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest-700 mb-2">
                  Session Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">
                Topic / Title *
              </label>
              <input
                type="text"
                name="topic"
                placeholder="e.g., Chapter Review, Problem Solving Practice"
                value={formData.topic}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">
                Summary (Optional)
              </label>
              <textarea
                name="summary"
                placeholder="Add notes or summary of what will be covered..."
                value={formData.summary}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="submit"
                className="flex-1 bg-forest-600 hover:bg-forest-700 text-cream-50 py-3 rounded-lg font-semibold transition"
              >
                {editingId ? 'Update Session' : 'Create Session'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ lessonId: '', topic: '', date: '', summary: '' });
                }}
                className="flex-1 bg-sage-200 hover:bg-sage-300 text-forest-700 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions List */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {sessions.map((session) => (
          <div key={session._id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-sage-600 hover:shadow-lg transition">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-forest-700">
                  {session.lessonId?.title || 'Untitled Lesson'}
                </h3>
                <p className="text-sage-600 text-sm mt-1">
                  Attendees: {session.attendees?.length || 0}
                </p>
              </div>
              {user?.role === 'mentor' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(session)}
                    className="p-2 hover:bg-sage-100 rounded-lg transition"
                    title="Edit"
                  >
                    <MdEdit className="w-5 h-5 text-sage-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(session._id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition"
                    title="Delete"
                  >
                    <MdDelete className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-sage-600">
              <p><span className="font-semibold">📚 Topic:</span> {session.topic}</p>
              <p className="flex items-center gap-2">
                <MdDateRange className="w-4 h-4" />
                <span>{new Date(session.date).toLocaleDateString()}</span>
              </p>
            </div>

            {session.summary && (
              <p className="mt-3 p-3 bg-cream-50 rounded-lg text-sage-700 text-sm">
                <span className="font-semibold">📝 Summary:</span> {session.summary}
              </p>
            )}

            {/* Attend Session - Only for Parents/Students */}
            {user?.role === 'parent' && students.length > 0 && (
              <div className="mt-4 space-y-2">
                {students.map((student) => {
                  const isAttending = isStudentAttending(session, student._id);
                  return (
                    <button
                      key={student._id}
                      onClick={() =>
                        isAttending
                          ? handleLeaveSession(session._id, student._id)
                          : handleJoinSession(session._id, student._id)
                      }
                      className={`w-full py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                        isAttending
                          ? 'bg-red-600 hover:bg-red-700 text-cream-50'
                          : 'bg-forest-600 hover:bg-forest-700 text-cream-50'
                      }`}
                    >
                      {isAttending ? (
                        <>
                          <MdLogout className="w-4 h-4" /> Leave for {student.name}
                        </>
                      ) : (
                        <>
                          <MdAdd className="w-4 h-4" /> Attend for {student.name}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="mt-12 text-center text-sage-600 py-12 bg-cream-50 rounded-xl">
          {user?.role === 'mentor' 
            ? 'No sessions created yet. Click "Create Session" to get started.' 
            : 'No sessions available yet.'}
        </div>
      )}
    </div>
  );
}
