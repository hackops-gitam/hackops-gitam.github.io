import { motion } from 'framer-motion';
import { TechTeamMember } from '../types';
import { Github, Mail, X, Link2 } from 'lucide-react';

interface MemberPopupProps {
  member: TechTeamMember;
  onClose: () => void;
}

export function MemberPopup({ member, onClose }: MemberPopupProps) {
  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={popupVariants}
      role="dialog"
      aria-labelledby="member-popup-title"
      aria-modal="true"
    >
      <div className="bg-navy-light/80 backdrop-blur-md border border-gray-800/50 rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            id="member-popup-title"
            className="text-2xl font-bold text-white"
          >
            {member.name}'s Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Close popup"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Photo and Social Links */}
          <div className="space-y-4">
            <img
              src={member.photo}
              alt={member.name}
              className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-cyan-500/30"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/128?text=No+Image';
              }}
            />
            <div className="flex justify-center gap-4">
              {member.socials.email && (
                <a
                  href={member.socials.email}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400"
                  aria-label={`${member.name}'s email`}
                >
                  <Mail size={24} />
                </a>
              )}
              {member.socials.github && (
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400"
                  aria-label={`${member.name}'s GitHub profile`}
                >
                  <Github size={24} />
                </a>
              )}
              {member.socials.x && (
                <a
                  href={member.socials.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400"
                  aria-label={`${member.name}'s X profile`}
                >
                  <X size={24} />
                </a>
              )}
              {member.socials.blog && (
                <a
                  href={member.socials.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan-400"
                  aria-label={`${member.name}'s blog`}
                >
                  <Link2 size={24} />
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Batch and Branch */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Batch & Branch
              </h3>
              <p className="text-gray-300">{member.batchAndBranch}</p>
            </div>

            {/* TryHackMe Stats */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                TryHackMe Stats
              </h3>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="font-semibold text-cyan-400">Rank:</span> #{member.tryhackme.rank}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-cyan-400">Completed Rooms:</span> {member.tryhackme.completedRooms}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold text-cyan-400">Achievements:</span>
                </p>
                <ul className="list-disc list-inside text-gray-300">
                  {member.tryhackme.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
                {member.tryhackme.profileCardUrl && (
                  <div className="mt-4">
                    <img
                      src={member.tryhackme.profileCardUrl}
                      alt={`${member.name}'s TryHackMe profile card`}
                      className="w-full max-w-xs rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Certifications
              </h3>
              <ul className="list-disc list-inside text-gray-300">
                {member.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Bio</h3>
              <p className="text-gray-300">{member.bio}</p>
            </div>

            {/* Testimonial */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Testimonial
              </h3>
              <p className="text-gray-300 italic">"{member.testimonial}"</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}