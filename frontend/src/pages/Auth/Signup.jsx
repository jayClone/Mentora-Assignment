import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signup } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'parent',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { user, token } = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setAuth(user, token);
      toast.success('Account created successfully!');
      // Redirect to role-specific dashboard
      const redirectPath = user.role === 'parent' ? '/parent-dashboard' : '/mentor-dashboard';
      navigate(redirectPath);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-sage-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-forest-700">
            🌿 Join Mentora
          </h2>
          <p className="mt-2 text-center text-sage-600">Create your account to get started</p>
        </div>
        <form className="mt-8 space-y-6 bg-white rounded-2xl shadow-lg p-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-forest-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 border-2 border-sage-200 placeholder-sage-400 text-forest-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-forest-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 border-2 border-sage-200 placeholder-sage-400 text-forest-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-forest-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 border-2 border-sage-200 placeholder-sage-400 text-forest-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-forest-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                required
                className="w-full px-4 py-3 border-2 border-sage-200 placeholder-sage-400 text-forest-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-forest-700 mb-2">
                I am a
              </label>
              <select
                id="role"
                name="role"
                className="w-full px-4 py-3 border-2 border-sage-200 text-forest-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition bg-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="parent">Parent</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-cream-50 bg-forest-600 hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sage-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-sage-600">Already have an account?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-3 px-4 border-2 border-sage-600 text-sm font-semibold rounded-lg text-forest-700 bg-white hover:bg-sage-50 transition"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
