import { CTFCard } from './CTFCard';
import { CTFEvent } from '../types';
import { motion } from 'framer-motion';

interface CTFListProps {
  ctfs: CTFEvent[];
}

export function CTFList({ ctfs }: CTFListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {ctfs.map((ctf, index) => (
        <motion.div
          key={ctf.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <CTFCard ctf={ctf} />
        </motion.div>
      ))}
    </div>
  );
}