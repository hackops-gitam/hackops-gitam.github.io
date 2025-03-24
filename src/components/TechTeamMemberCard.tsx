import { motion } from 'framer-motion';
import { TechTeamMember } from '../types';

interface TechTeamMemberCardProps {
  member: TechTeamMember;
  onClick: () => void;
}

export function TechTeamMemberCard({ member, onClick }: TechTeamMemberCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.03, boxShadow: '0 10px 20px rgba(0, 255, 255, 0.2)', transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="text-center bg-navy-light/50 backdrop-blur-sm border border-gray-800/50 p-6 rounded-xl transition-all duration-300 hover:border-cyan-500/50">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 p-1">
            <img
              src={member.photo}
              alt={member.name}
              className="w-full h-full rounded-full object-cover border-2 border-navy-light"
            />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-1 text-white">{member.name}</h3>
        <p className="text-cyan-400 mb-2 text-sm font-medium">{member.batchAndBranch}</p>
        <div className="text-gray-300 text-sm mb-4">
          <p>TryHackMe Rank: <span className="text-cyan-400">{member.tryHackMe.rank}</span></p>
          <p>Completed Rooms: <span className="text-cyan-400">{member.tryHackMe.completedRooms}</span></p>
        </div>
        <div className="flex justify-center gap-2">
          <span className="text-gray-400 text-xs">Click to view full profile</span>
        </div>
      </div>
    </motion.div>
  );
}