import { Calendar, User, FileText, Search, Bell } from 'lucide-react';
import AppointmentCard from '../../components/AppointmentCard';

export default function PatientDashboard() {
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Jenkins',
      specialty: 'Cardiologist',
      date: 'Today, 2:30 PM',
      time: 'In 2 hours',
      type: 'Video Consult',
      status: 'Upcoming',
      doctorImage: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=0EA5E9&color=fff'
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      specialty: 'Dermatologist',
      date: 'Tomorrow, 10:00 AM',
      time: '10:00 AM - 10:30 AM',
      type: 'Clinic Visit',
      status: 'Upcoming',
      doctorImage: 'https://ui-avatars.com/api/?name=Michael+Chen&background=0EA5E9&color=fff'
    }
  ];

  const pastAppointments = [
    {
      id: 3,
      doctorName: 'Dr. Emily Carter',
      specialty: 'General Physician',
      date: 'Aug 12, 2026',
      time: '11:15 AM',
      type: 'Video Consult',
      status: 'Completed',
      doctorImage: 'https://ui-avatars.com/api/?name=Emily+Carter&background=0EA5E9&color=fff'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Good morning, John!</h1>
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
            <h3 className="text-xl font-bold text-text">2 Appointments</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl border border-green-100/50">
            <User className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Consulted</p>
            <h3 className="text-xl font-bold text-text">12 Doctors</h3>
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
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-text">Upcoming Appointments</h2>
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {upcomingAppointments.map(app => (
              <AppointmentCard key={app.id} appointment={app} role="patient" />
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 mb-2">
            <h2 className="text-lg font-bold text-text">Recent History</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {pastAppointments.map(app => (
              <AppointmentCard key={app.id} appointment={app} role="patient" />
            ))}
          </div>
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
