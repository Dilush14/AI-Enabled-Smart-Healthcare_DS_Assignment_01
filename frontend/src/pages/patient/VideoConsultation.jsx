import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import TelemedicineRoom from '../../components/TelemedicineRoom';
import { AppointmentService, TelemedicineService } from '../../services/api';

export default function VideoConsultation() {
  const { id: appointmentId } = useParams();
  const [session, setSession] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        setLoading(true);
        setError('');

        const appointmentsResponse = await AppointmentService.getAppointments();
        const appointments = Array.isArray(appointmentsResponse)
          ? appointmentsResponse
          : Array.isArray(appointmentsResponse?.data)
            ? appointmentsResponse.data
            : [];

        const appointmentData = appointments.find((item) => item._id === appointmentId);
        if (!appointmentData) {
          throw new Error('Appointment not found');
        }

        setAppointment(appointmentData);

        let sessionData = null;
        try {
          const existingSessionResponse = await TelemedicineService.getSessionByAppointment(appointmentId);
          sessionData = existingSessionResponse?.data || null;
        } catch {
          sessionData = null;
        }

        if (!sessionData) {
          const createResponse = await TelemedicineService.createSession({
            appointmentId,
            patientId: appointmentData.patientId?._id || user?.id,
            doctorId: appointmentData.doctorId?._id || appointmentData.doctorId,
          });
          sessionData = createResponse?.data || createResponse;
        }

        setSession(sessionData);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load consultation');
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500">Loading consultation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col">
      <Link to="/patient/dashboard" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors font-medium">
        <ChevronLeft className="w-5 h-5 mr-1" /> Back
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex-1 w-full max-w-6xl mx-auto overflow-auto">
        {session?.meetingLink ? (
          <TelemedicineRoom
            sessionId={session._id}
            meetingLink={session.meetingLink}
            patientName={user?.name || 'Patient'}
            doctorName={appointment?.doctorId?.name || 'Doctor'}
          />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-500">
            Consultation room is not available yet.
          </div>
        )}
      </div>
    </div>
  );
}
