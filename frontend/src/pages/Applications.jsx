import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const LEVEL_2_TAGS = [
  "Shelter Owner", "Vet", "Pet Store", "Trainer", 
  "Ethical Breeder", "Transporter", "Pet Stylist"
];

const Applications = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    requestedTag: LEVEL_2_TAGS[0],
    reason: '',
    proofLink: ''
  });
  const [status, setStatus] = useState('');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
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

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 min-h-screen">
      <div className="bg-white p-8 rounded-[30px] border border-border shadow-sm">
        <h1 className="text-3xl font-bold font-handwritten text-[#8B7355] mb-2">Professional Verification</h1>
        <p className="text-gray-600 mb-8">Apply for expert tags to build trust within the PetConnect community!</p>

        {status === 'success' ? (
          <div className="bg-pastel-bg p-6 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-pastel-pink mb-2">Application Submitted!</h3>
            <p className="text-gray-700">The admin team will review your application soon. You will receive a notification once approved.</p>
            <button 
              onClick={() => setStatus('')}
              className="mt-6 px-6 py-2 bg-pastel-blue text-white rounded-xl shadow-soft"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Tag</label>
              <select 
                value={formData.requestedTag}
                onChange={e => setFormData({...formData, requestedTag: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-blue outline-none transition-all cursor-pointer"
              >
                {LEVEL_2_TAGS.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Why do you need this tag?</label>
              <textarea 
                required
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                placeholder="Briefly explain your business or experience..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-blue outline-none transition-all h-32 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Proof Document Link (Optional)</label>
              <input 
                type="url"
                value={formData.proofLink}
                onChange={e => setFormData({...formData, proofLink: e.target.value})}
                placeholder="Google Drive, LinkedIn profile, or Website URL"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pastel-blue outline-none transition-all"
              />
            </div>

            {status && status !== 'submitting' && (
              <p className="text-red-500 text-sm font-medium">{status}</p>
            )}

            <button 
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-3 bg-[#8B7355] hover:bg-[#7a6449] text-white rounded-2xl font-bold tracking-wide shadow-soft transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Applications;
