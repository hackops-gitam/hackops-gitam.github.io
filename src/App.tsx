import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ParticlesBackground from './components/ParticlesBackground';
import Home from './pages/Home';
import Events from './pages/Events';
import CTFs from './pages/CTFs';
import Team from './pages/Team';
import Contact from './pages/Contact';
import EventDetails from './pages/EventDetails';
import TechTeamAchievements from './pages/TechTeamAchievements'; // Import the new page
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { MembersPortal } from './pages/MembersPortal';
import { TaskDetails } from './pages/TaskDetails';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
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
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/ctfs" element={<CTFs />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/members-portal" element={<MembersPortal />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/task-details/:taskId" element={<TaskDetails />} />
            <Route path="/tech-team-achievements" element={<TechTeamAchievements />} /> {/* New route */}

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="*" element={<Navigate to="#" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}