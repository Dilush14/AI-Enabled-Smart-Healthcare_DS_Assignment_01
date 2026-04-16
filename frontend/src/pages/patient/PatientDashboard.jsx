import { useEffect, useMemo, useState } from 'react';
import { Calendar, User, FileText, Search, Bell } from 'lucide-react';
import { AppointmentService, DoctorService } from '../../services/api';
import AppointmentCard from '../../components/AppointmentCard';

export default function PatientDashboard() {
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [appointments, setAppointments] = useState([]);
  const [doctorsById, setDoctorsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await AppointmentService.getAppointments();
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setAppointments(list);

      // If appointment records only store doctorId as a string/ObjectId,
      // resolve doctor profile details once for card rendering.
      const doctorsResponse = await DoctorService.getDoctors();
      const doctorsList = Array.isArray(doctorsResponse)
        ? doctorsResponse
        : Array.isArray(doctorsResponse?.value)
          ? doctorsResponse.value
          : Array.isArray(doctorsResponse?.data)
            ? doctorsResponse.data
            : [];

      const dictionary = doctorsList.reduce((acc, doctor) => {
        const key = doctor?._id || doctor?.id;
        if (key) {
          acc[key] = doctor;
        }
        return acc;
      }, {});

      setDoctorsById(dictionary);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const formatDate = (value) => {
    if (!value) return 'Date not set';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const mapStatus = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'completed') return 'Completed';
    if (normalized === 'cancelled') return 'Cancelled';
    return 'Upcoming';
  };

  const mappedAppointments = useMemo(
    () =>
      appointments.map((app) => {
        const appointmentDoctor = app.doctorId && typeof app.doctorId === 'object' ? app.doctorId : null;
        const doctorLookupId = typeof app.doctorId === 'string' ? app.doctorId : app.doctorId?._id;
        const lookedUpDoctor = doctorLookupId ? doctorsById[doctorLookupId] : null;
        const doctor = appointmentDoctor || lookedUpDoctor || {};

        const notes = (app.notes || '').toLowerCase();
        const type = app.type
          || app.appointmentType
          || (notes.includes('clinic visit') || notes.includes('in-person') ? 'Clinic Visit' : 'Video Consult');

        const doctorName = doctor.userId?.name || doctor.name || app.doctorName || 'Doctor';
        const specialty = doctor.specialization || app.specialization || 'Specialist';
        const doctorImage = doctor.userId?.profilePhotoUrl || doctor.profileImage;

        return {
          id: app._id,
          doctorName,
          specialty,
          date: formatDate(app.date),
          time: app.time || 'Time not set',
          type,
          status: mapStatus(app.status),
          doctorImage,
        };
      }),
    [appointments, doctorsById]
  );

  const upcomingAppointments = mappedAppointments.filter((app) => app.status === 'Upcoming');
  const pastAppointments = mappedAppointments.filter((app) => app.status !== 'Upcoming');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Good morning, {currentUser?.name || 'Patient'}!</h1>
          <p className="text-gray-500 mt-1">Here is your health overview for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-64 bg-white"
            />
          </div>
          <button className="bg-white p-2 border border-gray-200 rounded-xl text-gray-600 hover:text-primary transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100/50">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Upcoming</p>
            <h3 className="text-xl font-bold text-text">{upcomingAppointments.length} Appointments</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl border border-green-100/50">
            <User className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Consulted</p>
            <h3 className="text-xl font-bold text-text">{new Set(mappedAppointments.map((app) => app.doctorName)).size} Doctors</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-xl border border-purple-100/50">
            <FileText className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Reports</p>
            <h3 className="text-xl font-bold text-text">5 Documents</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 bg-gradient-to-r from-primary to-secondary text-white border-transparent">
          <div>
            <p className="text-primary-100 text-sm font-medium">Need help?</p>
            <h3 className="font-bold mb-1">Book new visit</h3>
            <button className="text-xs bg-white text-primary px-3 py-1 rounded-lg font-bold shadow-sm">Find Doctor</button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-text">Upcoming Appointments</h2>
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          {loading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-gray-500">Loading appointments...</div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-gray-500">No upcoming appointments.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {upcomingAppointments.map((app) => (
                <AppointmentCard key={app.id} appointment={app} role="patient" />
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-8 mb-2">
            <h2 className="text-lg font-bold text-text">Recent History</h2>
          </div>
          {loading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-gray-500">Loading history...</div>
          ) : pastAppointments.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 text-gray-500">No past appointments yet.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {pastAppointments.map((app) => (
                <AppointmentCard key={app.id} appointment={app} role="patient" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-text">Health Reminders</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-4">
                <div className="w-1.5 bg-accent rounded-full shrink-0"></div>
                <div>
                  <h4 className="font-bold text-sm text-text">Take Vitamin C</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Everyday after breakfast</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 bg-blue-500 rounded-full shrink-0"></div>
                <div>
                  <h4 className="font-bold text-sm text-text">Drink Water</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Goal: 2.5 Liters daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
