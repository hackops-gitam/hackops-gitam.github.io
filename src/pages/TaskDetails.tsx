// src/pages/TaskDetails.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tasks } from '../data/tasks';
import { TaskSubmissionForm } from '../components/TaskSubmissionForm';
import { Card } from '../components/ui/Card';
import Linkify from 'react-linkify'; // Import for hyperlink support
import { Button } from '../components/ui/Button';

export function TaskDetails() {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const foundTask = tasks.find((t) => t.taskId === taskId);
    if (foundTask) {
      setTask(foundTask);
    } else {
      setError('Task not found');
    }
    setLoading(false);
  }, [taskId]);

  if (loading) return <div className="text-white text-center p-6">Loading...</div>;
  if (error || !task) return <div className="text-red-500 text-center p-6">{error || 'Task not found'}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-navy">
      <Card className="max-w-4xl mx-auto p-4 sm:p-6 bg-navy-light border-2 border-cyan rounded-lg shadow-lg">
        {/* Task Details Section */}
        <section className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan mb-4 text-center">
            {task.taskName}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-navy-dark p-4 rounded-lg">
              <p className="text-gray-300"><strong>Date:</strong> {task.date}</p>
              <p className="text-gray-300"><strong>Submission Deadline:</strong> {task.submissionDeadline}</p>
            </div>
            <div className="bg-navy-dark p-4 rounded-lg">
              <p className="text-gray-400">
                <strong>Description:</strong>{' '}
                <Linkify>
                  {task.taskDescription}
                </Linkify>
              </p>
            </div>
          </div>
        </section>

        {/* Task Submission Form Section */}
        <section className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-cyan mb-4 text-center">
            Task Submission Form
          </h2>
          <TaskSubmissionForm eventName={task.taskName} />
        </section>
      </Card>
    </div>
  );
}