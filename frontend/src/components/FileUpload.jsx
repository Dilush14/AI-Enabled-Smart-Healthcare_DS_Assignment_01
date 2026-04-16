import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';

export default function FileUpload({ label, accept = '*/*', maxFiles = 1, onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    let updatedFiles = [...files, ...newFiles];
    if (maxFiles === 1) {
      updatedFiles = [newFiles[0]];
    } else if (updatedFiles.length > maxFiles) {
      updatedFiles = updatedFiles.slice(0, maxFiles);
    }
    setFiles(updatedFiles);
    if (onUpload) onUpload(updatedFiles);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (onUpload) onUpload(newFiles);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-text mb-2">{label}</label>}
      
      <div 
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={accept} 
          multiple={maxFiles > 1}
          onChange={handleFileInput}
        />
        
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <h4 className="text-lg font-bold text-text mb-1">Click or drag file to this area to upload</h4>
        <p className="text-sm text-gray-500 mb-4">Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.</p>
        
        <button className="bg-white border text-text font-medium px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-gray-50 transition-colors pointer-events-none">
          Select File
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <File className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
