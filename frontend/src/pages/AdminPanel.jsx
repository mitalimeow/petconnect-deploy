import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.tags?.some(tag => tag?.name === 'Admin' || tag === 'Admin') || user?.email === 'mitalipaullol268@gmail.com';
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/applications/admin/pending', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
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
      const res = await fetch(`http://localhost:5000/api/applications/admin/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        fetchApplications();
      } else {
        alert('Failed to approve application');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-handwritten text-[#8B7355]">Admin Panel</h1>
        <button 
          onClick={fetchApplications}
          className="px-4 py-2 bg-pastel-blue text-white rounded-xl shadow-soft hover:scale-105 transition-transform"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="bg-white p-12 rounded-[30px] border border-border shadow-sm text-center">
          <p className="text-xl text-gray-500 font-handwritten">0 Pending Applications</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map(app => (
            <div key={app._id} className="bg-white p-6 rounded-[30px] border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg text-[#8B7355]">{app.userId.name} ({app.userId.email})</h3>
                <p className="text-pastel-blue font-medium mt-1">Requesting Tag: {app.requestedTag}</p>
                <p className="text-gray-600 mt-2 text-sm">{app.reason}</p>
                {app.proofLink && (
                  <a href={app.proofLink} target="_blank" rel="noreferrer" className="text-pastel-pink text-sm hover:underline mt-2 block">
                    View Proof Document
                  </a>
                )}
              </div>
              <button 
                onClick={() => handleApprove(app._id)}
                className="px-6 py-2 bg-pastel-green text-white rounded-xl shadow-soft hover:bg-green-400 transition-colors whitespace-nowrap"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
