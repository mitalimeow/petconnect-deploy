import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Check, X, ChevronDown, ChevronUp, FileText, ExternalLink, Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ApplicationCard = ({ app, onApprove, onDeny }) => {
  const [expanded, setExpanded] = useState(false);

  const downloadDocument = (doc, index) => {
    if (!doc.data) return;
    const a = document.createElement('a');
    a.href = doc.data;
    a.download = `proof_document_${index + 1}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${expanded ? 'shadow-md' : 'hover:shadow-md'}`}>
      {/* Collapsed Header (Clickable snippet) */}
      <div 
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <img 
            src={app.userId?.profilePhoto || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
            alt="Profile" 
            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
          />
          <div>
            <h3 className="font-bold text-xl text-gray-800">{app.userId?.name}</h3>
            <p className="text-[#8B7355] font-medium text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pastel-blue"></span>
              Requesting: {app.requestedTag}
            </p>
          </div>
        </div>
        <div className="text-gray-400">
          {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`transition-all duration-500 ease-in-out origin-top overflow-hidden bg-gray-50 ${expanded ? 'max-h-[800px] opacity-100 py-6 border-t border-gray-100' : 'max-h-0 opacity-0 py-0'}`}>
        <div className="px-6 space-y-6">
          
          {/* Detailed Profile Snippet */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
             <div className="flex flex-col">
               <span className="text-xs text-gray-500 uppercase font-black tracking-wider mb-1">Applicant Reference</span>
               <span className="text-sm font-medium text-gray-700">@{app.userId?.username}</span>
             </div>
             <Link to={`/profile/${app.userId?._id}`} className="px-4 py-2 bg-pastel-blue text-white rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                Full Profile
             </Link>
          </div>

          {/* Reason */}
          <div>
            <h4 className="text-sm text-gray-500 font-bold mb-2 uppercase">Application Note</h4>
            <div className="bg-white p-4 text-gray-700 rounded-xl border border-gray-200 text-sm italic leading-relaxed">
              "{app.reason}"
            </div>
          </div>

          {/* URLs */}
          {app.urls && app.urls.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-500 font-bold mb-2 uppercase flex items-center gap-2">
                <ExternalLink size={16} /> Reference URLs
              </h4>
              <div className="flex flex-wrap gap-2">
                {app.urls.map((url, i) => (
                  <a 
                    key={i} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-pastel-blue text-pastel-blue rounded-[10px] text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    Link {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {app.documents && app.documents.length > 0 && (
            <div>
              <h4 className="text-sm text-gray-500 font-bold mb-2 uppercase flex items-center gap-2">
                <FileText size={16} /> Attached Documents
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {app.documents.map((doc, i) => (
                  <button 
                    key={i}
                    onClick={() => downloadDocument(doc, i)}
                    className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-400 transition-colors text-sm font-bold text-gray-600 shadow-sm"
                  >
                    <Download size={16} /> Doc {i + 1} ({Math.round(doc.size / 1024)} KB)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="pt-4 flex gap-3">
             <button 
              onClick={() => onApprove(app._id)}
              className="flex-1 flex justify-center items-center gap-2 bg-[#9DE5A7] text-[#333] border border-[#333] py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-[2px_2px_0px_#333]"
             >
               <Check size={20} /> Approve
             </button>
             <button 
              onClick={() => onDeny(app._id)}
              className="flex-1 flex justify-center items-center gap-2 bg-[#FFB7B2] text-[#333] border border-[#333] py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-[2px_2px_0px_#333]"
             >
               <X size={20} /> Deny
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Verification Array Mapping
  const isAdmin = user?.tags?.some(tag => tag?.name === 'Admin' || tag === 'Admin') || user?.email === 'mitalipaullol268@gmail.com';
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/applications/admin/pending`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/admin/approve/${id}`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        setApplications(prev => prev.filter(app => app._id !== id));
      } else {
        alert('Failed to approve application');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeny = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/admin/deny/${id}`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        setApplications(prev => prev.filter(app => app._id !== id));
      } else {
        alert('Failed to deny application');
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 min-h-[85vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-handwritten text-[#3A3A3A] mb-2 tracking-wide uppercase">Admin Hub</h1>
          <p className="text-gray-500 font-medium">Manage pending professional tag verifications.</p>
        </div>
        <button 
          onClick={fetchApplications}
          className="w-fit px-6 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-[20px] font-bold shadow-sm active:scale-95 transition-transform"
        >
          Refresh Grid
        </button>
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-20 text-gray-400 font-bold animate-pulse">Loading secure applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-[#FAF6F3] py-24 rounded-[40px] border-[2px] border-dashed border-[#D6C5BC] flex flex-col items-center shadow-inner">
          <p className="text-2xl text-[#8B7355] font-handwritten font-bold mb-2">Inbox Empty</p>
          <p className="text-gray-500 font-medium">There are no pending applications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map(app => (
            <ApplicationCard 
              key={app._id} 
              app={app} 
              onApprove={handleApprove} 
              onDeny={handleDeny} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
