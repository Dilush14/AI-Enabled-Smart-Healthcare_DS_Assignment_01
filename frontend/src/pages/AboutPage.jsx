import { Heart, Target, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-primary text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">About MedikaLine</h1>
        <p className="text-xl max-w-2xl mx-auto opacity-90">
          We're on a mission to democratize healthcare by connecting patients with world-class medical professionals through innovative technology.
        </p>
      </section>

      {/* Main Content */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold text-text mb-6">Our Vision</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              At MedikaLine, we believe that quality healthcare should be accessible to everyone, regardless of their location. Our platform bridges the gap between doctors and patients, providing a seamless experience from booking to consultation.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We leverage cutting-edge telemedicine tools to ensure that remote consultations are as effective and personal as in-person visits.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 order-1 md:order-2">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <Heart className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Patient First</h3>
              <p className="text-sm text-gray-500">Your health and privacy are our top priorities.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <Target className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Innovation</h3>
              <p className="text-sm text-gray-500">Constantly improving the healthcare experience.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
               <Award className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Excellence</h3>
              <p className="text-sm text-gray-500">Partnering with top-tier medical professionals.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <Users className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Community</h3>
              <p className="text-sm text-gray-500">Building a healthier world, together.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
