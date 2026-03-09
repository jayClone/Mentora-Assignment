import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createStudent, updateStudent } from '../../services/students';

export default function StudentForm({ student, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        age: student.age,
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        await updateStudent(student._id, formData);
        toast.success('Student updated');
      } else {
        await createStudent(formData);
        toast.success('Student created');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream-50 rounded-xl shadow-md p-8 mb-8 max-w-md border-2 border-sage-200">
      <h2 className="text-2xl font-bold text-forest-700 mb-6">
        {student ? 'Edit Student' : 'Add New Student'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-forest-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-sage-200 rounded-lg text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-forest-700 mb-2">
            Age
          </label>
          <input
            type="number"
            name="age"
            required
            min="1"
            value={formData.age}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-sage-200 rounded-lg text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest-600 text-cream-50 py-3 rounded-lg hover:bg-forest-700 disabled:opacity-50 font-semibold transition"
        >
          {loading ? 'Saving...' : 'Save Student'}
        </button>
      </form>
    </div>
  );
}
