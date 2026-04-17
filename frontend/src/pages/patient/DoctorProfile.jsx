import { Star, MapPin, Clock, Award, Shield, ChevronLeft, Calendar, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DoctorService } from '../../services/api';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await DoctorService.getDoctorById(id);
        setDoctor(response);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadDoctor();
    }
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-4xl py-12 text-gray-500">Loading doctor profile...</div>;
  }

  if (error) {
    return <div className="mx-auto max-w-4xl py-12 text-red-600">{error}</div>;
  }

  if (!doctor) {
    return <div className="mx-auto max-w-4xl py-12 text-gray-500">Doctor not found.</div>;
  }

  const displayName = doctor.userId?.name || doctor.name || 'Doctor';
  const profileImage = doctor.userId?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0EA5E9&color=fff&size=256`;
  const location = doctor.userId?.address || 'Location not provided';
  const rating = doctor.rating || 4.9;
  const reviews = doctor.reviews || 0;
  const patients = doctor.patients || 'N/A';
  const about = doctor.about || 'Doctor profile information is not available yet.';
  const availability = Array.isArray(doctor.availability) ? doctor.availability : [];

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
                src={profileImage} 
                alt={displayName} 
                className="w-32 h-32 rounded-3xl border-4 border-white object-cover bg-white shadow-lg"
              />
              <span className="absolute bottom-2 right-2 bg-green-500 border-2 border-white w-5 h-5 rounded-full"></span>
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-text flex items-center gap-2">
                    {displayName} <Shield className="w-6 h-6 text-accent fill-accent/20" />
                  </h1>
                  <p className="text-lg text-primary font-medium mt-1">{doctor.specialization}</p>
                </div>
                <Link to={`/patient/book/${doctor._id || doctor.id}`} className="bg-primary hover:bg-secondary text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm shadow-primary/30 w-full md:w-auto text-center flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
            <div>
              <div className="flex items-center justify-center text-text font-bold text-xl mb-1 gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> {rating}
              </div>
              <p className="text-sm font-medium text-gray-500">{reviews} Reviews</p>
            </div>
            <div>
              <div className="flex items-center justify-center text-text font-bold text-xl mb-1 gap-1">
                <Clock className="w-5 h-5 text-gray-400" /> {doctor.experience || 0}
              </div>
              <p className="text-sm font-medium text-gray-500">Years Exp.</p>
            </div>
            <div>
              <div className="flex items-center justify-center text-text font-bold text-xl mb-1 gap-1">
                <User className="w-5 h-5 text-blue-400" /> {patients}
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
            <p className="text-gray-600 leading-relaxed text-lg">{about}</p>
            
            <h3 className="text-lg font-bold text-text mt-8 mb-4">Working Time</h3>
            <div className="space-y-3">
              {availability.length > 0 ? availability.map((slot, index) => (
                <div key={`${slot.day}-${index}`} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-b-0 last:pb-0">
                  <span className="text-gray-500 font-medium capitalize">{slot.day}</span>
                  <span className="text-text font-bold">{slot.startTime} - {slot.endTime}</span>
                </div>
              )) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Availability not set</span>
                  <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-lg text-sm">N/A</span>
                </div>
              )}
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
                <p className="text-sm text-gray-500 leading-relaxed">{location}</p>
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
