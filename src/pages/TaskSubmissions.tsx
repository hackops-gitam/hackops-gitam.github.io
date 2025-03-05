// src/pages/TaskSubmissions.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasks } from '../data/tasks';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Linkify from 'react-linkify'; // Import for hyperlink support

export function TaskSubmissions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate data fetch (since data is from tasks.ts, no async fetch needed)
    setLoading(false);
  }, []);

  if (loading) return <div className="text-white text-center p-6">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-cyan text-center mb-6">Task Submissions</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          task.useCustomForm && (
            <Card key={task.taskId} className="p-6 bg-navy-light border-cyan hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-cyan mb-2">{task.taskName}</h2>
              <p className="text-gray-300 mb-2">Date: {task.date}</p>
              <p className="text-gray-300 mb-2">Deadline: {task.submissionDeadline}</p>
              <p className="text-gray-400 mb-4">
                Description: <Linkify>{task.taskDescription}</Linkify>
              </p>
              <Link to={`/task-details/${task.taskId}`}>
                <Button variant="primary" className="w-full">
                  Submit Task
                </Button>
              </Link>
            </Card>
          )
        ))}
      </div>
      {tasks.filter(task => task.useCustomForm).length === 0 && (
        <p className="text-white text-center mt-6">No tasks available for submission.</p>
      )}
    </div>
  );
}