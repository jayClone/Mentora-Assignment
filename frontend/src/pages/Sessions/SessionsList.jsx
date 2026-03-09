import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSessions, getMentorSessions, deleteSession, createSession, joinSession, leaveSession, updateSession } from '../../services/sessions';
import { getMentorLessons } from '../../services/lessons';
import { getStudents } from '../../services/students';
import { summarizeText } from '../../services/llm';
import { useAuthStore } from '../../store/authStore';
import { MdDateRange, MdDelete, MdAdd, MdEdit, MdLogout, MdAutoAwesome } from 'react-icons/md';

export default function SessionsList() {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [summarizing, setSummarizing] = useState({});
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

  const handleSummarize = async (session) => {
    const text = `Topic: ${session.topic}. ${session.summary || ''}`;
    if (text.trim().length < 50) {
      toast.error('Session needs more content to summarize (at least 50 characters)');
      return;
    }
    setSummarizing((prev) => ({ ...prev, [session._id]: true }));
    try {
      const data = await summarizeText({ text });
      setSummaries((prev) => ({ ...prev, [session._id]: data.summary }));
    } catch (error) {
      const msg = error.response?.data?.message || 'Summarization failed';
      toast.error(msg);
    } finally {
      setSummarizing((prev) => ({ ...prev, [session._id]: false }));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sage-600">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-forest-700">
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
            className="bg-forest-600 hover:bg-forest-700 text-cream-50 px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition"
          >
            <MdAdd /> Create Session
          </button>
        )}
      </div>

      {/* Create/Edit Session Form */}
      {showForm && user?.role === 'mentor' && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-forest-600">
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

            <div className="flex gap-4">
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
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <div key={session._id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-sage-600 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
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

            {/* AI Summarize Button - Parents only */}
            {user?.role === 'parent' && (
              <>
                <button
                  onClick={() => handleSummarize(session)}
                  disabled={summarizing[session._id]}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-sage-100 hover:bg-sage-200 text-forest-700 py-2 rounded-lg font-medium transition text-sm disabled:opacity-50"
                >
                  <MdAutoAwesome className="w-4 h-4" />
                  {summarizing[session._id] ? 'Summarizing...' : 'AI Summarize'}
                </button>

                {summaries[session._id] && (
                  <div className="mt-3 p-4 bg-forest-50 border border-forest-200 rounded-lg">
                    <p className="text-xs font-semibold text-forest-600 mb-2 flex items-center gap-1">
                      <MdAutoAwesome className="w-3 h-3" /> AI Summary
                    </p>
                    <p className="text-sage-700 text-sm whitespace-pre-line">{summaries[session._id]}</p>
                  </div>
                )}
              </>
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
