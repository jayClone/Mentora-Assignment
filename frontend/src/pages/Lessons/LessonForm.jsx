import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createLesson, updateLesson } from '../../services/lessons';

export default function LessonForm({ lesson, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        description: lesson.description,
      });
    }
  }, [lesson]);

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
      if (lesson) {
        await updateLesson(lesson._id, formData);
        toast.success('Lesson updated');
      } else {
        await createLesson(formData);
        toast.success('Lesson created');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream-50 rounded-xl shadow-md p-8 mb-8 max-w-md border-2 border-sage-200">
      <h2 className="text-2xl font-bold text-forest-700 mb-6">
        {lesson ? 'Edit Lesson' : 'Create New Lesson'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-forest-700 mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-sage-200 rounded-lg text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-forest-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            required
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-sage-200 rounded-lg text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest-600 text-cream-50 py-3 rounded-lg hover:bg-forest-700 disabled:opacity-50 font-semibold transition"
        >
          {loading ? 'Saving...' : 'Save Lesson'}
        </button>
      </form>
    </div>
  );
}
