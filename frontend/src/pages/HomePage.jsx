import { useNavigate } from 'react-router-dom';
import { MdSchool, MdPeople, MdPerson, MdAutoAwesome } from 'react-icons/md';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Navbar */}
      <nav className="bg-forest-700 text-cream-50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-cream-100">
                🌿 Mentora
              </h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 rounded-lg text-forest-700 bg-cream-100 hover:bg-cream-200 font-semibold transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2 rounded-lg bg-sage-500 hover:bg-sage-600 text-cream-50 font-semibold transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-700/10 to-sage-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-forest-700 mb-6">
              Welcome to Mentora
            </h2>
            <p className="text-xl text-sage-700 mb-8 max-w-3xl mx-auto">
              Connect with experienced mentors and students. Learn, grow, and achieve your goals through personalized tutoring sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 rounded-lg bg-forest-600 hover:bg-forest-700 text-cream-50 font-semibold text-lg transition transform hover:scale-105"
              >
                Start Learning Today
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-lg border-2 border-forest-600 text-forest-600 hover:bg-forest-50 font-semibold text-lg transition"
              >
                Already a Member?
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-forest-700 mb-16">
            Why Choose Mentora?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border-t-4 border-forest-600">
              <div className="flex justify-center mb-4">
                <MdPerson className="text-4xl text-forest-600" />
              </div>
              <h4 className="text-xl font-bold text-forest-700 text-center mb-3">
                Expert Mentors
              </h4>
              <p className="text-sage-700 text-center">
                Learn from experienced professionals who are passionate about teaching and sharing knowledge.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border-t-4 border-sage-500">
              <div className="flex justify-center mb-4">
                <MdSchool className="text-4xl text-sage-600" />
              </div>
              <h4 className="text-xl font-bold text-forest-700 text-center mb-3">
                Flexible Learning
              </h4>
              <p className="text-sage-700 text-center">
                Schedule lessons at your own pace. Learn whenever and wherever works best for you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border-t-4 border-cream-600">
              <div className="flex justify-center mb-4">
                <MdPeople className="text-4xl text-cream-800" />
              </div>
              <h4 className="text-xl font-bold text-forest-700 text-center mb-3">
                Community
              </h4>
              <p className="text-sage-700 text-center">
                Connect with other learners and mentors. Build meaningful relationships while learning.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition border-t-4 border-forest-600">
              <div className="flex justify-center mb-4">
                <MdAutoAwesome className="text-4xl text-forest-600" />
              </div>
              <h4 className="text-xl font-bold text-forest-700 text-center mb-3">
                AI-Powered Summaries
              </h4>
              <p className="text-sage-700 text-center">
                Get AI-generated summaries of your learning sessions to reinforce knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-forest-700 mb-16">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-forest-600 text-cream-50 rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
              </div>
              <h4 className="text-xl font-bold text-forest-700 mb-3">
                Create Account
              </h4>
              <p className="text-sage-700">
                Sign up as a student or mentor. Set up your profile with your interests and goals.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-sage-600 text-cream-50 rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
              </div>
              <h4 className="text-xl font-bold text-forest-700 mb-3">
                Find & Book
              </h4>
              <p className="text-sage-700">
                Browse lessons from mentors or create your own. Book sessions at times that work for you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-forest-600 text-cream-50 rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
              </div>
              <h4 className="text-xl font-bold text-forest-700 mb-3">
                Learn & Grow
              </h4>
              <p className="text-sage-700">
                Attend your sessions, get AI-powered summaries, and track your progress over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-forest-700 text-cream-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h3>
          <p className="text-lg text-cream-100 mb-8">
            Join thousands of students and mentors already transforming education on Mentora.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 rounded-lg bg-cream-100 hover:bg-cream-200 text-forest-700 font-semibold text-lg transition transform hover:scale-105"
            >
              Get Started Now
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-lg border-2 border-cream-100 text-cream-100 hover:bg-forest-600 font-semibold text-lg transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-800 text-cream-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h4 className="text-2xl font-bold text-cream-50 mb-2">🌿 Mentora</h4>
              <p className="text-cream-200">Connecting learners with mentors worldwide.</p>
            </div>
            <div className="mt-6 md:mt-0 text-center md:text-right text-cream-200 text-sm">
              <p>&copy; 2026 Mentora. All rights reserved.</p>
              <p className="mt-2">Empowering education through mentorship.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
