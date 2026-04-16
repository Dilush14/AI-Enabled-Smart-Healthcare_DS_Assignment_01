import { Save, User, Mail, Phone, Lock } from 'lucide-react';

export default function PatientSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and security preferences.</p>
      </div>

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
                <input type="text" defaultValue="John Doe" className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" defaultValue="johndoe@example.com" className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all text-gray-500" readOnly />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input type="tel" defaultValue="+1 (555) 123-4567" className="pl-10 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" defaultValue="1990-05-15" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary outline-none transition-all" />
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
          <button className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-bold shadow-sm shadow-primary/30 flex items-center gap-2 transition-all">
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
