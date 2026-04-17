import { useEffect, useState } from 'react';
import { ChevronLeft, Loader2, Send, Save } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import TelemedicineRoom from '../../components/TelemedicineRoom';
import { AppointmentService, TelemedicineService } from '../../services/api';

export default function DoctorConsultation() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('notes');
  const [appointment, setAppointment] = useState(null);
  const [session, setSession] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medication, setMedication] = useState('');
  const [followUpAdvice, setFollowUpAdvice] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [panelMessage, setPanelMessage] = useState('');
  const [panelError, setPanelError] = useState('');
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

        const appointmentData = appointments.find((item) => item._id === id);
        if (!appointmentData) {
          throw new Error('Appointment not found');
        }

        setAppointment(appointmentData);

        const paymentStatus = (appointmentData.paymentStatus || 'pending').toLowerCase();
        if (paymentStatus !== 'completed') {
          throw new Error('The patient has not completed payment yet. Video consultation will be available after payment is confirmed.');
        }

        let sessionData = null;
        try {
          const existingSessionResponse = await TelemedicineService.getSessionByAppointment(id);
          sessionData = existingSessionResponse?.data || null;
        } catch {
          sessionData = null;
        }

        if (!sessionData) {
          const createResponse = await TelemedicineService.createSession({
            appointmentId: id,
            patientId: appointmentData.patientId?._id || appointmentData.patientId,
            doctorId: appointmentData.doctorId?._id || appointmentData.doctorId || user?.id,
          });
          sessionData = createResponse?.data || createResponse;
        }

        setSession(sessionData);
        setConsultationNotes(sessionData?.consultationNotes || '');
        setDiagnosis(sessionData?.prescription?.diagnosis || '');
        setMedication(sessionData?.prescription?.medication || '');
        setFollowUpAdvice(sessionData?.prescription?.followUpAdvice || '');
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load consultation');
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();
  }, [id]);

  const handleSaveNotes = async () => {
    if (!session?._id) return;

    try {
      setSavingNotes(true);
      setPanelMessage('');
      setPanelError('');

      const response = await TelemedicineService.updateConsultationNotes(session._id, consultationNotes);
      const updatedSession = response?.data || response;
      setSession(updatedSession);
      setConsultationNotes(updatedSession?.consultationNotes || consultationNotes);
      setPanelMessage('Consultation notes saved successfully.');
    } catch (err) {
      setPanelError(err?.response?.data?.message || 'Failed to save consultation notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!session?._id) return;

    try {
      setSavingPrescription(true);
      setPanelMessage('');
      setPanelError('');

      const response = await TelemedicineService.updatePrescription(session._id, {
        diagnosis,
        medication,
        followUpAdvice,
      });
      const updatedSession = response?.data || response;
      setSession(updatedSession);
      setDiagnosis(updatedSession?.prescription?.diagnosis || diagnosis);
      setMedication(updatedSession?.prescription?.medication || medication);
      setFollowUpAdvice(updatedSession?.prescription?.followUpAdvice || followUpAdvice);
      setPanelMessage('Prescription saved successfully.');
    } catch (err) {
      setPanelError(err?.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSavingPrescription(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 h-[calc(100vh-120px)] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500">Loading consultation...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative z-10 w-full">
        <Link to="/doctor/dashboard" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors font-bold">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            In Progress
          </span>
          <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-bold">
            05:23
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-full flex-1 min-h-0 w-full">
        <div className="flex-1 min-h-0 h-full w-full">
          {session?.meetingLink ? (
            <TelemedicineRoom
              sessionId={session._id}
              meetingLink={session.meetingLink}
              patientName={appointment?.patientId?.name || 'Patient'}
              doctorName={appointment?.doctorId?.name || user?.name || 'Doctor'}
            />
          ) : (
            <div className="w-full h-full min-h-162.5 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-500">
              Consultation room is not available yet.
            </div>
          )}
        </div>

        <div className="w-full lg:w-100 xl:w-112.5 shrink-0 flex flex-col bg-white border border-gray-100 shadow-sm overflow-hidden h-full rounded-2xl md:rounded-3xl">
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'notes' ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
            >
              Consultation Notes
            </button>
            <button 
              onClick={() => setActiveTab('prescription')}
              className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'prescription' ? 'border-primary text-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
            >
              Prescription
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-gray-50/30">
            {(panelMessage || panelError) && (
              <div className={`mb-4 px-4 py-3 rounded-xl border text-sm ${panelError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                {panelError || panelMessage}
              </div>
            )}

            {activeTab === 'notes' ? (
              <div className="space-y-4 h-full flex flex-col">
                <textarea 
                  className="w-full flex-1 p-5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none bg-white shadow-inner font-medium text-text leading-relaxed"
                  placeholder="Type doctors notes, symptoms, and private observations here. These are not visible to the patient."
                  value={consultationNotes}
                  onChange={(event) => setConsultationNotes(event.target.value)}
                ></textarea>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes || !session?._id}
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" /> {savingNotes ? 'Saving...' : 'Save Internal Notes'}
                </button>
              </div>
            ) : (
              <div className="space-y-6 h-full flex flex-col">
                <div className="flex-1 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Diagnosis</label>
                    <input
                      type="text"
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium shadow-sm"
                      placeholder="E.g. Mild Hypertension"
                      value={diagnosis}
                      onChange={(event) => setDiagnosis(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Medication</label>
                    <textarea 
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-35 font-medium shadow-sm leading-relaxed"
                      placeholder="1. Lisinopril 10mg, take 1 tablet daily.&#10;2. Vitamin D3 1000IU daily."
                      value={medication}
                      onChange={(event) => setMedication(event.target.value)}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Follow-up Advice</label>
                     <textarea 
                      className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-25 font-medium shadow-sm leading-relaxed"
                      placeholder="Reduce sodium intake. Return to clinic in 3 weeks."
                      value={followUpAdvice}
                      onChange={(event) => setFollowUpAdvice(event.target.value)}
                    ></textarea>
                  </div>
                </div>
                <button
                  onClick={handleSavePrescription}
                  disabled={savingPrescription || !session?._id}
                  className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm shadow-primary/30 transition-all hover:-translate-y-0.5 mt-auto disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" /> {savingPrescription ? 'Saving...' : 'Issue Digital Prescription'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
