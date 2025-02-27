import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ParticlesBackground from './components/ParticlesBackground';
import Home from './pages/Home';
import Events from './pages/Events';
import CTFs from './pages/CTFs';
import Team from './pages/Team';
import Contact from './pages/Contact';
import EventDetails from './pages/EventDetails';

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-navy text-white overflow-x-hidden">
        <ParticlesBackground />
        <Header />
        <main className="relative pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/ctfs" element={<CTFs />} /> 
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/event/:id" element={<EventDetails />} />  {/* Event Details Page */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
