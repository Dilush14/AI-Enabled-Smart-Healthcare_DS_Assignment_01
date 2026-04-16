import FileUpload from '../../components/FileUpload';

export default function PatientReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Medical Reports & Documents</h1>
        <p className="text-gray-500 mt-1">Upload and manage your medical records, test results, and imaging safely.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Recent Uploads</h2>
            <div className="space-y-4">
               {/* Example of already uploaded file */}
               <div className="flex items-center justify-between bg-gray-50 border border-gray-100 p-4 rounded-xl">
                  <div>
                    <h4 className="font-bold text-text">Blood_Test_Results_2026.pdf</h4>
                    <p className="text-sm text-gray-500">Uploaded on Oct 10, 2026 • 2.4 MB</p>
                  </div>
                  <button className="text-primary font-medium hover:underline text-sm">Download</button>
               </div>
               <div className="flex items-center justify-between bg-gray-50 border border-gray-100 p-4 rounded-xl">
                  <div>
                    <h4 className="font-bold text-text">Chest_XRay_Report.pdf</h4>
                    <p className="text-sm text-gray-500">Uploaded on Sep 22, 2026 • 5.1 MB</p>
                  </div>
                  <button className="text-primary font-medium hover:underline text-sm">Download</button>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Upload New Document</h2>
            <FileUpload maxFiles={3} accept=".pdf,.png,.jpg,.jpeg" />
            <button className="w-full mt-4 bg-primary hover:bg-secondary text-white py-3 rounded-xl font-bold transition-all shadow-sm shadow-primary/30">
              Submit Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
