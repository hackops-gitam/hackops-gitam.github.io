import { CTFEvent } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Trophy, Calendar, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/dateUtils';

interface CTFCardProps {
  ctf: CTFEvent;
}

export function CTFCard({ ctf }: CTFCardProps) {
  const difficultyColors = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-red-400',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <Trophy className="text-cyan" size={24} />
          <div>
            <h3 className="text-xl font-bold">{ctf.title}</h3>
            <p className="text-gray-400">{ctf.organizer}</p>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-cyan" />
            <span className="text-gray-400">
              {formatDate(ctf.startDate)} - {formatDate(ctf.endDate)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-cyan" />
            <span className="text-gray-400">{ctf.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Star size={16} className="text-cyan" />
            <span className={difficultyColors[ctf.difficulty]}>
              {ctf.difficulty.charAt(0).toUpperCase() + ctf.difficulty.slice(1)}
            </span>
          </div>
        </div>

        <Button
          href={ctf.registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          Register Now
        </Button>
      </Card>
    </motion.div>
  );
}