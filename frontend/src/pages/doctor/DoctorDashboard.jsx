import { Users, Calendar, Clock, DollarSign, Bell, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const todayAppointments = [
    {
      id: 1,
      patientName: 'John Doe',
      age: '32 yrs',
      time: '09:00 AM',
      type: 'Video Consult',
      status: 'Completed',
      image: 'https://ui-avatars.com/api/?name=John+Doe&background=f3f4f6&color=1E293B'
    },
    {
      id: 2,
      patientName: 'Alice Smith',
      age: '28 yrs',
      time: '10:30 AM',
      type: 'Clinic Visit',
      status: 'In Progress',
      image: 'https://ui-avatars.com/api/?name=Alice+Smith&background=f3f4f6&color=1E293B'
    },
    {
      id: 3,
      patientName: 'Robert Johnson',
      age: '45 yrs',
      time: '02:00 PM',
      type: 'Video Consult',
      status: 'Upcoming',
      image: 'https://ui-avatars.com/api/?name=Robert+Johnson&background=f3f4f6&color=1E293B'
    }
  ];

  const pendingRequests = [
    { id: 4, name: 'Emma Wilson', date: 'Oct 25', time: '11:00 AM', type: 'Video Consult' },
    { id: 5, name: 'Michael Brown', date: 'Oct 26', time: '09:30 AM', type: 'Clinic Visit' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Welcome back, Dr. Jenkins!</h1>
          <p className="text-gray-500 mt-1">You have 8 patients scheduled for today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-green-700 text-sm">Online</span>
          </div>
          <button className="bg-white p-2 border border-gray-200 rounded-xl text-gray-600 hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100/50">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Patients</p>
          <h3 className="text-2xl font-bold text-text mt-1">1,245</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-3 rounded-xl border border-green-100/50">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Today's Appts</p>
          <h3 className="text-2xl font-bold text-text mt-1">8</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-100/50">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Pending Requests</p>
          <h3 className="text-2xl font-bold text-text mt-1">5</h3>
        </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100/50">
              <DollarSign className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Today's Revenue</p>
          <h3 className="text-2xl font-bold text-text mt-1">$450.00</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-text">Today's Schedule</h2>
              <button className="text-primary text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-50">
              {todayAppointments.map(app => (
                <div key={app.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 border-r border-gray-100 pr-6 w-32">
                    <span className="font-bold text-text whitespace-nowrap">{app.time}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-1 px-6">
                    <img src={app.image} alt={app.patientName} className="w-12 h-12 rounded-full border border-gray-200" />
                    <div>
                      <h4 className="font-bold text-text">{app.patientName}</h4>
                      <p className="text-sm text-gray-500">{app.age} • {app.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      app.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' :
                      app.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {app.status}
                    </span>
                    {app.status === 'In Progress' && (
                       <Link to={`/doctor/consultation/${app.id}`} className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                        Join Call
                      </Link>
                    )}
                    {app.status === 'Upcoming' && (
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-text">Appointment Requests</h2>
            </div>
            <div className="divide-y divide-gray-50">
               {pendingRequests.map(req => (
                 <div key={req.id} className="p-5">
                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h4 className="font-bold text-text">{req.name}</h4>
                       <p className="text-xs text-gray-500 mt-0.5">{req.type}</p>
                     </div>
                     <div className="text-right">
                       <span className="block text-sm font-bold text-text">{req.date}</span>
                       <span className="block text-xs text-primary font-medium">{req.time}</span>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors">
                       <CheckCircle className="w-4 h-4" /> Accept
                     </button>
                     <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors">
                       <XCircle className="w-4 h-4" /> Decline
                     </button>
                   </div>
                 </div>
               ))}
            </div>
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              <button className="w-full text-primary font-bold text-sm hover:underline">View all requests (5)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
