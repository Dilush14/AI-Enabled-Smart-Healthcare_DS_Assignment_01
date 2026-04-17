import { Activity, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { UserService } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await UserService.forgotPassword(email);
      setSuccess(response?.message || 'If an account exists with this email, a password reset email has been sent.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="bg-primary/10 p-3 rounded-2xl hover:bg-primary/20 transition-colors">
            <Activity className="w-10 h-10 text-primary" />
          </Link>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-text tracking-tight">Forgot Password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Enter your account email to reset your password.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
          {error && (
            <p className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          {success && (
            <p className="mb-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-gray-200 rounded-xl h-12 bg-gray-50 border outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm shadow-primary/30 text-sm font-bold text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-secondary">Back to Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
