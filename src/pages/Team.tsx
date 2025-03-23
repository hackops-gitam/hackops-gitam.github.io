import { motion } from 'framer-motion';
import { teamMembers } from '../data/team';
import { TeamCard } from '../components/TeamCard';
import ParticlesBackground from '../components/ParticlesBackground'; // Adjust the path as needed

export default function Team() {
  return (
    <div className="relative min-h-screen">
      {/* Particles Background */}
      <ParticlesBackground />

      {/* Glassmorphism Container */}
      <div className="relative z-10 min-h-screen bg-black/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4 text-white">Our Team</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Meet the passionate individuals behind HackOps Club.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map(member => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}