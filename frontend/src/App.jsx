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
import ProtectedRoute from './components/ProtectedRoute'; // Strict Guest Wall

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
                <Route path="/adopt" element={<ProtectedRoute><Adopt /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
                <Route path="/education/*" element={<ProtectedRoute><EducationSection /></ProtectedRoute>} />
                <Route path="/helpline" element={<ProtectedRoute><Helpline /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                <Route path="/admin-panel" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </ClickSpark>
      </Router>
    </AuthProvider>
  );
}
              </Routes>
            </main>
          </div>
        </ClickSpark>
      </Router>
    </AuthProvider>
  );
}

export default App;
