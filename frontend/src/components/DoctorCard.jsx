import { Star, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  const doctorId = doctor._id || doctor.id;
  const displayName = doctor.userId?.name || doctor.name || 'Doctor';
  const specialty = doctor.specialization || doctor.specialty || 'Specialist';
  const location = doctor.userId?.address || doctor.location || 'Location not available';
  const profileImage = doctor.userId?.profilePhotoUrl || doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0EA5E9&color=fff`;
  const rating = doctor.rating || '4.9';
  const experience = doctor.experience || 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group max-w-sm">
      <div className="flex gap-4">
        <div className="relative">
          <img 
            src={profileImage} 
            alt={displayName} 
            className="w-20 h-20 rounded-2xl object-cover bg-gray-50 border border-gray-100"
          />
          <span className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full animate-pulse"></span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-text group-hover:text-primary transition-colors line-clamp-1">{displayName}</h3>
              <p className="text-secondary text-sm font-medium">{specialty}</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-yellow-700">{rating}</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{experience} Years Exp.</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-5 border-t border-gray-50 flex gap-3">
        <Link 
          to={`/patient/doctors/${doctorId}`} 
          className="flex-1 bg-primary/5 text-primary font-semibold py-2.5 rounded-xl text-center hover:bg-primary/10 transition-colors"
        >
          View Profile
        </Link>
        <Link 
          to={`/patient/book/${doctorId}`}
          className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-xl text-center hover:bg-secondary transition-colors shadow-sm shadow-primary/20"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
