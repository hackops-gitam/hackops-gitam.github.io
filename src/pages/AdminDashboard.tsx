import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { AdminEvents } from './AdminEvents';
import { AdminTaskSubmissions } from './AdminTaskSubmissions';
import { AdminTasks } from './AdminTasks'; // New import

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'events' | 'submissions' | 'tasks'>('events');

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.location.href = '/#/admin/login';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="secondary">
          Logout
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          variant={activeTab === 'events' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('events')}
        >
          Event Registrations
        </Button>
        <Button
          variant={activeTab === 'submissions' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('submissions')}
        >
          Task Submissions
        </Button>
        <Button
          variant={activeTab === 'tasks' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('tasks')}
        >
          Manage Tasks
        </Button>
      </div>

      {activeTab === 'events' && <AdminEvents />}
      {activeTab === 'submissions' && <AdminTaskSubmissions />}
      {activeTab === 'tasks' && <AdminTasks />}
    </div>
  );
}