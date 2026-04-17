import { useEffect, useMemo, useState } from 'react';
import { AppointmentService, DoctorService } from '../../services/api';
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

export default function PatientCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [doctorsById, setDoctorsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [appointmentsRes, doctorsRes] = await Promise.all([
          AppointmentService.getAppointments(),
          DoctorService.getDoctors(),
        ]);

        const appointmentList = Array.isArray(appointmentsRes)
          ? appointmentsRes
          : Array.isArray(appointmentsRes?.data)
            ? appointmentsRes.data
            : [];

        const doctorsList = Array.isArray(doctorsRes)
          ? doctorsRes
          : Array.isArray(doctorsRes?.data)
            ? doctorsRes.data
            : [];

        const dictionary = doctorsList.reduce((acc, doctor) => {
          const key = doctor?._id || doctor?.id;
          if (key) acc[key] = doctor;
          return acc;
        }, {});

        setAppointments(appointmentList);
        setDoctorsById(dictionary);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load calendar appointments.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const normalizedAppointments = useMemo(() => {
    return appointments.map((appointment) => {
      const appointmentDoctor = appointment.doctorId && typeof appointment.doctorId === 'object' ? appointment.doctorId : null;
      const doctorLookupId = typeof appointment.doctorId === 'string' ? appointment.doctorId : appointment.doctorId?._id;
      const lookedUpDoctor = doctorLookupId ? doctorsById[doctorLookupId] : null;
      const doctor = appointmentDoctor || lookedUpDoctor || {};

      const doctorName = doctor.userId?.name || doctor.name || appointment.doctorName || 'Doctor';
      const specialty = doctor.specialization || appointment.specialization || 'Specialist';

      return {
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: mapStatus(appointment.status),
        type: resolveType(appointment),
        counterpartyName: doctorName,
        counterpartyMeta: specialty,
      };
    });
  }, [appointments, doctorsById]);

  return (
    <AppointmentCalendarView
      title="My Appointment Calendar"
      subtitle="Track all your consultations and upcoming bookings in one place."
      appointments={normalizedAppointments}
      loading={loading}
      error={error}
    />
  );
}
