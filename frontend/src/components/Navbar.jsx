import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl text-text tracking-tight">MedikaLine</span>
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary transition-colors font-medium">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-primary transition-colors font-medium">About</Link>
            <Link to="/doctors" className="text-gray-600 hover:text-primary transition-colors font-medium">Find a Doctor</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-primary font-medium transition-colors">Login</Link>
            <Link to="/register" className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-full font-medium transition-all shadow-sm shadow-primary/30 hover:shadow-md hover:-translate-y-0.5">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
