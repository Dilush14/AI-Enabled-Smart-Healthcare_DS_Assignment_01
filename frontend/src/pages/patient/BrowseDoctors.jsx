import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import DoctorCard from '../../components/DoctorCard';
import { useEffect, useState } from 'react';
import { DoctorService } from '../../services/api';

export default function BrowseDoctors() {
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const specialties = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic', 'Dentist', 'General Physician'];

  const normalizeDoctor = (doctor) => ({
    ...doctor,
    id: doctor._id || doctor.id,
    name: doctor.userId?.name || doctor.name,
    specialty: doctor.specialization || doctor.specialty,
  });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError('');
        const params = activeSpecialty === 'All'
          ? { verified: 'true' }
          : { specialization: activeSpecialty, verified: 'true' };
        const response = await DoctorService.getDoctors(params);
        const normalizedDoctors = Array.isArray(response)
          ? response.map(normalizeDoctor)
          : [];

        setDoctors(normalizedDoctors);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [activeSpecialty]);

  const filteredDoctors = doctors;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Find a Doctor</h1>
        <p className="text-gray-500 mt-1">Search and book appointments with top specialists.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 relative z-10">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search doctors by name, specialty, or condition..." 
            className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full bg-gray-50/50"
          />
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors w-full md:w-auto">
            <SlidersHorizontal className="w-5 h-5" />
            <span className="md:hidden lg:inline">Filters</span>
          </button>
          <button className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm shadow-primary/30 w-full md:w-auto whitespace-nowrap">
            Search
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 gap-2 hide-scrollbar">
        {specialties.map(spec => (
          <button
            key={spec}
            onClick={() => setActiveSpecialty(spec)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
              activeSpecialty === spec 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      <div className="py-4">
        <p className="text-gray-500 font-medium mb-4">Showing {filteredDoctors.length} doctors</p>
        {error && <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="mb-4 text-sm text-gray-500">Loading doctors...</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map(doctor => (
            <DoctorCard key={doctor._id || doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </div>
  );
}
