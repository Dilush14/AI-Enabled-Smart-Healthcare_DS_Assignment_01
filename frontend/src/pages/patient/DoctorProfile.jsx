import { Star, MapPin, Clock, Award, Shield, ChevronLeft, Calendar } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function DoctorProfile() {
  const { id } = useParams();

  // Mock data based on ID or default
  const doctor = {
    id: id || 1,
    name: 'Dr. Sarah Jenkins',
    specialty: 'Cardiologist',
    rating: 4.9,
    reviews: 124,
    experience: 12,
    patients: '5k+',
    about: 'Dr. Sarah Jenkins is a board-certified Cardiologist with over 12 years of experience in treating various heart conditions. She specializes in preventive cardiology and echocardiography. Known for her compassionate approach, she has helped thousands of patients maintain healthy hearts.',
    location: '123 Medical Center, New York, USA',
    image: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=0EA5E9&color=fff&size=256'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/patient/doctors" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors font-medium">
        <ChevronLeft className="w-5 h-5 mr-1" /> Back to Search
      </Link>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="h-32 bg-primary/10"></div>
        <div className="px-6 md:px-10 pb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end -mt-16">
            <div className="relative">
              <img 
                src={doctor.image} 
                alt={doctor.name} 
                className="w-32 h-32 rounded-3xl border-4 border-white object-cover bg-white shadow-lg"
              />
              <span className="absolute bottom-2 right-2 bg-green-500 border-2 border-white w-5 h-5 rounded-full"></span>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-text flex items-center gap-2">
                    {doctor.name} <Shield className="w-6 h-6 text-accent fill-accent/20" />
                  </h1>
                  <p className="text-lg text-primary font-medium mt-1">{doctor.specialty}</p>
                </div>
                <Link to={`/patient/book/${doctor.id}`} className="bg-primary hover:bg-secondary text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm shadow-primary/30 w-full md:w-auto text-center flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <div>
              <div className="flex items-center justify-center text-text font-bold text-xl mb-1 gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> {doctor.rating}
              </div>
              <p className="text-sm font-medium text-gray-500">{doctor.reviews} Reviews</p>
            </div>
            <div>
              <div className="flex items-center justify-center text-text font-bold text-xl mb-1 gap-1">
                <Clock className="w-5 h-5 text-gray-400" /> {doctor.experience}
              </div>
              <p className="text-sm font-medium text-gray-500">Years Exp.</p>
            </div>
            <div>
              <div className="flex items-center justify-center text-text font-bold text-xl mb-1 gap-1">
                <User className="w-5 h-5 text-blue-400" /> {doctor.patients}
              </div>
              <p className="text-sm font-medium text-gray-500">Patients</p>
            </div>
            <div>
              <div className="flex items-center justify-center text-text font-bold text-xl mb-1 gap-1">
                <Award className="w-5 h-5 text-purple-400" /> 15+
              </div>
              <p className="text-sm font-medium text-gray-500">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-text mb-4">About Doctor</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{doctor.about}</p>
            
            <h3 className="text-lg font-bold text-text mt-8 mb-4">Working Time</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Monday - Friday</span>
                <span className="text-text font-bold">09:00 AM - 05:00 PM</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Saturday</span>
                <span className="text-text font-bold">10:00 AM - 02:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Sunday</span>
                <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-lg text-sm">Closed</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Clinic Location</h2>
            <div className="flex gap-4">
              <div className="bg-blue-50 p-3 rounded-xl h-max border border-blue-100/50">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-text mb-1">Main Medical Center</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{doctor.location}</p>
                <button className="text-primary text-sm font-bold mt-2 hover:underline inline-flex items-center gap-1">
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Fix imports
import { User } from 'lucide-react';
