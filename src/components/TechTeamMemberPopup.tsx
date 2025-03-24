import { motion } from 'framer-motion';
import { TechTeamMember } from '../types';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

interface TechTeamMemberPopupProps {
  member: TechTeamMember;
  onClose: () => void;
}

export function TechTeamMemberPopup({ member, onClose }: TechTeamMemberPopupProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50"
      role="dialog"
      aria-labelledby="member-profile-title"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-navy-light/80 backdrop-blur-lg p-8 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-800/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="member-profile-title" className="text-3xl font-bold text-white">{member.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Photo and Social Links */}
          <div className="col-span-1">
            <img
              src={member.photo}
              alt={member.name}
              className="w-48 h-48 rounded-full object-cover mx-auto mb-4 border-4 border-gradient-to-r from-cyan-500/30 to-purple-500/30"
            />
            <div className="flex justify-center gap-4 mb-4">
              {member.socials.email && (
                <a href={member.socials.email} className="text-gray-400 hover:text-cyan-400">
                  <Mail size={24} />
                </a>
              )}
              {member.socials.github && (
                <a href={member.socials.github} className="text-gray-400 hover:text-cyan-400">
                  <Github size={24} />
                </a>
              )}
              {member.socials.twitter && (
                <a href={member.socials.twitter} className="text-gray-400 hover:text-cyan-400">
                  <Twitter size={24} />
                </a>
              )}
              {member.socials.blog && (
                <a href={member.socials.blog} className="text-gray-400 hover:text-cyan-400">
                  <span className="text-sm">Blog</span>
                </a>
              )}
            </div>
            <p className="text-gray-300 text-center">{member.batchAndBranch}</p>
          </div>

          {/* Right Column: Details */}
          <div className="col-span-2 space-y-6">
            {/* Bio */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Bio</h3>
              <p className="text-gray-300">{member.bio}</p>
            </div>

            {/* TryHackMe Stats */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">TryHackMe Stats</h3>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300">Rank: <span className="text-cyan-400">{member.tryHackMe.rank}</span></p>
                <p className="text-gray-300">Completed Rooms: <span className="text-cyan-400">{member.tryHackMe.completedRooms}</span></p>
                <p className="text-gray-300">Achievements: <span className="text-cyan-400">{member.tryHackMe.achievements.join(', ')}</span></p>
                <a
                  href={member.tryHackMe.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline mt-2 inline-block"
                >
                  View TryHackMe Profile
                </a>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Certifications</h3>
              <ul className="list-disc list-inside text-gray-300">
                {member.certifications.length > 0 ? (
                  member.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))
                ) : (
                  <li>No certifications available.</li>
                )}
              </ul>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {member.skills.length > 0 ? (
                  member.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-300">No skills listed.</p>
                )}
              </div>
            </div>

            {/* Testimonial */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Testimonial</h3>
              <p className="text-gray-300 italic">"{member.testimonial}"</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}