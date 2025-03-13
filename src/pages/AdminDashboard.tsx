import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { AdminEvents } from './AdminEvents';
import { AdminTaskSubmissions } from './AdminTaskSubmissions';
import { AdminTasks } from './AdminTasks';
import { supabase } from '../supabaseClient';

interface Task {
  id: string;
  task_name: string;
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

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'events' | 'submissions' | 'tasks' | 'quizzes'>('events');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]); // New state for existing questions
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (selectedTask) {
      fetchQuizQuestions(selectedTask);
    } else {
      setQuizQuestions([]); // Clear questions if no task is selected
    }
  }, [selectedTask]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('tasks').select('id, task_name');
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

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedTask || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from('task_quizzes').insert({
        task_id: selectedTask,
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
      fetchQuizQuestions(selectedTask); // Refresh the questions list
    } catch (err) {
      setError(err.message || 'Failed to add question.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase.from('task_quizzes').delete().eq('id', questionId);
      if (error) throw error;
      setError('Question deleted successfully!');
      fetchQuizQuestions(selectedTask!); // Refresh the questions list
    } catch (err) {
      setError(err.message || 'Failed to delete question.');
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
                  value={selectedTask || ''}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                >
                  <option value="">Select a Task</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>{task.task_name}</option>
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
          {selectedTask && quizQuestions.length > 0 && (
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
    </div>
  );
}