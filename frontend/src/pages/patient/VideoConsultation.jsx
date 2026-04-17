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

        const paymentStatus = (appointmentData.paymentStatus || 'pending').toLowerCase();
        if (paymentStatus !== 'completed') {
          throw new Error('Payment is required before starting this video consultation. Please complete payment first.');
        }

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
          <div className="space-y-3">
            <p>{error}</p>
            {appointment && (appointment.paymentStatus || '').toLowerCase() !== 'completed' && (
              <Link
                to={`/patient/payments/${appointmentId}`}
                className="inline-flex items-center bg-primary hover:bg-secondary text-white px-4 py-2 rounded-xl font-bold transition-colors"
              >
                Pay Now
              </Link>
            )}
          </div>
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

        {session && (
          <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-text mb-4">Doctor Notes & Prescription</h2>

            {!session?.consultationNotes
              && !session?.prescription?.diagnosis
              && !session?.prescription?.medication
              && !session?.prescription?.followUpAdvice ? (
              <p className="text-sm text-gray-500">Your doctor has not shared notes or prescription details yet.</p>
            ) : (
              <div className="space-y-4">
                {session?.consultationNotes ? (
                  <div>
                    <h3 className="text-sm font-bold text-text mb-1">Consultation Notes</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.consultationNotes}</p>
                  </div>
                ) : null}

                {session?.prescription?.diagnosis ? (
                  <div>
                    <h3 className="text-sm font-bold text-text mb-1">Diagnosis</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.prescription.diagnosis}</p>
                  </div>
                ) : null}

                {session?.prescription?.medication ? (
                  <div>
                    <h3 className="text-sm font-bold text-text mb-1">Medication</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.prescription.medication}</p>
                  </div>
                ) : null}

                {session?.prescription?.followUpAdvice ? (
                  <div>
                    <h3 className="text-sm font-bold text-text mb-1">Follow-up Advice</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.prescription.followUpAdvice}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
