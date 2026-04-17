import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DoctorService, UserService } from '../../services/api';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [doctorsRes, usersRes] = await Promise.all([
        DoctorService.getDoctors(),
        UserService.getAllUsers(),
      ]);
      const doctorProfiles = Array.isArray(doctorsRes) ? doctorsRes : [];
      const users = Array.isArray(usersRes) ? usersRes : [];
      const doctorUsers = users.filter((u) => u.role === 'doctor');

      const mergedDoctors = doctorProfiles.length
        ? doctorProfiles
        : doctorUsers.map((user) => ({
            _id: user._id,
            userId: user,
            specialization: user.specialization || 'General Physician',
            licenseNumber: user.licenseNumber || '',
            isVerified: user.isVerified || false,
            createdAt: user.createdAt,
          }));

      setDoctors(mergedDoctors);
      setPatients(users.filter((u) => u.role === 'patient'));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasIdProof = (doctorRecord) => {
    if (!doctorRecord || typeof doctorRecord !== 'object') {
      return false;
    }

    const candidates = [
      doctorRecord.idProofUrl,
      doctorRecord.idProof,
      doctorRecord.idProofDocument,
      doctorRecord.idProofDocumentUrl,
      doctorRecord.governmentIdProofUrl,
      doctorRecord.licenseDocumentUrl,
      doctorRecord.licenseProofUrl,
      doctorRecord.licenseImageUrl,
      doctorRecord.userId?.idProofUrl,
      doctorRecord.userId?.idProof,
      doctorRecord.userId?.idProofDocument,
      doctorRecord.userId?.idProofDocumentUrl,
      doctorRecord.userId?.governmentIdProofUrl,
      doctorRecord.userId?.licenseDocumentUrl,
      doctorRecord.userId?.licenseProofUrl,
      doctorRecord.userId?.licenseImageUrl,
    ];

    return candidates.some((candidate) => {
      if (typeof candidate === 'string') {
        return candidate.trim().length > 0;
      }

      if (candidate && typeof candidate === 'object') {
        const nested = candidate.url || candidate.path || candidate.secure_url || candidate.location;
        return typeof nested === 'string' && nested.trim().length > 0;
      }

      return false;
    });
  };

  const getIdProofUrl = (doctorRecord) => {
    if (!doctorRecord || typeof doctorRecord !== 'object') {
      return '';
    }

    const candidates = [
      doctorRecord.idProofUrl,
      doctorRecord.idProofDocumentUrl,
      doctorRecord.governmentIdProofUrl,
      doctorRecord.licenseDocumentUrl,
      doctorRecord.licenseProofUrl,
      doctorRecord.licenseImageUrl,
      doctorRecord.userId?.idProofUrl,
      doctorRecord.userId?.idProofDocumentUrl,
      doctorRecord.userId?.governmentIdProofUrl,
      doctorRecord.userId?.licenseDocumentUrl,
      doctorRecord.userId?.licenseProofUrl,
      doctorRecord.userId?.licenseImageUrl,
    ];

    const found = candidates.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0);
    return found || '';
  };

  const mappedDoctors = useMemo(() => doctors.map((doc) => ({
    id: doc._id,
    name: doc.userId?.name || 'Doctor',
    roleOrSpecialty: doc.specialization,
    licenseOrId: doc.licenseNumber,
    idProofUrl: getIdProofUrl(doc),
    isDoctor: true,
    hasIdProof: hasIdProof(doc),
    status: doc.isVerified ? 'Verified' : 'Pending',
    joined: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-',
  })), [doctors]);

  const mappedPatients = useMemo(() => patients.map((user) => ({
    id: user._id,
    name: user.name,
    roleOrSpecialty: 'Patient',
    licenseOrId: user.email,
    idProofUrl: '',
    isDoctor: false,
    status: 'Active',
    joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-',
  })), [patients]);

  const rows = useMemo(() => {
    const source = activeTab === 'doctors' ? mappedDoctors : mappedPatients;
    if (!query.trim()) return source;
    const normalized = query.toLowerCase();
    return source.filter((row) =>
      row.name.toLowerCase().includes(normalized) ||
      String(row.roleOrSpecialty || '').toLowerCase().includes(normalized) ||
      String(row.licenseOrId || '').toLowerCase().includes(normalized)
    );
  }, [activeTab, mappedDoctors, mappedPatients, query]);

  const handleVerifyDoctor = async (doctorId, canVerify) => {
    if (!canVerify) {
      setError('Doctor cannot be verified until an ID proof document is uploaded.');
      return;
    }

    try {
      await DoctorService.verifyDoctor(doctorId);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to verify doctor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">User Management</h1>
          <p className="text-gray-500 mt-1">Manage platform users, verify doctors, and handle reports.</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={loadData} className="bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-primary/30">
            Refresh
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading users...</p>}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
           <div className="flex bg-gray-100/80 p-1 rounded-xl w-full md:w-auto">
             <button 
                onClick={() => setActiveTab('doctors')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'doctors' ? 'bg-white text-text shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Doctors
             </button>
             <button 
                onClick={() => setActiveTab('patients')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'patients' ? 'bg-white text-text shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
                Patients
             </button>
           </div>
           
           <div className="flex w-full md:w-auto gap-3">
             <div className="relative flex-1 md:w-64">
               <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 placeholder={`Search ${activeTab}...`} 
                 className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full bg-white transition-all font-medium"
               />
             </div>
             <button className="bg-white border border-gray-200 text-gray-700 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
               <Filter className="w-5 h-5" />
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-6 py-4">Name</th>
                <th className="p-6 py-4">Specialty / Role</th>
                <th className="p-6 py-4">License / ID</th>
                <th className="p-6 py-4">Status</th>
                <th className="p-6 py-4">Joined Date</th>
                <th className="p-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-text">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-500">
                        {row.name.charAt(0)}
                      </div>
                      {row.name}
                    </div>
                  </td>
                  <td className="p-6 text-gray-600 font-medium">{row.roleOrSpecialty}</td>
                  <td className="p-6 text-gray-500 font-medium">
                    {row.isDoctor ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>{row.licenseOrId || '-'}</span>
                        </div>
                        {row.idProofUrl ? (
                          <a
                            href={row.idProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block text-xs font-bold text-primary hover:text-secondary hover:underline"
                          >
                            View Uploaded ID
                          </a>
                        ) : (
                          <span className="inline-block text-xs font-semibold text-amber-700">Not uploaded</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" /> {row.licenseOrId}
                      </div>
                    )}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      row.status === 'Verified' || row.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' :
                      row.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-6 text-gray-500 font-medium">{row.joined}</td>
                  <td className="p-6">
                    {activeTab === 'doctors' && row.status === 'Pending' ? (
                       <div className="flex justify-center gap-2">
                         <button
                           onClick={() => handleVerifyDoctor(row.id, row.hasIdProof)}
                           disabled={!row.hasIdProof}
                           className={`p-2 rounded-lg transition-colors ${row.hasIdProof ? 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                           title={row.hasIdProof ? 'Approve' : 'Upload ID proof required before approval'}
                         >
                           <CheckCircle className="w-5 h-5" />
                         </button>
                         <button className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors" title="Reject">
                           <XCircle className="w-5 h-5" />
                         </button>
                       </div>
                    ) : (
                       <div className="flex justify-center">
                         <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                           <MoreHorizontal className="w-5 h-5" />
                         </button>
                       </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500 bg-gray-50/30">
           <span>Showing {rows.length} entries</span>
           <div className="flex gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
             <button className="px-3 py-1.5 hover:bg-gray-50 border-r border-gray-200 font-medium">Prev</button>
             <button className="px-3 py-1.5 bg-primary/10 text-primary font-bold border-r border-gray-200">1</button>
             <button className="px-3 py-1.5 hover:bg-gray-50 font-medium disabled:opacity-50">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}
