import { useEffect, useMemo, useState } from 'react';
import FileUpload from '../../components/FileUpload';
import AISuggestions from '../../components/AISuggestions';
import { AppointmentService, TelemedicineService } from '../../services/api';

export default function PatientReports() {
  const user = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('general');
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [consultationSummary, setConsultationSummary] = useState(null);

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      const parts = token.split('.');
      if (parts.length < 2) return '';
      const payload = JSON.parse(atob(parts[1]));
      return payload?.id || payload?._id || payload?.userId || '';
    } catch {
      return '';
    }
  };

  const resolvePatientId = () => {
    return (
      user?.id
      || user?._id
      || user?.userId
      || getUserIdFromToken()
      || selectedAppointment?.patientId?._id
      || selectedAppointment?.patientId
      || ''
    );
  };

  const reportTypeOptions = [
    { value: 'general', label: 'General Document' },
    { value: 'lab_report', label: 'Lab Report' },
    { value: 'blood_test', label: 'Blood Test' },
    { value: 'x_ray', label: 'X-Ray' },
    { value: 'ct_scan', label: 'CT Scan' },
    { value: 'ultrasound', label: 'Ultrasound' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [reportsResult, appointmentsResult] = await Promise.allSettled([
        TelemedicineService.getPatientReports(),
        AppointmentService.getAppointments(),
      ]);

      const reportsResponse = reportsResult.status === 'fulfilled' ? reportsResult.value : null;
      const appointmentsResponse = appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : null;

      const reportsList = Array.isArray(reportsResponse)
        ? reportsResponse
        : Array.isArray(reportsResponse?.data)
          ? reportsResponse.data
          : [];

      const appointmentsList = Array.isArray(appointmentsResponse)
        ? appointmentsResponse
        : Array.isArray(appointmentsResponse?.data)
          ? appointmentsResponse.data
          : [];

      const sortedReports = [...reportsList].sort(
        (a, b) => new Date(b?.uploadedAt || 0).getTime() - new Date(a?.uploadedAt || 0).getTime()
      );

      setReports(sortedReports);
      setSelectedReportId((prev) => prev || sortedReports[0]?._id || '');
      setAppointments(appointmentsList);

      const sortedAppointments = [...appointmentsList].sort(
        (a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime()
      );

      let latestSessionWithDoctorData = null;
      for (const appointment of sortedAppointments) {
        try {
          const sessionResponse = await TelemedicineService.getSessionByAppointment(appointment?._id);
          const session = sessionResponse?.data || sessionResponse;
          if (
            session
            && (
              (session.consultationNotes && session.consultationNotes.trim())
              || (session.prescription?.diagnosis && session.prescription.diagnosis.trim())
              || (session.prescription?.medication && session.prescription.medication.trim())
              || (session.prescription?.followUpAdvice && session.prescription.followUpAdvice.trim())
            )
          ) {
            latestSessionWithDoctorData = session;
            break;
          }
        } catch {
          // Ignore missing session and continue to older appointments.
        }
      }

      setConsultationSummary(latestSessionWithDoctorData);

      if (reportsResult.status === 'rejected' && appointmentsResult.status === 'rejected') {
        setError('Unable to load reports right now. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedReport = useMemo(
    () => reports.find((item) => item._id === selectedReportId) || null,
    [reports, selectedReportId]
  );

  const selectedAppointment = useMemo(() => {
    if (!appointments.length) return null;
    const sortedAppointments = [...appointments].sort(
      (a, b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime()
    );
    return sortedAppointments[0] || null;
  }, [appointments]);

  const getDoctorId = (appointment) => {
    if (!appointment?.doctorId) return '';
    return typeof appointment.doctorId === 'object' ? appointment.doctorId._id : appointment.doctorId;
  };

  const submitUpload = async () => {
    try {
      setError('');
      setSuccess('');

      const file = queuedFiles[0];
      if (!file) {
        setError('Please choose a file before submitting.');
        return;
      }

      const patientId = resolvePatientId();
      if (!patientId) {
        setError('Unable to resolve patient identity for this upload. Please sign in again and retry.');
        return;
      }

      const doctorId = getDoctorId(selectedAppointment);
      const appointmentId = selectedAppointment?._id || '';

      setUploading(true);

      let session = null;
      if (appointmentId) {
        try {
          const existingSession = await TelemedicineService.getSessionByAppointment(appointmentId);
          session = existingSession?.data || existingSession;
        } catch {
          session = null;
        }
      }

      if (!session?._id) {
        const createResponse = await TelemedicineService.createSession({
          appointmentId,
          patientId,
          doctorId,
        });
        session = createResponse?.data || createResponse;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', session._id);
      formData.append('patientId', patientId);
      if (doctorId) {
        formData.append('doctorId', doctorId);
      }
      if (appointmentId) {
        formData.append('appointmentId', appointmentId);
      }
      formData.append('reportType', selectedReportType);

      const uploadResponse = await TelemedicineService.uploadReport(formData);
      const newReport = uploadResponse?.data || uploadResponse;

      setReports((prev) => [newReport, ...prev]);
      setSelectedReportId(newReport?._id || '');
      setQueuedFiles([]);
      setSuccess('Report uploaded successfully. AI analysis is now available below.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const reportDownloadUrl = (fileUrl) => {
    if (!fileUrl) return '#';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Medical Reports & Documents</h1>
        <p className="text-gray-500 mt-1">Upload and manage your medical records, test results, and imaging safely.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Recent Uploads</h2>
            {loading ? (
              <p className="text-sm text-gray-500">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-sm text-gray-500">No reports uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className={`flex items-center justify-between bg-gray-50 border p-4 rounded-xl ${
                      selectedReportId === report._id ? 'border-primary' : 'border-gray-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedReportId(report._id)}
                      className="text-left"
                    >
                      <h4 className="font-bold text-text">{report.fileName || 'Unnamed report'}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded on {formatDate(report.uploadedAt)}
                        {report.reportType ? ` • ${String(report.reportType).replace('_', ' ')}` : ''}
                      </p>
                    </button>
                    <a
                      href={reportDownloadUrl(report.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary font-medium hover:underline text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedReport ? (
            <AISuggestions report={selectedReport} />
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-gray-500">
              Select a report to view AI analysis.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Doctor Consultation Summary</h2>

            {loading ? (
              <p className="text-sm text-gray-500">Loading consultation summary...</p>
            ) : !consultationSummary ? (
              <p className="text-sm text-gray-500">No doctor notes or prescription are available yet for your recent consultations.</p>
            ) : (
              <div className="space-y-4">
                {consultationSummary.consultationNotes ? (
                  <div>
                    <h3 className="text-sm font-bold text-text mb-1">Consultation Notes</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{consultationSummary.consultationNotes}</p>
                  </div>
                ) : null}

                {consultationSummary?.prescription?.diagnosis ? (
                  <div>
                    <h3 className="text-sm font-bold text-text mb-1">Diagnosis</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{consultationSummary.prescription.diagnosis}</p>
                  </div>
                ) : null}

                {consultationSummary?.prescription?.medication ? (
                  <div>
                    <h3 className="text-sm font-bold text-text mb-1">Medication</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{consultationSummary.prescription.medication}</p>
                  </div>
                ) : null}

                {consultationSummary?.prescription?.followUpAdvice ? (
                  <div>
                    <h3 className="text-sm font-bold text-text mb-1">Follow-up Advice</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{consultationSummary.prescription.followUpAdvice}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Upload New Document</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text mb-2">Report Type</label>
              <select
                value={selectedReportType}
                onChange={(event) => setSelectedReportType(event.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                {reportTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <FileUpload maxFiles={1} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onUpload={setQueuedFiles} />
            <button
              onClick={submitUpload}
              disabled={uploading}
              className="w-full mt-4 bg-primary hover:bg-secondary disabled:opacity-60 text-white py-3 rounded-xl font-bold transition-all shadow-sm shadow-primary/30"
            >
              {uploading ? 'Submitting...' : 'Submit Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
