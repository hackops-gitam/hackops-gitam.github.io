import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ParticlesBackground from './components/ParticlesBackground';
import Home from './pages/Home';
import Events from './pages/Events';
import CTFs from './pages/CTFs';
import Team from './pages/Team';
import Contact from './pages/Contact';
import EventDetails from './pages/EventDetails';
import { AdminLogin } from './components/AdminLogin'; // Import the admin login component
import { AdminEvents } from './pages/AdminEvents'; // Import the admin events component

// ProtectedRoute component to restrict access to admin pages
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // Check admin status from localStorage
  return isAdmin ? children : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-navy text-white overflow-x-hidden">
        <ParticlesBackground />
        <Header />
        <main className="relative pt-20">
          <Routes>
            {/* Existing Routes - No Changes */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/ctfs" element={<CTFs />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/event/:id" element={<EventDetails />} />

            {/* New Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute>
                  <AdminEvents />
                </ProtectedRoute>
              }
            />

            {/* Default Route - No Change */}
            <Route path="*" element={<Navigate to="/event/0" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}