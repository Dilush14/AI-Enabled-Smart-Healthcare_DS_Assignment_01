import { Activity, ArrowRight, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { UserService } from '../services/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await UserService.forgotPassword(email);
      setSuccess(response?.message || 'If an account exists with this email, a password reset OTP has been sent.');
      setStep(2);
    } catch (err) {
      setError(err?.response?.data?.message || 'OTP send could not be confirmed. If you received the OTP, continue with verification.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await UserService.verifyResetOtp(email, otp);
      setSuccess(response?.message || 'OTP verified successfully. Please set a new password.');
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await UserService.resetPassword(email, otp, password);
      setSuccess(response?.message || 'Password reset successful. You can now log in.');
      setStep(4);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password.');
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
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 && 'Enter your account email to receive a reset OTP.'}
          {step === 2 && 'Enter the OTP sent to your email.'}
          {step === 3 && 'Create your new password.'}
          {step === 4 && 'Password reset complete.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
          {error && (
            <p className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          {success && (
            <p className="mb-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>
          )}

          {step === 1 && (
            <form className="space-y-5" onSubmit={handleSendOtp}>
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
                  {loading ? 'Sending...' : 'Send OTP'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">6-digit OTP</label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-gray-200 rounded-xl h-12 bg-gray-50 border outline-none transition-all tracking-[0.3em]"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 px-4 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-2/3 flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm shadow-primary/30 text-sm font-bold text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 pr-12 sm:text-sm border-gray-200 rounded-xl h-12 bg-gray-50 border outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 pr-12 sm:text-sm border-gray-200 rounded-xl h-12 bg-gray-50 border outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm shadow-primary/30 text-sm font-bold text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Set New Password'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Your password has been updated successfully.</p>
              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-secondary shadow-sm shadow-primary/30"
              >
                Go to Sign in
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-secondary">Back to Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
