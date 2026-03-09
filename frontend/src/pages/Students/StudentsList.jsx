import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getStudents, deleteStudent } from '../../services/students';
import StudentForm from './StudentForm';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await deleteStudent(id);
      setStudents(students.filter((s) => s._id !== id));
      toast.success('Student deleted');
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingStudent(null);
    fetchStudents();
  };

  if (loading) {
    return <div className="p-8 text-center text-sage-600">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-forest-700">My Students</h1>
          <p className="text-sage-600 mt-2">Manage and track your students</p>
        </div>
        <button
          onClick={() => {
            setEditingStudent(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-forest-600 text-cream-50 px-6 py-3 rounded-lg hover:bg-forest-700 font-semibold transition"
        >
          <MdAdd /> {showForm ? 'Cancel' : 'Add Student'}
        </button>
      </div>

      {showForm && (
        <StudentForm student={editingStudent} onClose={handleFormClose} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <div key={student._id} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-forest-600 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-forest-700">{student.name}</h3>
            <p className="text-sage-600 mt-2">Age: {student.age}</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingStudent(student);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 flex-1 bg-sage-600 text-cream-50 px-3 py-2 rounded-lg hover:bg-sage-700 font-medium transition text-sm"
              >
                <MdEdit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(student._id)}
                className="flex items-center gap-2 flex-1 bg-red-600 text-cream-50 px-3 py-2 rounded-lg hover:bg-red-700 font-medium transition text-sm"
              >
                <MdDelete className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && !showForm && (
        <div className="text-center text-sage-600 py-12 bg-cream-50 rounded-xl">
          No students yet. Add one to get started!
        </div>
      )}
    </div>
  );
}
