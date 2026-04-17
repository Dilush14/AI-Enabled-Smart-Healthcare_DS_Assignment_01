import { Save, User, Mail, Phone, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UserService } from '../../services/api';

export default function PatientSettings() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const profile = await UserService.getProfile();
        setForm({
          name: profile?.name || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
          address: profile?.address || '',
          dateOfBirth: profile?.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const updated = await UserService.updateProfile({
        name: form.name,
        phone: form.phone,
        address: form.address,
        dateOfBirth: form.dateOfBirth || null,
      });
      localStorage.setItem('user', JSON.stringify(updated));
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-12 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and security preferences.</p>
      </div>

      {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-bold text-text mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input name="name" type="text" value={form.name} onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" value={form.email} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all text-gray-500" readOnly />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input name="address" type="text" value={form.address} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <h2 className="text-xl font-bold text-text mb-4">Security</h2>
          <div className="grid md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" placeholder="••••••••" className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
            </div>
            <div className="hidden md:block"></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" placeholder="••••••••" className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" placeholder="••••••••" className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-4">
          <button className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-bold shadow-sm shadow-primary/30 flex items-center gap-2 transition-all disabled:opacity-60">
            <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
