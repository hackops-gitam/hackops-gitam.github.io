import { TeamMember } from '../types';
import { Card } from './ui/Card';
import { Github, Linkedin, Twitter } from 'lucide-react';

interface TeamCardProps {
  member: TeamMember;
}

export function TeamCard({ member }: TeamCardProps) {
  return (
    <Card className="text-center">
      <img
        src={member.image}
        alt={member.name}
        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
      />
      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
      <p className="text-cyan mb-4">{member.role}</p>
      <div className="flex justify-center gap-4">
        {member.socials.github && (
          <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan">
            <Github size={20} />
          </a>
        )}
        {member.socials.linkedin && (
          <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan">
            <Linkedin size={20} />
          </a>
        )}
        {member.socials.twitter && (
          <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan">
            <Twitter size={20} />
          </a>
        )}
      </div>
    </Card>
  );
}