import { motion } from 'framer-motion';
import { teamMembers } from '../data/team';
import { TeamCard } from '../components/TeamCard';
import ParticlesBackground from '../components/ParticlesBackground';

export default function Team() {
  // Group team members by term
  const groupedByTerm = teamMembers.reduce((acc, member) => {
    const term = member.term;
    if (!acc[term]) {
      acc[term] = [];
    }
    acc[term].push(member);
    return acc;
  }, {} as Record<string, typeof teamMembers>);

  // Get the current term (based on the current date: March 23, 2025)
  const currentYear = new Date().getFullYear(); // 2025
  const currentTerm = `${currentYear}-${currentYear + 1}`; // "2025-2026"

  // Sort terms: current term first, then previous terms in descending order
  const sortedTerms = Object.keys(groupedByTerm).sort((a, b) => {
    if (a === currentTerm) return -1; // Current term first
    if (b === currentTerm) return 1;
    return b.localeCompare(a); // Sort remaining terms in descending order (e.g., "2024-2025" before "2023-2024")
  });

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

          {/* Render each term group in a separate container */}
          {sortedTerms.map((term) => (
            <div key={term} className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-white text-center">
                Team {term}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {groupedByTerm[term].map((member) => (
                  <TeamCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}