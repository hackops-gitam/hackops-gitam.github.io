import { motion } from 'framer-motion';
import { TechTeamMember } from '../types';

interface MemberCardProps {
  member: TechTeamMember;
  onViewProfile: () => void;
}

export function MemberCard({ member, onViewProfile }: MemberCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.03, boxShadow: '0 10px 20px rgba(0, 255, 255, 0.2)', transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="relative"
    >
      <div className="text-center bg-navy-light/50 backdrop-blur-sm border border-gray-800/50 p-6 rounded-xl transition-all duration-300 hover:border-cyan-500/50">
        {/* Photo */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 p-1">
            <img
              src={member.photo}
              alt={member.name}
              className="w-full h-full rounded-full object-cover border-2 border-navy-light"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/128?text=No+Image';
              }}
            />
          </div>
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold mb-1 text-white">{member.name}</h3>

        {/* Batch and Branch */}
        <p className="text-gray-400 mb-2 text-sm">{member.batchAndBranch}</p>

        {/* TryHackMe Rank */}
        <p className="text-cyan-400 mb-2 text-sm">
          TryHackMe Rank: #{member.tryhackme.rank}
        </p>

        {/* Skills (Top 3) */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {member.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* View Profile Button */}
        <button
          onClick={onViewProfile}
          className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          View Full Profile
        </button>
      </div>
    </motion.div>
  );
}