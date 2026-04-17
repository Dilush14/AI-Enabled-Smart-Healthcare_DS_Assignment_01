import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, FileText, CheckCircle2, XCircle, MoreVertical, MapPin } from 'lucide-react';

export default function AppointmentCard({ appointment, role = 'patient' }) {
  const navigate = useNavigate();
  const paymentStatus = (appointment.paymentStatus || 'pending').toLowerCase();
  const [showMenu, setShowMenu] = useState(false);
  const isPatientActionsVisible = role === 'patient' && (appointment.canCancel || appointment.canPay);

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

  const getPaymentStatusBadge = () => {
    if (paymentStatus === 'completed') {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (paymentStatus === 'failed') {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const getPaymentStatusLabel = () => {
    if (paymentStatus === 'completed') return 'Paid';
    if (paymentStatus === 'failed') return 'Payment Failed';
    return 'Payment Pending';
  };

  const canJoinConsultation = appointment.status === 'Upcoming' && appointment.type.includes('Video') && paymentStatus === 'completed';
  const needsPaymentForConsultation = appointment.status === 'Upcoming' && appointment.type.includes('Video') && paymentStatus !== 'completed';

  const handleJoinConsultation = () => {
    const appointmentId = appointment.id || appointment._id;
    if (!appointmentId) return;
    navigate(`/patient/consultation/${appointmentId}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center gap-1.5 ${getStatusColor(appointment.status)}`}>
          {getStatusIcon(appointment.status)}
          {appointment.status}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && isPatientActionsVisible && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-2 space-y-1">
              {appointment.canPay && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    appointment.onPay?.();
                  }}
                  disabled={appointment.actionLoading}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 text-primary font-semibold disabled:opacity-60"
                >
                  {appointment.actionLoading ? 'Processing...' : 'Pay'}
                </button>
              )}
              {appointment.canCancel && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    appointment.onCancel?.();
                  }}
                  disabled={appointment.actionLoading}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-600 font-semibold disabled:opacity-60"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
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
        <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold ${getPaymentStatusBadge()}`}>
          {getPaymentStatusLabel()}
        </div>
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

      {canJoinConsultation && (
        <button 
          onClick={handleJoinConsultation}
          className="w-full bg-accent hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-accent/20"
        >
          <Video className="w-5 h-5" />
          Join Consultation
        </button>
      )}

      {needsPaymentForConsultation && (
        <button
          onClick={() => appointment.onPay?.()}
          className="w-full bg-primary hover:bg-secondary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shadow-primary/20"
        >
          <Video className="w-5 h-5" />
          Pay to Join Consultation
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
