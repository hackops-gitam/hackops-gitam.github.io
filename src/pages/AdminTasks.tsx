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
  require_doc_links: boolean;
  require_learnings: boolean;
}

interface RegisteredUser {
  id: string;
  email: string;
  name: string;
}

interface TaskFormData {
  task_id: string;
  task_name: string;
  date: string;
  submission_deadline: string;
  task_description: string;
  use_custom_form: boolean;
  require_doc_links: boolean;
  require_learnings: boolean;
}

interface UserFormData {
  email: string;
  name: string;
}

export function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const navigate = useNavigate();

  const { register: registerTask, handleSubmit: handleTaskSubmit, reset: resetTask, formState: { errors: taskErrors } } = useForm<TaskFormData>({
    defaultValues: {
      task_id: '',
      task_name: '',
      date: '',
      submission_deadline: '',
      task_description: '',
      use_custom_form: true,
      require_doc_links: false,
      require_learnings: false,
    },
  });

  const { register: registerUser, handleSubmit: handleUserSubmit, reset: resetUser, formState: { errors: userErrors } } = useForm<UserFormData>({
    defaultValues: {
      email: '',
      name: '',
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
      setTasks(tasksData || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('registered_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRegisteredUsers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch registered users.');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchRegisteredUsers();
  }, []);

  const onTaskSubmit = async (data: TaskFormData) => {
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
            require_doc_links: data.require_doc_links,
            require_learnings: data.require_learnings,
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
            require_doc_links: data.require_doc_links,
            require_learnings: data.require_learnings,
          }]);
        if (error) throw error;
      }
      fetchTasks();
      resetTask();
      setEditingTask(null);
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    }
  };

  const onUserSubmit = async (data: UserFormData) => {
    try {
      const { error } = await supabase
        .from('registered_users')
        .insert([{
          email: data.email.toLowerCase().trim(),
          name: data.name.trim(),
        }]);
      if (error) throw error;
      fetchRegisteredUsers();
      resetUser();
    } catch (err) {
      setError(err.message || 'Failed to add user: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    resetTask({
      task_id: task.task_id,
      task_name: task.task_name,
      date: task.date,
      submission_deadline: task.submission_deadline,
      task_description: task.task_description,
      use_custom_form: task.use_custom_form,
      require_doc_links: task.require_doc_links,
      require_learnings: task.require_learnings,
    });
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task? This will also delete any associated quizzes and submissions, including uploaded images.')) return;
    try {
      const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('task_id')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      const taskId = task.task_id;

      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('image_url')
        .eq('event_name', taskId);
      if (submissionsError) throw submissionsError;

      if (submissions && submissions.length > 0) {
        const deletePromises = submissions
          .filter((submission) => submission.image_url)
          .map(async (submission) => {
            const filePath = submission.image_url.split('/public/')[1];
            if (filePath) {
              const { error: storageError } = await supabase.storage
                .from('task-submissions-images')
                .remove([`public/${filePath}`]);
              if (storageError) throw storageError;
            }
          });
        await Promise.all(deletePromises);
      }

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

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const { error } = await supabase
        .from('registered_users')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchRegisteredUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSubmitTask = (task: Task) => {
    navigate(`/members-portal?tab=submissions&submitTaskId=${task.id}`);
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-cyan mb-6">Admin Dashboard</h2>

      {/* Task Management Section */}
      <Card className="p-6 mb-6 bg-navy-light border-cyan">
        <h3 className="text-xl font-semibold text-white mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
        <form onSubmit={handleTaskSubmit(onTaskSubmit)} className="space-y-4">
          <div>
            <label className="block text-white">Task ID</label>
            <input
              {...registerTask('task_id', { required: 'Task ID is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {taskErrors.task_id && <p className="text-red-500">{taskErrors.task_id.message}</p>}
          </div>
          <div>
            <label className="block text-white">Task Name</label>
            <input
              {...registerTask('task_name', { required: 'Task Name is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {taskErrors.task_name && <p className="text-red-500">{taskErrors.task_name.message}</p>}
          </div>
          <div>
            <label className="block text-white">Date</label>
            <input
              type="date"
              {...registerTask('date', { required: 'Date is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {taskErrors.date && <p className="text-red-500">{taskErrors.date.message}</p>}
          </div>
          <div>
            <label className="block text-white">Submission Deadline</label>
            <input
              type="date"
              {...registerTask('submission_deadline', { required: 'Submission Deadline is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {taskErrors.submission_deadline && <p className="text-red-500">{taskErrors.submission_deadline.message}</p>}
          </div>
          <div>
            <label className="block text-white">Task Description</label>
            <textarea
              {...registerTask('task_description', { required: 'Task Description is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
              rows={4}
            />
            {taskErrors.task_description && <p className="text-red-500">{taskErrors.task_description.message}</p>}
          </div>
          <div>
            <label className="block text-white">Use Custom Form</label>
            <input
              type="checkbox"
              {...registerTask('use_custom_form')}
              className="h-5 w-5 text-cyan border-gray-800 rounded focus:ring-cyan"
            />
          </div>
          <div>
            <label className="block text-white">Require Document Links</label>
            <input
              type="checkbox"
              {...registerTask('require_doc_links')}
              className="h-5 w-5 text-cyan border-gray-800 rounded focus:ring-cyan"
            />
          </div>
          <div>
            <label className="block text-white">Require Learnings</label>
            <input
              type="checkbox"
              {...registerTask('require_learnings')}
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
                resetTask();
              }}
            >
              Cancel Edit
            </Button>
          )}
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </Card>

      {/* Task List Section */}
      <Card className="p-6 mb-6 bg-navy-light border-cyan">
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
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        className="mr-2"
                        onClick={() => handleDeleteTask(task.id)}
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

      {/* Registered Users Section */}
      <Card className="p-6 mb-6 bg-navy-light border-cyan">
        <h3 className="text-xl font-semibold text-white mb-4">Add Registered User</h3>
        <form onSubmit={handleUserSubmit(onUserSubmit)} className="space-y-4">
          <div>
            <label className="block text-white">Email</label>
            <input
              {...registerUser('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
              })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {userErrors.email && <p className="text-red-500">{userErrors.email.message}</p>}
          </div>
          <div>
            <label className="block text-white">Name</label>
            <input
              {...registerUser('name', { required: 'Name is required' })}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
            {userErrors.name && <p className="text-red-500">{userErrors.name.message}</p>}
          </div>
          <Button type="submit" variant="primary" className="w-full">
            Add User
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-navy-light border-cyan">
        <h3 className="text-xl font-semibold text-white mb-4">Registered Users List</h3>
        {registeredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-white min-w-[600px]">
              <thead>
                <tr className="bg-navy-dark">
                  <th className="border p-2 sm:p-3 text-left">Email</th>
                  <th className="border p-2 sm:p-3 text-left">Name</th>
                  <th className="border p-2 sm:p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-navy-light/50">
                    <td className="border p-2 sm:p-3">{user.email}</td>
                    <td className="border p-2 sm:p-3">{user.name}</td>
                    <td className="border p-2 sm:p-3">
                      <Button
                        variant="secondary"
                        className="mr-2"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white">No registered users available.</p>
        )}
      </Card>
    </div>
  );
}