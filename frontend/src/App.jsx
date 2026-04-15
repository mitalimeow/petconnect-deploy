import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClickSpark from './components/animations/ClickSpark';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LostFound from './pages/LostFound';
import EducationSection from './pages/Education';
import Helpline from './pages/Helpline';
import Community from './pages/Community';
import Applications from './pages/Applications';
import ApplicationForm from './pages/ApplicationForm';
import AdminPanel from './pages/AdminPanel';
import Adopt from './pages/Adopt';
import ProtectedRoute from './components/ProtectedRoute'; // Strict Guest Wall
import LocationGuard from './components/common/LocationGuard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ClickSpark sparkColor="#FFB7B2" sparkSize={12} sparkRadius={20} sparkCount={10} duration={600}>
          <div className="min-h-screen relative flex flex-col font-body bg-background text-foreground">
            <Navbar />

            <main className="flex-1 w-full relative z-10 pt-20">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                
                {/* Protected Application Features */}
                <Route path="/adopt" element={
                  <ProtectedRoute>
                    <LocationGuard 
                      title="Location Access Required" 
                      message="You must share your location to view pets, connect with local owners, or find nearby animal shelters."
                    >
                      <Adopt />
                    </LocationGuard>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/lost-found" element={
                  <ProtectedRoute>
                    <LocationGuard 
                      title="Lost & Found Secured" 
                      message="Location access is strictly required to pinpoint lost pet sightings, report incidents, and alert nearby users."
                    >
                      <LostFound />
                    </LocationGuard>
                  </ProtectedRoute>
                } />
                <Route path="/education/*" element={<ProtectedRoute><EducationSection /></ProtectedRoute>} />
                <Route path="/helpline" element={
                  <ProtectedRoute>
                    <LocationGuard 
                      title="Helpline Restricted" 
                      message="We need your location to securely map the verified 24/7 emergency veterinary clinics available in your immediate radius."
                    >
                      <Helpline />
                    </LocationGuard>
                  </ProtectedRoute>
                } />
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                <Route path="/applications/form" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
                <Route path="/admin-panel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </ClickSpark>
      </Router>
    </AuthProvider>
  );
}
export default App;
