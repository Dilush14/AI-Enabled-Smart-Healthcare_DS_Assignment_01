import { Activity, User, Mail, Lock, Briefcase, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');

  const handleRegister = (e) => {
    e.preventDefault();
    if (role === 'doctor') navigate('/doctor/dashboard');
    else navigate('/patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
           <Link to="/" className="bg-primary/10 p-3 rounded-2xl hover:bg-primary/20 transition-colors">
            <Activity className="w-10 h-10 text-primary" />
          </Link>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-text tracking-tight">Create an account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-secondary transition-colors underline-offset-2 hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
          
          <div className="flex gap-4 mb-8">
            <button 
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                role === 'patient' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              I'm a Patient
            </button>
            <button 
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                role === 'doctor' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              I'm a Doctor
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-gray-200 rounded-xl h-12 bg-gray-50 border outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-gray-200 rounded-xl h-12 bg-gray-50 border outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {role === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Medical Specialty</label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-gray-200 rounded-xl h-12 bg-gray-50 border outline-none transition-all"
                    placeholder="E.g. Cardiologist"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full pl-10 sm:text-sm border-gray-200 rounded-xl h-12 bg-gray-50 border outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm shadow-primary/30 text-sm font-bold text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5"
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
