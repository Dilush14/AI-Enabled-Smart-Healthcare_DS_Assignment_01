import { useEffect, useMemo, useState } from 'react';
import { Users, Calendar, Clock, DollarSign, MoreVertical, CheckCircle, XCircle, Video, UploadCloud, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppointmentService, DoctorService, UserService } from '../../services/api';
import NotificationBell from '../../components/NotificationBell';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [selectedProofFile, setSelectedProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [verificationState, setVerificationState] = useState({
    idProofUrl: '',
    isVerified: false,
  });

  const readIdProofUrl = (record) => {
    if (!record || typeof record !== 'object') return '';

    const possibleValues = [
      record.idProofUrl,
      record.idProofDocumentUrl,
      record.governmentIdProofUrl,
      record.licenseDocumentUrl,
      record.licenseProofUrl,
      record.licenseImageUrl,
      record.userId?.idProofUrl,
      record.userId?.idProofDocumentUrl,
      record.userId?.governmentIdProofUrl,
      record.userId?.licenseDocumentUrl,
      record.userId?.licenseProofUrl,
      record.userId?.licenseImageUrl,
    ];

    const found = possibleValues.find((value) => typeof value === 'string' && value.trim().length > 0);
    return found || '';
  };

  const loadVerificationState = async () => {
    try {
      const [profile, doctorRecord] = await Promise.all([
        UserService.getProfile(),
        currentUser?._id ? DoctorService.getDoctorById(currentUser._id) : Promise.resolve(null),
      ]);

      const idProofUrl = readIdProofUrl(doctorRecord) || readIdProofUrl(profile);
      const isVerified = Boolean(doctorRecord?.isVerified ?? profile?.isVerified);

      setVerificationState({ idProofUrl, isVerified });

      if (profile && currentUser) {
        const updatedUser = { ...currentUser, ...profile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch {
      // Keep dashboard functional even if profile fetch fails.
    }
  };

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
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    loadVerificationState();
  }, []);

  const handleIdProofUpload = async () => {
    if (!currentUser?._id) {
      setError('Please log in again to upload your ID proof.');
      return;
    }

    if (!selectedProofFile) {
      setError('Please select an image file before uploading.');
      return;
    }

    try {
      setUploadingProof(true);
      setError('');

      const formData = new FormData();
      formData.append('idProofImage', selectedProofFile);

      const updatedDoctor = await DoctorService.uploadIdProof(currentUser._id, formData);
      const idProofUrl = readIdProofUrl(updatedDoctor);

      setVerificationState((prev) => ({
        ...prev,
        idProofUrl,
        isVerified: Boolean(updatedDoctor?.isVerified),
      }));
      setSelectedProofFile(null);
      await loadVerificationState();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload ID proof image');
    } finally {
      setUploadingProof(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (value) => {
    const date = new Date(value);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  const statusToLabel = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'completed') return 'Completed';
    if (normalized === 'confirmed') return 'In Progress';
    if (normalized === 'cancelled') return 'Cancelled';
    return 'Upcoming';
  };

  const normalizedAppointments = useMemo(
    () =>
      appointments.map((app) => {
        const patient = app.patientId && typeof app.patientId === 'object' ? app.patientId : {};
        const notes = (app.notes || '').toLowerCase();
        const type = app.type
          || app.appointmentType
          || (notes.includes('clinic visit') || notes.includes('in-person') ? 'Clinic Visit' : 'Video Consult');
        const paymentStatus = (app.paymentStatus || 'pending').toLowerCase();
        const canConsult = app.status === 'confirmed' && paymentStatus === 'completed';
        const canAccept = app.status === 'pending';
        const isVideoAppointment = String(type).toLowerCase().includes('video');

        return {
          id: app._id,
          status: statusToLabel(app.status),
          rawStatus: app.status,
          paymentStatus,
          canConsult,
          canAccept,
          isVideoAppointment,
          patientName: patient.name || 'Patient',
          age: patient.age ? `${patient.age} yrs` : 'N/A',
          time: app.time || 'Time not set',
          type,
          dateLabel: formatDate(app.date),
          isToday: isToday(app.date),
          image: patient.profilePhotoUrl || patient.profileImage,
        };
      }),
    [appointments]
  );

  const todayAppointments = normalizedAppointments.filter(
    (app) => app.isToday && app.rawStatus !== 'pending' && app.rawStatus !== 'cancelled'
  );

  const upcomingAppointments = normalizedAppointments.filter(
    (app) => app.rawStatus === 'confirmed' || (app.rawStatus === 'pending' && app.paymentStatus === 'completed')
  );

  const pendingRequests = normalizedAppointments.filter((app) => app.rawStatus === 'pending');
  const uniquePatientsCount = new Set(normalizedAppointments.map((app) => app.patientName)).size;
  const todaysRevenue = normalizedAppointments.filter((app) => app.isToday && app.rawStatus === 'completed').length * 150;

  const handleRequestAction = async (id, status) => {
    try {
      setUpdatingId(id);
      await AppointmentService.updateAppointmentStatus(id, status);
      await loadAppointments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update appointment status');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Welcome back, Dr. {currentUser?.name || 'Doctor'}!</h1>
          <p className="text-gray-500 mt-1">You have {todayAppointments.length} patients scheduled for today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-green-700 text-sm">Online</span>
          </div>
          <NotificationBell />
        </div>
      </div>

      {!verificationState.idProofUrl && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 mt-0.5" />
            <div className="flex-1 space-y-3">
              <h2 className="text-base font-bold text-amber-900">Upload ID Proof To Activate Doctor Account</h2>
              <p className="text-sm text-amber-800">
                Your profile is hidden from patients until you upload an ID proof image and an admin approves your account.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSelectedProofFile(event.target.files?.[0] || null)}
                  className="block w-full text-sm text-amber-900 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-amber-900 hover:file:bg-amber-200"
                />
                <button
                  onClick={handleIdProofUpload}
                  disabled={uploadingProof || !selectedProofFile}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UploadCloud className="w-4 h-4" />
                  {uploadingProof ? 'Uploading...' : 'Upload ID Proof'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {verificationState.idProofUrl && !verificationState.isVerified && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-700 mt-0.5" />
            <div className="space-y-2">
              <h2 className="text-base font-bold text-blue-900">ID Proof Uploaded</h2>
              <p className="text-sm text-blue-800">
                Your ID proof has been submitted. An admin must accept your account before patients can view your profile.
              </p>
              <a
                href={verificationState.idProofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
              >
                View uploaded ID proof
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100/50">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Patients</p>
          <h3 className="text-2xl font-bold text-text mt-1">{uniquePatientsCount}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-3 rounded-xl border border-green-100/50">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Today's Appts</p>
          <h3 className="text-2xl font-bold text-text mt-1">{todayAppointments.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-purple-50 p-3 rounded-xl border border-purple-100/50">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Pending Requests</p>
          <h3 className="text-2xl font-bold text-text mt-1">{pendingRequests.length}</h3>
        </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100/50">
              <DollarSign className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Today's Revenue</p>
          <h3 className="text-2xl font-bold text-text mt-1">${todaysRevenue.toFixed(2)}</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-text">Upcoming Appointments</h2>
              <span className="text-sm font-medium text-gray-500">{upcomingAppointments.length} total</span>
            </div>
            <div className="divide-y divide-gray-50">
              {loading && <div className="p-6 text-gray-500">Loading upcoming appointments...</div>}
              {!loading && upcomingAppointments.length === 0 && <div className="p-6 text-gray-500">No upcoming appointments right now.</div>}
              {!loading && upcomingAppointments.map((app) => (
                <div key={app.id} className="p-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 border-r border-gray-100 pr-6 w-32">
                    <span className="font-bold text-text whitespace-nowrap">{app.time}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-1 px-6">
                    <img
                      src={app.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.patientName)}&background=f3f4f6&color=1E293B`}
                      alt={app.patientName}
                      className="w-12 h-12 rounded-full border border-gray-200"
                    />
                    <div>
                      <h4 className="font-bold text-text">{app.patientName}</h4>
                      <p className="text-sm text-gray-500">{app.age} • {app.type} • {app.dateLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      app.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      app.status === 'Upcoming' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {app.status}
                    </span>
                    {app.isVideoAppointment && (
                      <button
                        onClick={() => navigate(`/doctor/consultation/${app.id}`)}
                        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Open Video
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-text">Today's Schedule</h2>
              <Link to="/doctor/calendar" className="text-primary text-sm font-bold hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {loading && <div className="p-6 text-gray-500">Loading schedule...</div>}
              {!loading && todayAppointments.length === 0 && <div className="p-6 text-gray-500">No scheduled appointments for today.</div>}
              {!loading && todayAppointments.map(app => (
                <div key={app.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 border-r border-gray-100 pr-6 w-32">
                    <span className="font-bold text-text whitespace-nowrap">{app.time}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-1 px-6">
                    <img
                      src={app.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.patientName)}&background=f3f4f6&color=1E293B`}
                      alt={app.patientName}
                      className="w-12 h-12 rounded-full border border-gray-200"
                    />
                    <div>
                      <h4 className="font-bold text-text">{app.patientName}</h4>
                      <p className="text-sm text-gray-500">{app.age} • {app.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      app.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' :
                      app.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' :
                      app.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {app.status}
                    </span>
                    {app.canConsult && (
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
               {loading && <div className="p-5 text-gray-500">Loading requests...</div>}
               {!loading && pendingRequests.length === 0 && <div className="p-5 text-gray-500">No pending requests.</div>}
               {pendingRequests.map(req => (
                 <div key={req.id} className="p-5">
                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h4 className="font-bold text-text">{req.patientName}</h4>
                       <p className="text-xs text-gray-500 mt-0.5">{req.type}</p>
                       <span className={`inline-flex mt-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                         req.paymentStatus === 'completed'
                           ? 'bg-green-50 text-green-700 border-green-200'
                           : req.paymentStatus === 'failed'
                             ? 'bg-red-50 text-red-700 border-red-200'
                             : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                       }`}>
                         {req.paymentStatus === 'completed' ? 'Paid' : req.paymentStatus === 'failed' ? 'Payment Failed' : 'Payment Pending'}
                       </span>
                     </div>
                     <div className="text-right">
                       <span className="block text-sm font-bold text-text">{req.dateLabel}</span>
                       <span className="block text-xs text-primary font-medium">{req.time}</span>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button
                       disabled={updatingId === req.id || !req.canAccept}
                       onClick={() => handleRequestAction(req.id, 'confirmed')}
                       className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                     >
                       <CheckCircle className="w-4 h-4" /> {req.canAccept ? 'Accept' : 'Await Payment'}
                     </button>
                     <button
                       disabled={updatingId === req.id}
                       onClick={() => handleRequestAction(req.id, 'cancelled')}
                       className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-60"
                     >
                       <XCircle className="w-4 h-4" /> Decline
                     </button>
                   </div>
                 </div>
               ))}
            </div>
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              <button className="w-full text-primary font-bold text-sm hover:underline">View all requests ({pendingRequests.length})</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
