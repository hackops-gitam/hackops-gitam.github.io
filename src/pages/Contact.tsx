import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, MapPin, Phone, Linkedin, Twitter, Github } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Get in touch with us for any inquiries or collaboration opportunities
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full bg-navy border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-cyan"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full bg-navy border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-cyan"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full bg-navy border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:border-cyan"
              ></textarea>
            </div>
            <Button type="submit">Send Message</Button>
          </form>
        </Card>

        <div className="space-y-8">
          <Card>
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-cyan" size={20} />
                <span>hackopsgitam@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-cyan" size={20} />
                <span>+91 7993703484</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-cyan" size={20} />
                <span>GITAM UNIVERSITY , Hyderabad</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold mb-6">Follow Us</h2>
            <div className="flex gap-4">
              <a href="https://linkedin.com/company/hackops-gitam" className="text-gray-400 hover:text-cyan">
                <Linkedin size={24} />
              </a>
              <a href="https://twitter.com/hackopsgitam" className="text-gray-400 hover:text-cyan">
                <Twitter size={24} />
              </a>
              <a href="https://github.com/hackops-gitam" className="text-gray-400 hover:text-cyan">
                <Github size={24} />
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}