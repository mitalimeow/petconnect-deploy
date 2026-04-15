const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { AlertCircle, FileText, CheckCircle, Loader2, X } from 'lucide-react';

const LEVEL_2_TAGS = [
  "Shelter Owner", "Vet", "Pet Store", "Trainer", 
  "Ethical Breeder", "Transporter", "Pet Stylist"
];

const ApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const availableTags = LEVEL_2_TAGS.filter(tag => !(user?.tags || []).includes(tag));

  const [formData, setFormData] = useState({
    requestedTag: availableTags.length > 0 ? availableTags[0] : "",
    reason: '',
    url1: '',
    url2: '',
    url3: ''
  });

  const [documents, setDocuments] = useState({
    doc1: null, // { data: string, mimetype: string, size: number }
    doc2: null,
    doc3: null
  });

  const [processing, setProcessing] = useState({
    doc1: false,
    doc2: false,
    doc3: false
  });

  const [status, setStatus] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleFileChange = async (e, docKey) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type;
    const fileSizeMB = file.size / (1024 * 1024);

    setProcessing(prev => ({ ...prev, [docKey]: true }));

    try {
      if (fileType === 'application/pdf' || fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Document validation
        if (fileSizeMB > 1) {
          showToast("Document exceeds 1MB size limit");
          e.target.value = null; // Reset
          setDocuments(prev => ({ ...prev, [docKey]: null }));
          setProcessing(prev => ({ ...prev, [docKey]: false }));
          return;
        }
        
        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocuments(prev => ({ 
            ...prev, 
            [docKey]: { data: reader.result, mimetype: fileType, size: file.size } 
          }));
          setProcessing(prev => ({ ...prev, [docKey]: false }));
        };
        reader.readAsDataURL(file);

      } else if (fileType.startsWith('image/')) {
        // Image Compression
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        
        // ONLY compress if > 300KB as requested
        let finalFile = file;
        if (file.size > 300 * 1024) {
          finalFile = await imageCompression(file, options);
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocuments(prev => ({ 
            ...prev, 
            [docKey]: { data: reader.result, mimetype: fileType, size: finalFile.size } 
          }));
          setProcessing(prev => ({ ...prev, [docKey]: false }));
        };
        reader.readAsDataURL(finalFile);

      } else {
        showToast("Unsupported file type. Please upload Image, PDF, or DOC.");
        e.target.value = null;
        setProcessing(prev => ({ ...prev, [docKey]: false }));
      }
    } catch (err) {
      console.error("File processing error:", err);
      showToast("Error processing file");
      setProcessing(prev => ({ ...prev, [docKey]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (processing.doc1 || processing.doc2 || processing.doc3) return;
    
    // Ensure at least doc1 is uploaded for "Document 1*"
    if (!documents.doc1) {
      return showToast("Please upload Document 1 as proof.");
    }
    if (!formData.url1) {
      return showToast("Please provide at least URL 1.");
    }

    const payloadDocs = [documents.doc1];
    if (documents.doc2) payloadDocs.push(documents.doc2);
    if (documents.doc3) payloadDocs.push(documents.doc3);

    const payloadUrls = [formData.url1, formData.url2, formData.url3].filter(u => u.trim() !== '');

    setStatus('submitting');
    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          requestedTag: formData.requestedTag,
          reason: formData.reason,
          documents: payloadDocs,
          urls: payloadUrls
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus(data.message || 'Error occurred');
      }
    } catch (err) {
      setStatus('Failed to connect to server');
    }
  };

  const renderFileUploader = (docKey, label, required = false) => {
    const isProc = processing[docKey];
    const hasDoc = documents[docKey];

    return (
      <div className="mb-4">
        <p className="font-handwritten text-[#3A3A3A] text-lg mb-1">{label}{required && '*'}</p>
        <div className="relative">
          <input 
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            onChange={(e) => handleFileChange(e, docKey)}
            className="hidden"
            id={`proof-upload-${docKey}`}
          />
          <label 
            htmlFor={`proof-upload-${docKey}`}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl py-8 px-4 transition-all cursor-pointer ${hasDoc ? 'border-pastel-blue bg-white' : 'border-gray-300 bg-white hover:border-pastel-blue'}`}
          >
            {isProc ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-pastel-blue mb-2" size={32} />
                <p className="text-sm font-bold text-gray-500">Processing file...</p>
              </div>
            ) : hasDoc ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="text-pastel-green mb-2" size={32} />
                <p className="text-sm font-bold text-gray-700">File Ready</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-black">Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileText className="text-[#a8aebf] mb-3" size={32} />
                <p className="text-[15px] font-bold text-[#5c6e8e]">Click to upload proof</p>
                <p className="text-[11px] text-[#9a9ba0] mt-1 uppercase font-bold tracking-wider">Images (max 300KB) | Docs (max 1MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-10 px-4 relative flex justify-center items-start">
      
      {/* ABOVE BANNER TOAST */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] bg-red-600 border border-red-700 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
           <AlertCircle size={20} />
           <p className="font-semibold text-[15px]">{toast.message}</p>
        </div>
      )}

      {/* Main Form Container - Styled like screenshot modal */}
      <div className="w-[500px] bg-[#EADED7] border-[1.5px] border-[#3A3A3A] rounded-[35px] shadow-sm relative overflow-hidden">
        
        {/* Close Button top-right */}
        <button onClick={() => navigate(-1)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[#D6C5BC] rounded-full border border-[#3A3A3A] transition-transform active:scale-95 text-[#333]">
          <X size={18} />
        </button>

        {/* Title Section */}
        <div className="pt-6 pb-4 px-6 text-center border-b border-[#D6C5BC]">
          <h1 className="text-2xl font-handwritten text-[#3A3A3A] font-medium tracking-wide">Professional Verification</h1>
          <p className="text-[#6B5A51] font-handwritten text-lg leading-tight mt-1 mx-auto whitespace-nowrap">
            Fill the form! Fields marked with * are compulsary.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-8 text-center text-[#3A3A3A]">
            <h3 className="text-xl font-handwritten font-bold mb-3">Application Submitted!</h3>
            <p className="font-handwritten text-lg">The admin team will review your application soon.</p>
            <button 
              onClick={() => {
                setStatus('');
                setFormData({ requestedTag: availableTags.length > 0 ? availableTags[0] : "", reason: '', url1: '', url2: '', url3: '' });
                setDocuments({ doc1: null, doc2: null, doc3: null });
              }}
              className="mt-6 px-6 py-2 bg-[#9DE5A7] border border-[#3A3A3A] rounded-[20px] font-handwritten text-lg transition-transform active:scale-95"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            
            {/* Tag Selection block */}
            <div className="px-6 py-4">
              <label className="block text-lg font-handwritten text-[#3A3A3A] mb-1">Select tag*</label>
              <select 
                value={formData.requestedTag}
                onChange={e => setFormData({...formData, requestedTag: e.target.value})}
                className="w-full h-11 px-4 bg-white rounded-[20px] font-handwritten text-xl text-[#3A3A3A] border-none outline-none cursor-pointer appearance-none shadow-sm"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%233A3A3A%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, 
                  backgroundRepeat: 'no-repeat', 
                  backgroundPosition: 'right 16px top 50%', 
                  backgroundSize: '12px auto' 
                }}
              >
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="w-full h-[1px] bg-[#D6C5BC]" />

            {/* Reason block */}
            <div className="px-6 py-4">
              <label className="block text-lg font-handwritten text-[#3A3A3A] mb-1">Why do you need this tag?*</label>
              <textarea 
                required
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                placeholder="Enter reason"
                className="w-full p-4 bg-white rounded-[20px] font-handwritten text-lg text-[#3A3A3A] placeholder-[#8A9DB8] border-none outline-none shadow-sm h-[130px] resize-none"
              />
            </div>

            <div className="w-full h-[1px] bg-[#D6C5BC]" />

            {/* Documents block */}
            <div className="px-6 py-4">
              <div className="mb-2">
                <label className="block text-xl font-handwritten text-[#3A3A3A]">Document proof*</label>
                <p className="text-[#8B7355] font-handwritten text-md -mt-1">ID cards, licenses, certificates, etc.</p>
              </div>

              {renderFileUploader('doc1', 'Document 1', true)}
              {renderFileUploader('doc2', 'Document 2', true)}
              {renderFileUploader('doc3', 'Document 3', false)}
            </div>

            <div className="w-full h-[1px] bg-[#D6C5BC]" />

            {/* URLs block */}
            <div className="px-6 pt-4 pb-8">
              <div className="mb-2">
                <label className="block text-xl font-handwritten text-[#3A3A3A]">URLs*</label>
                <p className="text-[#8B7355] font-handwritten text-md -mt-1">links to your website, drive, linkedin, etc.</p>
              </div>

              <div className="mb-3">
                <label className="block text-lg font-handwritten text-[#3A3A3A] mb-1">URL 1*</label>
                <input 
                  type="url"
                  required
                  value={formData.url1}
                  onChange={e => setFormData({...formData, url1: e.target.value})}
                  className="w-full h-[38px] px-4 bg-white rounded-[15px] font-handwritten text-lg border-none outline-none shadow-sm"
                />
              </div>

              <div className="mb-3">
                <label className="block text-lg font-handwritten text-[#3A3A3A] mb-1">URL 2</label>
                <input 
                  type="url"
                  value={formData.url2}
                  onChange={e => setFormData({...formData, url2: e.target.value})}
                  className="w-full h-[38px] px-4 bg-white rounded-[15px] font-handwritten text-lg border-none outline-none shadow-sm"
                />
              </div>

              <div className="mb-6">
                <label className="block text-lg font-handwritten text-[#3A3A3A] mb-1">URL 3</label>
                <input 
                  type="url"
                  value={formData.url3}
                  onChange={e => setFormData({...formData, url3: e.target.value})}
                  className="w-full h-[38px] px-4 bg-white rounded-[15px] font-handwritten text-lg border-none outline-none shadow-sm"
                />
              </div>

              {status && status !== 'submitting' && status !== 'success' && (
                <p className="text-red-600 text-sm font-bold text-center mb-4">{status}</p>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <button 
                  type="submit"
                  disabled={status === 'submitting' || processing.doc1 || processing.doc2 || processing.doc3}
                  className="px-8 py-2 bg-[#9DE5A7] border border-[#3A3A3A] text-[#3A3A3A] rounded-[20px] font-handwritten text-[22px] tracking-wide transition-transform active:scale-95 disabled:opacity-60 flex items-center gap-2 shadow-[2px_2px_0px_#3A3A3A]"
                >
                  {status === 'submitting' ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};

export default ApplicationForm;
