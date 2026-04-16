import { Calendar, Clock, Video, FileText, CheckCircle2, XCircle, MoreVertical, MapPin } from 'lucide-react';

export default function AppointmentCard({ appointment, role = 'patient' }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Upcoming': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Completed': return 'bg-green-50 text-green-600 border-green-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Upcoming': return <Clock className="w-4 h-4" />;
      case 'Completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center gap-1.5 ${getStatusColor(appointment.status)}`}>
          {getStatusIcon(appointment.status)}
          {appointment.status}
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <img 
          src={role === 'patient' 
            ? appointment.doctorImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.doctorName)}&background=0EA5E9&color=fff`
            : appointment.patientImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.patientName)}&background=f3f4f6&color=1E293B`} 
          alt={role === 'patient' ? appointment.doctorName : appointment.patientName} 
          className="w-14 h-14 rounded-2xl object-cover border border-gray-100 bg-gray-50"
        />
        <div>
          <h4 className="font-bold text-lg text-text">
            {role === 'patient' ? appointment.doctorName : appointment.patientName}
          </h4>
          <p className="text-secondary text-sm font-medium">
            {role === 'patient' ? appointment.specialty : appointment.patientAge}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
          <div className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium">{appointment.date}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
          <div className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium">{appointment.time}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
          <div className="bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm">
            {appointment.type.includes('Video') ? <Video className="w-4 h-4 text-accent" /> : <MapPin className="w-4 h-4 text-primary" />}
          </div>
          <span className="text-sm font-medium">{appointment.type}</span>
        </div>
      </div>

      {appointment.status === 'Upcoming' && appointment.type.includes('Video') && (
        <button className="w-full bg-accent hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-accent/20">
          <Video className="w-5 h-5" />
          Join Consultation
        </button>
      )}
      
      {appointment.status === 'Completed' && (
        <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <FileText className="w-5 h-5" />
          View Prescription
        </button>
      )}
    </div>
  );
}
