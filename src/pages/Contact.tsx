import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, MapPin, Phone, Linkedin, Twitter, Github, HelpCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ParticlesBackground from '../components/ParticlesBackground';
import { useState } from 'react';

export default function Contact() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  };

  const faqs = [
    {
      q: 'Do teachers intervene in this club while teaching CyberSecurity?',
      a: 'No, HackOPS is entirely student-run. We believe in a peer-driven learning model, where students take the lead in sharing knowledge and insights about cybersecurity. While teachers may offer guidance and support, we emphasise students teaching and learning from each other.',
    },
    {
      q: 'Do we require heavy knowledge of coding to excel in CyberSecurity?',
      a: 'Not necessarily. HackOPS welcomes students from various backgrounds and skill levels. While coding can be an asset in certain aspects of cybersecurity, our club is designed to accommodate individuals with diverse skill sets. We offer opportunities to learn coding and other necessary skills as part of our activities.',
    },
    {
      q: 'Can students of any school and stream join HackOPS?',
      a: 'Absolutely! HackOPS is open to students from all schools and streams, regardless of their previous exposure to cybersecurity. We believe that diversity enriches our community and encourages a broader perspective on cybersecurity issues.',
    },
    {
      q: 'What are the prerequisites to be done before starting with this stream?',
      a: 'There are no strict prerequisites to join HackOPS. All you need is an interest in cybersecurity and a willingness to learn. We provide resources and support to help you get started, regardless of your background.',
    },
    {
      q: 'While learning this stream, does my working environment get hacked?',
      a: 'No, your working environment is not at risk during your participation in HackOPS. We prioritize ethical and responsible learning. Our activities are focused on understanding cybersecurity to prevent and mitigate hacking and cyber threats, not engage in harmful activities.',
    },
    {
      q: 'What software is meant to be installed before starting?',
      a: 'The specific software requirements may vary depending on your activities within HackOPS. We will provide guidance on recommended software installations, and many cybersecurity tools are freely available. You won’t need any specialized software to get started, and we’ll support you in setting up the necessary tools as you progress in your cybersecurity journey.',
    },
  ];

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
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan to-blue-400 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Get in touch with us for any inquiries or collaboration opportunities
            </p>
          </motion.div>

          <div className="space-y-8">
            <Card className="bg-navy-light/50 backdrop-blur-sm border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-white">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-cyan" size={20} />
                  <span className="text-gray-300">hackopsgitam@gmail.com</span>
                  <Button
                    variant="secondary"
                    className="ml-2 px-2 py-1 text-xs"
                    onClick={() => copyToClipboard('hackopsgitam@gmail.com')}
                  >
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-cyan" size={20} />
                  <span className="text-gray-300">+91 7993703484</span>
                  <Button
                    variant="secondary"
                    className="ml-2 px-2 py-1 text-xs"
                    onClick={() => copyToClipboard('+91 7993703484')}
                  >
                    Copy
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-cyan" size={20} />
                  <span className="text-gray-300">GITAM UNIVERSITY, Hyderabad</span>
                </div>
              </div>
              <p className="text-gray-400 mt-4">We respond within 24-48 hours, Monday to Friday.</p>
            </Card>

            <Card className="bg-navy-light/50 backdrop-blur-sm border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-white">Our Location</h2>
              <MapContainer center={[17.550412, 78.165716]} zoom={13} style={{ height: '300px', borderRadius: '8px' }} className="w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[17.550412, 78.165716]} />
              </MapContainer>
            </Card>

            <Card className="bg-navy-light/50 backdrop-blur-sm border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-700">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    className={`flex items-center gap-2 w-full text-left p-2 rounded text-sm font-medium text-white hover:bg-gray-800 focus:outline-none ${openFAQ === i ? 'bg-gray-800' : 'bg-navy-light/50'}`}
                    aria-expanded={openFAQ === i}
                  >
                    <HelpCircle size={16} className="text-cyan" />
                    {faq.q}
                  </button>
                  {openFAQ === i && <p className="p-2 text-gray-400">{faq.a}</p>}
                </div>
              ))}
            </Card>

            <Card className="bg-navy-light/50 backdrop-blur-sm border border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-white">Follow Us</h2>
              <div className="flex gap-4">
                <a
                  href="https://linkedin.com/company/hackops-gitam"
                  aria-label="Visit our LinkedIn profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan focus:ring-2 focus:ring-cyan"
                >
                  <Linkedin size={24} />
                </a>
                <a
                  href="https://twitter.com/hackopsgitam"
                  aria-label="Visit our Twitter profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan focus:ring-2 focus:ring-cyan"
                >
                  <Twitter size={24} />
                </a>
                <a
                  href="https://github.com/hackops-gitam"
                  aria-label="Visit our GitHub profile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-cyan focus:ring-2 focus:ring-cyan"
                >
                  <Github size={24} />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}