import { Users, Activity, DollarSign, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AppointmentService, DoctorService, PaymentService, UserService } from '../../services/api';

export default function AdminDashboard() {
  const [range, setRange] = useState('today');
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const [usersRes, doctorsRes, appointmentsRes, paymentsRes] = await Promise.all([
          UserService.getAllUsers(),
          DoctorService.getDoctors(),
          AppointmentService.getAppointments(),
          PaymentService.getPaymentsHistory(),
        ]);

        setUsers(Array.isArray(usersRes) ? usersRes : []);
        setDoctors(Array.isArray(doctorsRes) ? doctorsRes : []);
        setAppointments(Array.isArray(appointmentsRes) ? appointmentsRes : []);
        setPayments(Array.isArray(paymentsRes) ? paymentsRes : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load admin dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const periodStart = useMemo(() => {
    const now = new Date();
    if (range === 'today') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (range === 'week') {
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }, [range]);

  const inRange = (value) => {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date >= periodStart;
  };

  const appointmentsInRange = appointments.filter((item) => inRange(item.createdAt));
  const paymentsInRange = payments.filter((item) => inRange(item.createdAt));

  const totalPatients = users.filter((user) => user.role === 'patient').length;
  const activeDoctors = doctors.filter((doctor) => doctor.isVerified).length;
  const pendingVerifications = doctors.filter((doctor) => !doctor.isVerified).slice(0, 5);
  const recentTransactions = [...paymentsInRange]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);
  const totalRevenue = paymentsInRange
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Platform Overview</h1>
          <p className="text-gray-500 mt-1">Here's what's happening on MedikaLine today.</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
           <button onClick={() => setRange('today')} className={`px-4 py-2 border-r border-gray-200 ${range === 'today' ? 'bg-gray-50 font-bold text-gray-700' : 'hover:bg-gray-50 font-medium text-gray-600 transition-colors'}`}>Today</button>
           <button onClick={() => setRange('week')} className={`px-4 py-2 border-r border-gray-200 ${range === 'week' ? 'bg-gray-50 font-bold text-gray-700' : 'hover:bg-gray-50 font-medium text-gray-600 transition-colors'}`}>Week</button>
           <button onClick={() => setRange('month')} className={`px-4 py-2 ${range === 'month' ? 'bg-gray-50 font-bold text-gray-700' : 'hover:bg-gray-50 font-medium text-gray-600 transition-colors'}`}>Month</button>
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading dashboard...</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-gray-500 font-medium mb-1">Total Patients</p>
          <h3 className="text-3xl font-extrabold text-text">{totalPatients}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-green-50 p-3 rounded-xl border border-green-100/50">
              <UserCheck className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-gray-500 font-medium mb-1">Active Doctors</p>
          <h3 className="text-3xl font-extrabold text-text">{activeDoctors}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="bg-purple-50 p-3 rounded-xl border border-purple-100/50">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-gray-500 font-medium mb-1">Appointments</p>
          <h3 className="text-3xl font-extrabold text-text">{appointmentsInRange.length}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100/50">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-500 font-medium mb-1">Revenue ({range})</p>
          <h3 className="text-3xl font-extrabold text-text">${totalRevenue.toFixed(2)}</h3>
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
              <div key={doc._id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-gray-400">
                    {(doc.userId?.name || 'D').charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-text">{doc.userId?.name || 'Doctor'}</h4>
                    <p className="text-sm text-gray-500">{doc.specialization} • {doc.licenseNumber}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm shadow-primary/20">
                    Pending
                  </button>
                </div>
              </div>
            ))}
            {pendingVerifications.length === 0 && <p className="p-6 text-sm text-gray-500">No pending verifications.</p>}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h2 className="text-lg font-bold text-text">Recent Transactions</h2>
            <Link to="/admin/analytics" className="text-primary text-sm font-bold hover:underline">Full Report</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.map(tx => (
              <div key={tx._id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                 <div>
                    <h4 className="font-bold text-text mb-0.5">Appointment #{String(tx.appointmentId || '').slice(-6) || 'N/A'}</h4>
                    <p className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <div className="font-bold text-text mb-1">${Number(tx.amount || 0).toFixed(2)}</div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                      tx.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {tx.status}
                    </span>
                 </div>
              </div>
            ))}
            {recentTransactions.length === 0 && <p className="p-6 text-sm text-gray-500">No transactions found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
