import { motion } from 'framer-motion';
import { TeamMember } from '../types';
import { Card } from './ui/Card';
import { Github, Linkedin, Twitter, Instagram, Mail } from 'lucide-react';

interface TeamCardProps {
  member: TeamMember;
}

export function TeamCard({ member }: TeamCardProps) {
  // Animation variants for the card (adjusted to work with staggered animation from Team.tsx)
  const cardVariants = {
    hidden: { opacity: 0, y: 20 }, // This matches the parent stagger animation
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.03, boxShadow: '0 10px 20px rgba(0, 255, 255, 0.2)', transition: { duration: 0.3 } },
  };

  // Animation variants for the image
  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, delay: 0.1 } },
    hover: { scale: 1.1, transition: { duration: 0.3 } },
  };

  // Animation variants for the text (name and role)
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 } },
  };

  // Animation variants for social icons
  const socialVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: 0.3 + i * 0.1 },
    }),
    hover: { scale: 1.2, color: '#64ffda', transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover" // Keep the hover animation
      className="relative"
    >
      <Card className="text-center bg-navy-light/50 backdrop-blur-sm border border-gray-800/50 p-6 rounded-xl transition-all duration-300 hover:border-cyan-500/50">
        {/* Image with circular gradient border */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <motion.div
            variants={imageVariants}
            whileHover="hover"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 p-1"
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full rounded-full object-cover border-2 border-navy-light"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/128?text=No+Image'; // Fallback image
              }}
            />
          </motion.div>
        </div>

        {/* Name and Role */}
        <motion.h3
          variants={textVariants}
          className="text-xl font-bold mb-1 text-white"
        >
          {member.name}
        </motion.h3>
        <motion.p
          variants={textVariants}
          className="text-cyan-400 mb-4 text-sm font-medium"
        >
          {member.role}
        </motion.p>

        {/* Social Icons */}
        <div className="flex justify-center gap-4">
          {member.socials.github && (
            <motion.a
              href={member.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              variants={socialVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={0}
              className="text-gray-400"
            >
              <Github size={20} />
            </motion.a>
          )}
          {member.socials.linkedin && (
            <motion.a
              href={member.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              variants={socialVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={1}
              className="text-gray-400"
            >
              <Linkedin size={20} />
            </motion.a>
          )}
          {member.socials.twitter && (
            <motion.a
              href={member.socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              variants={socialVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={2}
              className="text-gray-400"
            >
              <Twitter size={20} />
            </motion.a>
          )}
          {member.socials.Instagram && (
            <motion.a
              href={member.socials.Instagram}
              target="_blank"
              rel="noopener noreferrer"
              variants={socialVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={3}
              className="text-gray-400"
            >
              <Instagram size={20} />
            </motion.a>
          )}
          {member.socials.Mail && (
            <motion.a
              href={member.socials.Mail}
              target="_blank"
              rel="noopener noreferrer"
              variants={socialVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              custom={4}
              className="text-gray-400"
            >
              <Mail size={20} />
            </motion.a>
          )}
        </div>
      </Card>
    </motion.div>
  );
}