import { useEffect, useMemo, useState } from 'react';
import { AppointmentService } from '../../services/api';
import AppointmentCalendarView from '../../components/AppointmentCalendarView';

const mapStatus = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'completed') return 'Completed';
  if (normalized === 'confirmed') return 'Confirmed';
  if (normalized === 'cancelled') return 'Cancelled';
  return 'Pending';
};

const resolveType = (appointment) => {
  const notes = String(appointment?.notes || '').toLowerCase();
  if (notes.includes('clinic visit') || notes.includes('in-person')) return 'Clinic Visit';
  return appointment?.type || appointment?.appointmentType || 'Video Consult';
};

export default function DoctorCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        setError(err?.response?.data?.message || 'Failed to load calendar appointments.');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const normalizedAppointments = useMemo(() => {
    return appointments.map((appointment) => {
      const patient = appointment.patientId && typeof appointment.patientId === 'object' ? appointment.patientId : {};
      return {
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: mapStatus(appointment.status),
        type: resolveType(appointment),
        counterpartyName: patient.name || 'Patient',
        counterpartyMeta: patient.age ? `${patient.age} yrs` : 'Age N/A',
      };
    });
  }, [appointments]);

  return (
    <AppointmentCalendarView
      title="Appointment Calendar"
      subtitle="Review your daily and monthly consultation schedule."
      appointments={normalizedAppointments}
      loading={loading}
      error={error}
    />
  );
}
