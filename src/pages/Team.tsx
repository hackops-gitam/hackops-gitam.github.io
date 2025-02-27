import { motion } from 'framer-motion';
import { teamMembers } from '../data/team';
import { TeamCard } from '../components/TeamCard';

export default function Team() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Our Team</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Meet the passionate individuals behind HackOps Club.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map(member => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}