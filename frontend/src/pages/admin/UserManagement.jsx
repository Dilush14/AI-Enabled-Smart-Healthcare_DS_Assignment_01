import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useState } from 'react';

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('doctors');

  const doctors = [
     { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'Cardiologist', status: 'Verified', license: 'MD-10234', joined: 'Jan 12, 2026' },
     { id: 2, name: 'Dr. Michael Chen', specialty: 'Dermatologist', status: 'Pending', license: 'MD-83210', joined: 'Oct 24, 2026' },
     { id: 3, name: 'Dr. Emily Carter', specialty: 'Pediatrician', status: 'Pending', license: 'PD-49211', joined: 'Oct 23, 2026' },
     { id: 4, name: 'Dr. Robert Wilson', specialty: 'Neurologist', status: 'Rejected', license: 'NR-10293', joined: 'Oct 20, 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">User Management</h1>
          <p className="text-gray-500 mt-1">Manage platform users, verify doctors, and handle reports.</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-primary/30">
            Export Data
          </button>
        </div>
      </div>

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
              {doctors.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-text">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-500">
                        {doc.name.charAt(4)}
                      </div>
                      {doc.name}
                    </div>
                  </td>
                  <td className="p-6 text-gray-600 font-medium">{doc.specialty}</td>
                  <td className="p-6 text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-gray-400" /> {doc.license}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      doc.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' :
                      doc.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-6 text-gray-500 font-medium">{doc.joined}</td>
                  <td className="p-6">
                    {doc.status === 'Pending' ? (
                       <div className="flex justify-center gap-2">
                         <button className="p-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors" title="Approve">
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
           <span>Showing 1 to 4 of 4 entries</span>
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
