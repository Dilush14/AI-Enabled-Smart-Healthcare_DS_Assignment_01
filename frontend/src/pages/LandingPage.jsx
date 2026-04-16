import { Activity, Shield, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-50/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold text-text tracking-tight mb-8">
              Modern Healthcare, <span className="text-primary block mt-2">Anytime, Anywhere.</span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with top medical professionals, book appointments seamlessly, and access telemedicine consultations from the comfort of your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-primary/30 hover:-translate-y-1">
                Get Started Today
              </Link>
              <Link to="/doctors" className="bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-md">
                Find a Doctor
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
            <div>
              <div className="text-4xl font-bold mb-2">15k+</div>
              <div className="text-primary-100 font-medium">Active Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-100 font-medium">Verified Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50k+</div>
              <div className="text-primary-100 font-medium">Consultations</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-primary-100 font-medium">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-text mb-4">Why Choose MedikaLine?</h2>
            <p className="text-lg text-gray-500">We provide a comprehensive platform designed to make healthcare accessible, efficient, and secure.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 inset-shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Top Specialists</h3>
              <p className="text-gray-500">Access a wide network of highly qualified and thoroughly verified medical professionals across various specialties.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Secure & Private</h3>
              <p className="text-gray-500">Your medical data is encrypted and stored securely following the highest HIPAA compliance standards.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">24/7 Availability</h3>
              <p className="text-gray-500">Book appointments seamlessly at any time. Get immediate care through our telemedicine features.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Are you a healthcare professional?</h2>
            <p className="text-lg text-primary-50 mb-10 max-w-2xl mx-auto relative z-10">
              Join our network of elite doctors. Expand your practice, manage appointments efficiently, and offer telemedicine services to patients nationwide.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg relative z-10">
              Join as a Doctor
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
