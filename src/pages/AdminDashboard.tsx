// src/pages/AdminDashboard.tsx
import { useState } from 'react';
import { AdminEvents } from './AdminEvents';
import { AdminTaskSubmissions } from './AdminTaskSubmissions';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<'events' | 'tasks'>('events');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="p-4 sm:p-6 bg-navy-light border-2 border-cyan rounded-lg shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan text-center mb-6">Admin Dashboard</h2>
        <div className="flex flex-col sm:flex-row justify-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <Button
            variant={activeSection === 'events' ? 'primary' : 'secondary'}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
            onClick={() => setActiveSection('events')}
          >
            Event Registrations
          </Button>
          <Button
            variant={activeSection === 'tasks' ? 'primary' : 'secondary'}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
            onClick={() => setActiveSection('tasks')}
          >
            Task Submissions
          </Button>
        </div>
        {activeSection === 'events' ? <AdminEvents /> : <AdminTaskSubmissions />}
      </Card>
    </div>
  );
}