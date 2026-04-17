import { Save, Star, User, MapPin, Briefcase } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DoctorService } from '../../services/api';

export default function DoctorProfileSettings() {
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({
    specialization: '',
    experience: '',
    totalPatients: '',
    clinicName: '',
    clinicAddress: '',
    about: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const doctorId = currentUser?._id;

  const loadDoctor = async () => {
    if (!doctorId) {
      setError('Doctor account not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await DoctorService.getDoctorById(doctorId);
      setDoctor(response);
      setForm({
        specialization: response?.specialization || '',
        experience: response?.experience ?? '',
        totalPatients: response?.totalPatients ?? '',
        clinicName: response?.clinicName || '',
        clinicAddress: response?.clinicAddress || response?.userId?.address || '',
        about: response?.about || '',
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctor();
  }, []);

  const averageRating = useMemo(() => Number(doctor?.ratingAverage || doctor?.rating || 0), [doctor]);
  const ratingCount = useMemo(() => Number(doctor?.ratingCount || 0), [doctor]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!doctorId) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        specialization: form.specialization.trim(),
        experience: form.experience === '' ? 0 : Number(form.experience),
        totalPatients: form.totalPatients === '' ? 0 : Number(form.totalPatients),
        clinicName: form.clinicName.trim(),
        clinicAddress: form.clinicAddress.trim(),
        about: form.about.trim(),
      };

      const updated = await DoctorService.updateDoctor(doctorId, payload);
      setDoctor(updated);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl py-12 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Doctor Profile</h1>
        <p className="text-gray-500 mt-1">Keep your public profile complete so patients can find and trust you.</p>
      </div>

      {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-medium text-gray-500">Average Rating</p>
            <div className="mt-1 flex items-center gap-2 text-xl font-bold text-text">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              {averageRating > 0 ? averageRating.toFixed(1) : '-'}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-sm font-medium text-gray-500">Total Ratings</p>
            <p className="mt-1 text-xl font-bold text-text">{ratingCount}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="specialization"
                type="text"
                value={form.specialization}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input
              name="experience"
              type="number"
              min="0"
              value={form.experience}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Patients Treated</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="totalPatients"
                type="number"
                min="0"
                value={form.totalPatients}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
            <input
              name="clinicName"
              type="text"
              value={form.clinicName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="clinicAddress"
                type="text"
                value={form.clinicAddress}
                onChange={handleChange}
                className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
            <textarea
              name="about"
              rows={5}
              value={form.about}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all resize-none"
              placeholder="Share your background, areas of expertise, and treatment approach."
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-bold shadow-sm shadow-primary/30 flex items-center gap-2 transition-all disabled:opacity-60"
          >
            <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
