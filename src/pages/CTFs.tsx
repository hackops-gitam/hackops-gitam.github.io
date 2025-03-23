import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { CTFList } from '../components/CTFList';
import { Loader2 } from 'lucide-react';
import { useCTFs } from '../hooks/useCTFs';
import ParticlesBackground from '../components/ParticlesBackground'; // Adjust the path as needed

export default function CTFs() {
  const [activeTab, setActiveTab] = useState<'ctfs' | 'hackathons'>('ctfs');
  const { ctfs, loading, error } = useCTFs();

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
            <h1 className="text-4xl font-bold mb-4 text-white">CTFs & Hackathons</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Participate in exciting cybersecurity challenges and compete with teams worldwide
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={activeTab === 'ctfs' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('ctfs')}
            >
              CTFs
            </Button>
            <Button
              variant={activeTab === 'hackathons' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('hackathons')}
            >
              Hackathons
            </Button>
          </div>

          {activeTab === 'ctfs' && (
            <div>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-cyan" size={32} />
                </div>
              ) : error ? (
                <div className="text-center text-red-400 py-8">{error}</div>
              ) : (
                <CTFList ctfs={ctfs} />
              )}
            </div>
          )}

          {activeTab === 'hackathons' && (
            <div className="text-center py-8">
              <p className="text-gray-300">Hackathon listings coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}