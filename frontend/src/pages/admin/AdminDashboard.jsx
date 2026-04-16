import { Users, Activity, DollarSign, UserCheck, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const pendingVerifications = [
    { id: 1, name: 'Dr. Michael Chen', specialty: 'Dermatology', license: 'MD-83210', date: 'Oct 24, 2026' },
    { id: 2, name: 'Dr. Emma Davis', specialty: 'Pediatrics', license: 'PD-49211', date: 'Oct 23, 2026' },
    { id: 3, name: 'Dr. Robert Wilson', specialty: 'Neurology', license: 'NR-10293', date: 'Oct 22, 2026' },
  ];

  const recentTransactions = [
    { id: 1, patient: 'John Doe', doctor: 'Dr. Jenkins', amount: '$150.00', status: 'Completed', date: '2 hrs ago' },
    { id: 2, patient: 'Alice Smith', doctor: 'Dr. Carter', amount: '$200.00', status: 'Pending', date: '4 hrs ago' },
    { id: 3, patient: 'Emma Wilson', doctor: 'Dr. Lee', amount: '$120.00', status: 'Completed', date: '5 hrs ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Platform Overview</h1>
          <p className="text-gray-500 mt-1">Here's what's happening on MedikaLine today.</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
           <button className="px-4 py-2 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">Today</button>
           <button className="px-4 py-2 hover:bg-gray-50 font-medium text-gray-600 transition-colors border-r border-gray-200">Week</button>
           <button className="px-4 py-2 hover:bg-gray-50 font-medium text-gray-600 transition-colors">Month</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-bold text-green-500 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">+8.2%</span>
          </div>
          <p className="text-gray-500 font-medium mb-1">Total Patients</p>
          <h3 className="text-3xl font-extrabold text-text">14,284</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-green-50 p-3 rounded-xl border border-green-100/50">
              <UserCheck className="w-6 h-6 text-accent" />
            </div>
            <span className="text-sm font-bold text-green-500 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">+4.1%</span>
          </div>
          <p className="text-gray-500 font-medium mb-1">Active Doctors</p>
          <h3 className="text-3xl font-extrabold text-text">842</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="bg-purple-50 p-3 rounded-xl border border-purple-100/50">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-sm font-bold text-green-500 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">+12%</span>
          </div>
          <p className="text-gray-500 font-medium mb-1">Appointments</p>
          <h3 className="text-3xl font-extrabold text-text">3,205</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100/50">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
             <span className="text-sm font-bold text-green-500 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">+18%</span>
          </div>
          <p className="text-gray-500 font-medium mb-1">Monthly Revenue</p>
          <h3 className="text-3xl font-extrabold text-text">$124.5k</h3>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h2 className="text-lg font-bold text-text">Doctor Verifications</h2>
            <Link to="/admin/users" className="text-primary text-sm font-bold hover:underline">View Queue</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingVerifications.map(doc => (
              <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-gray-400">
                    {doc.name.charAt(4)}
                  </div>
                  <div>
                    <h4 className="font-bold text-text">{doc.name}</h4>
                    <p className="text-sm text-gray-500">{doc.specialty} • {doc.license}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm shadow-primary/20">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h2 className="text-lg font-bold text-text">Recent Transactions</h2>
            <Link to="/admin/analytics" className="text-primary text-sm font-bold hover:underline">Full Report</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                 <div>
                    <h4 className="font-bold text-text mb-0.5">{tx.patient}</h4>
                    <p className="text-sm text-gray-500">Consulted {tx.doctor}</p>
                 </div>
                 <div className="text-right">
                    <div className="font-bold text-text mb-1">{tx.amount}</div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                      tx.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {tx.status}
                    </span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
