import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Client-side validation
  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { user, token } = await login({ email, password });
      setAuth(user, token);
      toast.success('Login successful!');

      const redirectPath = user.role === 'parent' ? '/parent-dashboard' : '/mentor-dashboard';
      navigate(redirectPath);
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400) {
        setError(message || 'Please check your email and password');
      } else if (status === 401) {
        setError('Email or password is incorrect. Please try again.');
      } else if (status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
      
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-sage-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-forest-700">
            🌿 Welcome Back
          </h2>
          <p className="mt-2 text-center text-sage-600">Sign in to your Mentora account</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6 bg-white rounded-2xl shadow-lg p-8" onSubmit={handleSubmit}>
          <div className="rounded-lg space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-forest-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className={`w-full px-4 py-3 border-2 placeholder-sage-400 text-forest-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition ${
                  error ? 'border-red-500' : 'border-sage-200'
                }`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-forest-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className={`w-full px-4 py-3 border-2 placeholder-sage-400 text-forest-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition ${
                  error ? 'border-red-500' : 'border-sage-200'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-cream-50 bg-forest-600 hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sage-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-sage-600">New to Mentora?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="w-full flex justify-center py-3 px-4 border-2 border-sage-600 text-sm font-semibold rounded-lg text-forest-700 bg-white hover:bg-sage-50 transition"
          >
            Create an account
          </button>
        </form>
      </div>
    </div>
  );
}
