import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: string;
  task_id: string;
  task_name: string;
  date: string;
  submission_deadline: string;
  task_description: string;
  use_custom_form: boolean;
  require_image: boolean;
  require_docs: boolean;
}

interface FormData {
  task_id: string;
  task_name: string;
  date: string;
  submission_deadline: string;
  task_description: string;
  use_custom_form: boolean;
}

export function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      task_id: '',
      task_name: '',
      date: '',
      submission_deadline: '',
      task_description: '',
      use_custom_form: true,
    },
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (tasksError) throw tasksError;
      console.log('Fetched tasks:', tasksData);
      setTasks(tasksData || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            task_id: data.task_id,
            task_name: data.task_name,
            date: data.date,
            submission_deadline: data.submission_deadline,
            task_description: data.task_description,
            use_custom_form: data.use_custom_form,
          })
          .eq('id', editingTask.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{
            task_id: data.task_id,
            task_name: data.task_name,
            date: data.date,
            submission_deadline: data.submission_deadline,
            task_description: data.task_description,
            use_custom_form: data.use_custom_form,
            require_image: false,
            require_docs: false,
          }]);
        if (error) throw error;
      }
      fetchTasks();
      reset();
      setEditingTask(null);
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    reset({
      task_id: task.task_id,
      task_name: task.task_name,
      date: task.date,
      submission_deadline: task.submission_deadline,
      task_description: task.task_description,
      use_custom_form: task.use_custom_form,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task? This will also delete any associated quizzes and submissions.')) return;
    try {
      const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('task_id')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      const taskId = task.task_id;

      const { error: submissionDeleteError } = await supabase
        .from('task_submissions')
        .delete()
        .eq('event_name', taskId);
      if (submissionDeleteError) throw submissionDeleteError;

      const { error: taskDeleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      if (taskDeleteError) throw taskDeleteError;

      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to delete task: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSubmitTask = (task: Task) => {
    // Navigate to MembersPortal with query params to trigger quiz and submission
    navigate(`/members-portal?tab=submissions&submitTaskId=${task.id}`);
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-cyan mb-6">Manage Tasks</h2>
      <Card className="p-6 mb-6 bg-navy-light border-cyan">
        <h3 className="text-xl font-semibold text-white mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-white">Task ID</label>
            <input
              {...register('task_id', { required: 'Task ID is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {errors.task_id && <p className="text-red-500">{errors.task_id.message}</p>}
          </div>
          <div>
            <label className="block text-white">Task Name</label>
            <input
              {...register('task_name', { required: 'Task Name is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {errors.task_name && <p className="text-red-500">{errors.task_name.message}</p>}
          </div>
          <div>
            <label className="block text-white">Date</label>
            <input
              type="date"
              {...register('date', { required: 'Date is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {errors.date && <p className="text-red-500">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-white">Submission Deadline</label>
            <input
              type="date"
              {...register('submission_deadline', { required: 'Submission Deadline is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {errors.submission_deadline && <p className="text-red-500">{errors.submission_deadline.message}</p>}
          </div>
          <div>
            <label className="block text-white">Task Description</label>
            <textarea
              {...register('task_description', { required: 'Task Description is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
              rows={4}
            />
            {errors.task_description && <p className="text-red-500">{errors.task_description.message}</p>}
          </div>
          <div>
            <label className="block text-white">Use Custom Form</label>
            <input
              type="checkbox"
              {...register('use_custom_form')}
              className="h-5 w-5 text-cyan border-gray-800 rounded focus:ring-cyan"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full">
            {editingTask ? 'Update Task' : 'Add Task'}
          </Button>
          {editingTask && (
            <Button
              type="button"
              variant="secondary"
              className="w-full mt-2"
              onClick={() => {
                setEditingTask(null);
                reset();
              }}
            >
              Cancel Edit
            </Button>
          )}
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </Card>
      <Card className="p-6 bg-navy-light border-cyan">
        <h3 className="text-xl font-semibold text-white mb-4">Task List</h3>
        {loading ? (
          <p className="text-white">Loading tasks...</p>
        ) : tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-white min-w-[600px]">
              <thead>
                <tr className="bg-navy-dark">
                  <th className="border p-2 sm:p-3 text-left">Task ID</th>
                  <th className="border p-2 sm:p-3 text-left">Task Name</th>
                  <th className="border p-2 sm:p-3 text-left">Date</th>
                  <th className="border p-2 sm:p-3 text-left">Deadline</th>
                  <th className="border p-2 sm:p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-navy-light/50">
                    <td className="border p-2 sm:p-3">{task.task_id}</td>
                    <td className="border p-2 sm:p-3">{task.task_name}</td>
                    <td className="border p-2 sm:p-3">{task.date}</td>
                    <td className="border p-2 sm:p-3">{task.submission_deadline}</td>
                    <td className="border p-2 sm:p-3">
                      <Button
                        variant="primary"
                        className="mr-2"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        className="mr-2"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleSubmitTask(task)}
                      >
                        Submit Task
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white">No tasks available.</p>
        )}
      </Card>
    </div>
  );
}