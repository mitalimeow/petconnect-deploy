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
import AdminPanel from './pages/AdminPanel';
import Adopt from './pages/Adopt';

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
                <Route path="/adopt" element={<Adopt />} />
                <Route path="/about" element={<About />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/lost-found" element={<LostFound />} />
                <Route path="/education/*" element={<EducationSection />} />
                <Route path="/helpline" element={<Helpline />} />
                <Route path="/community" element={<Community />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/admin-panel" element={<AdminPanel />} />
              </Routes>
            </main>
          </div>
        </ClickSpark>
      </Router>
    </AuthProvider>
  );
}

export default App;
