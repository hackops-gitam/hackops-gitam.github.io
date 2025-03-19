import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { AdminEvents } from './AdminEvents';
import { AdminTaskSubmissions } from './AdminTaskSubmissions';
import { AdminTasks } from './AdminTasks';
import { supabase } from '../supabaseClient';

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

interface QuizQuestion {
  id: string;
  task_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

interface RegisteredUser {
  id: string;
  email: string;
  name: string;
}

interface UserFormData {
  email: string;
  name: string;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'events' | 'submissions' | 'tasks' | 'quizzes' | 'users'>('events');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchRegisteredUsers();
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      fetchQuizQuestions(selectedTaskId);
    } else {
      setQuizQuestions([]);
    }
  }, [selectedTaskId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizQuestions = async (taskId: string) => {
    try {
      const { data, error } = await supabase.from('task_quizzes').select('*').eq('task_id', taskId);
      if (error) throw error;
      setQuizQuestions(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch quiz questions.');
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
      setUserError(err.message || 'Failed to fetch registered users.');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedTaskId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const { data: taskExists } = await supabase
        .from('tasks')
        .select('task_id')
        .eq('task_id', selectedTaskId)
        .single();
      if (!taskExists) throw new Error('Selected task_id does not exist.');

      const { error } = await supabase.from('task_quizzes').insert({
        task_id: selectedTaskId,
        question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correctAnswer.toLowerCase(),
      });
      if (error) throw error;

      setQuestion('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectAnswer('');
      setError('Question added successfully!');
      fetchQuizQuestions(selectedTaskId);
    } catch (err) {
      setError(err.message || 'Failed to add question.');
      console.error('Quiz insertion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase.from('task_quizzes').delete().eq('id', questionId);
      if (error) throw error;
      setError('Question deleted successfully!');
      if (selectedTaskId) fetchQuizQuestions(selectedTaskId);
    } catch (err) {
      setError(err.message || 'Failed to delete question.');
    }
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')?.toString().toLowerCase().trim();
    const name = formData.get('name')?.toString().trim();

    if (!email || !name) {
      setUserError('Email and name are required.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setUserError('Invalid email format.');
      return;
    }

    try {
      const { error } = await supabase
        .from('registered_users')
        .insert([{ email, name }]);
      if (error) throw error;
      fetchRegisteredUsers();
      e.currentTarget.reset();
      setUserError('User added successfully!');
    } catch (err) {
      setUserError(err.message || 'Failed to add user.');
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
      setUserError('User deleted successfully!');
    } catch (err) {
      setUserError(err.message || 'Failed to delete user.');
    }
  };

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
        <Button
          variant={activeTab === 'quizzes' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('quizzes')}
        >
          Manage Quizzes
        </Button>
        <Button
          variant={activeTab === 'users' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </Button>
      </div>

      {activeTab === 'events' && <AdminEvents />}
      {activeTab === 'submissions' && <AdminTaskSubmissions />}
      {activeTab === 'tasks' && <AdminTasks />}
      {activeTab === 'quizzes' && (
        <div className="space-y-8">
          {error && <p className={error.includes('successfully') ? 'text-green-500' : 'text-red-500'}>{error}</p>}
          {/* Form to Add Questions */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-cyan mb-4">Add New Quiz Question</h2>
            <form onSubmit={handleAddQuestion} className="space-y-6">
              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Select Task</label>
                <select
                  value={selectedTaskId || ''}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                >
                  <option value="">Select a Task</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.task_id}>
                      {task.task_id} - {task.task_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Question</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Option A</label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                />
              </div>

              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Option B</label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                />
              </div>

              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Option C</label>
                <input
                  type="text"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                />
              </div>

              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Option D</label>
                <input
                  type="text"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                />
              </div>

              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Correct Answer (a/b/c/d)</label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                  placeholder="e.g., a"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full py-3 text-lg sm:text-xl"
              >
                {loading ? 'Adding...' : 'Add Question'}
              </Button>
            </form>
          </div>

          {/* Table to Display and Delete Questions */}
          {selectedTaskId && quizQuestions.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-cyan mb-4">Existing Quiz Questions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-white min-w-[600px]">
                  <thead>
                    <tr className="bg-navy-dark">
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Question</th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Correct Answer</th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizQuestions.map((quizQuestion) => (
                      <tr key={quizQuestion.id} className="hover:bg-navy-light/50">
                        <td className="p-3 sm:p-4 text-sm sm:text-base">{quizQuestion.question}</td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base">
                          {quizQuestion.correct_answer.toUpperCase()}: {quizQuestion[`option_${quizQuestion.correct_answer}`]}
                        </td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base">
                          <Button
                            variant="danger"
                            className="py-1 px-2 text-sm sm:text-base"
                            onClick={() => handleDeleteQuestion(quizQuestion.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {activeTab === 'users' && (
        <div className="space-y-8">
          {userError && <p className={userError.includes('successfully') ? 'text-green-500' : 'text-red-500'}>{userError}</p>}
          {/* Form to Add Users */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-cyan mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-6">
              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                  placeholder="User Name"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-lg sm:text-xl"
              >
                Add User
              </Button>
            </form>
          </div>

          {/* Table to Display and Delete Users */}
          {registeredUsers.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-cyan mb-4">Registered Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-white min-w-[600px]">
                  <thead>
                    <tr className="bg-navy-dark">
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Email</th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Name</th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-navy-light/50">
                        <td className="p-3 sm:p-4 text-sm sm:text-base">{user.email}</td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base">{user.name}</td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base">
                          <Button
                            variant="danger"
                            className="py-1 px-2 text-sm sm:text-base"
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}