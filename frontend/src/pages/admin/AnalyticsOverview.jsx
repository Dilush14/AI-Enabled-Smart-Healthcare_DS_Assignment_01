import { Download, Calendar as CalendarIcon, Filter, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AppointmentService, PaymentService } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AnalyticsOverview() {
  const [range, setRange] = useState('month');
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const [appointmentsRes, paymentsRes] = await Promise.all([
          AppointmentService.getAppointments(),
          PaymentService.getPaymentsHistory(),
        ]);

        const appointments = Array.isArray(appointmentsRes)
          ? appointmentsRes
          : Array.isArray(appointmentsRes?.data)
            ? appointmentsRes.data
            : [];

        const payments = Array.isArray(paymentsRes)
          ? paymentsRes
          : Array.isArray(paymentsRes?.data)
            ? paymentsRes.data
            : [];

        setAppointments(appointments);
        setPayments(payments);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const periodStart = useMemo(() => {
    const now = new Date();
    if (range === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (range === 'month') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }, [range]);

  const inRange = (value) => {
    const date = new Date(value || 0);
    return !Number.isNaN(date.getTime()) && date >= periodStart;
  };

  const paymentsInRange = payments.filter((payment) => inRange(payment.createdAt));
  const appointmentsInRange = appointments.filter((appointment) => inRange(appointment.createdAt));
  const revenueTotal = paymentsInRange
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  const appointmentsByStatus = {
    pending: appointmentsInRange.filter((a) => a.status === 'pending').length,
    confirmed: appointmentsInRange.filter((a) => a.status === 'confirmed').length,
    completed: appointmentsInRange.filter((a) => a.status === 'completed').length,
    cancelled: appointmentsInRange.filter((a) => a.status === 'cancelled').length,
  };

  const formatDate = (value) => {
    const date = new Date(value || 0);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const periodLabel = range === 'week' ? 'Last 7 Days' : range === 'quarter' ? 'Last 90 Days' : 'Last 30 Days';
    const generatedAt = new Date().toLocaleString('en-US');

    doc.setFontSize(18);
    doc.text('MedikaLine Analytics Report', 40, 48);
    doc.setFontSize(10);
    doc.text(`Period: ${periodLabel}`, 40, 68);
    doc.text(`Generated: ${generatedAt}`, 40, 84);

    autoTable(doc, {
      startY: 102,
      head: [['Metric', 'Value']],
      body: [
        ['Revenue (Completed Payments)', `$${revenueTotal.toFixed(2)}`],
        ['Total Payments (In Range)', String(paymentsInRange.length)],
        ['Total Appointments (In Range)', String(appointmentsInRange.length)],
        ['Pending Appointments', String(appointmentsByStatus.pending)],
        ['Confirmed Appointments', String(appointmentsByStatus.confirmed)],
        ['Completed Appointments', String(appointmentsByStatus.completed)],
        ['Cancelled Appointments', String(appointmentsByStatus.cancelled)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    const paymentsRows = paymentsInRange
      .slice(0, 20)
      .map((payment) => [
        payment._id ? String(payment._id).slice(-8) : '-',
        payment.status || '-',
        `$${Number(payment.amount || 0).toFixed(2)}`,
        formatDate(payment.createdAt),
      ]);

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 102) + 18,
      head: [['Recent Payments (max 20)', 'Status', 'Amount', 'Created At']],
      body: paymentsRows.length > 0 ? paymentsRows : [['-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });

    const appointmentsRows = appointmentsInRange
      .slice(0, 20)
      .map((appointment) => [
        appointment._id ? String(appointment._id).slice(-8) : '-',
        appointment.status || '-',
        appointment.time || '-',
        formatDate(appointment.createdAt),
      ]);

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 102) + 18,
      head: [['Recent Appointments (max 20)', 'Status', 'Time', 'Created At']],
      body: appointmentsRows.length > 0 ? appointmentsRows : [['-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] },
    });

    doc.save(`medikaline-analytics-${range}-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Detailed performance metrics for MedikaLine.</p>
        </div>
        <div className="flex space-x-2">
           <div className="bg-white border border-gray-200 px-3 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm">
             <CalendarIcon className="w-4 h-4" />
             <select value={range} onChange={(e) => setRange(e.target.value)} className="bg-transparent text-gray-700 outline-none text-sm">
               <option value="week">Last 7 Days</option>
               <option value="month">Last 30 Days</option>
               <option value="quarter">Last 90 Days</option>
             </select>
           </div>
          <button
            onClick={handleExportPdf}
            disabled={loading}
            className="bg-primary hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shadow-primary/30"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading analytics...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text">Revenue Growth</h2>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 min-h-62.5 bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
             <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-green-500 font-bold text-xl mb-2">
                   <TrendingUp className="w-6 h-6" /> ${revenueTotal.toFixed(2)}
                </div>
                <p className="text-gray-500 font-medium">Completed revenue in selected period</p>
                <p className="text-sm text-gray-400 mt-1">Total payments: {paymentsInRange.length}</p>
             </div>
          </div>
        </div>

        {/* Appointments Chart Placeholder */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text">Appointments by Type</h2>
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 min-h-62.5 flex items-center justify-center relative py-6">
             <div className="w-48 h-48 rounded-full border-16 border-primary flex items-center justify-center relative shadow-sm">
               <div className="absolute -inset-4 rounded-full border-16 border-accent transition-all hover:scale-105" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%)' }}></div>
               <div className="absolute -inset-4 rounded-full border-16 border-purple-500 transition-all hover:scale-105" style={{ clipPath: 'polygon(50% 50%, 0 100%, 0 0)' }}></div>
                <div className="text-center z-10 bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-md">
                   <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total</span>
                   <span className="text-2xl font-extrabold text-text">{appointmentsInRange.length}</span>
                </div>
             </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary shadow-sm"></span><span className="text-sm font-bold text-gray-600">Pending: {appointmentsByStatus.pending}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-accent shadow-sm"></span><span className="text-sm font-bold text-gray-600">Confirmed: {appointmentsByStatus.confirmed}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></span><span className="text-sm font-bold text-gray-600">Completed: {appointmentsByStatus.completed}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
