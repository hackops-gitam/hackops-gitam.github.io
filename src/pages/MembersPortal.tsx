import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Linkify from 'react-linkify';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  task_id: string;
  task_name: string;
  date: string;
  submission_deadline: string;
  task_description: string;
  use_custom_form: boolean;
  require_doc_links: boolean;
  require_learnings: boolean;
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

interface FormData {
  event_name: string;
  name: string;
  email: string;
  phone: string;
  year: string;
  discipline: string;
  program: string;
  registration_number: string;
  batch: string;
  image: FileList;
  learnings?: string;
  doc_links?: string;
}

interface AuthFormData {
  email: string;
}

interface RegisteredUser {
  email: string;
  name: string;
}

export function MembersPortal() {
  const [activeTab, setActiveTab] = useState<'submissions' | 'status'>('submissions');
  const [email, setEmail] = useState('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionTask, setSubmissionTask] = useState<Task | null>(null);
  const [deadlineCrossedTask, setDeadlineCrossedTask] = useState<Task | null>(null);
  const [quizTask, setQuizTask] = useState<Task | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<'passed' | 'failed' | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { event_name: '', batch: '', learnings: '', doc_links: '' },
  });

  const { register: registerAuth, handleSubmit: handleAuthSubmit, formState: { errors: authErrors } } = useForm<AuthFormData>({
    defaultValues: { email: '' },
  });

  const discipline = watch('discipline');
  const currentDate = new Date('2025-03-18');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setTasks(data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch tasks.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const submitTaskId = searchParams.get('submitTaskId');

    if (tab) {
      setActiveTab(tab as 'submissions' | 'status');
    }

    if (submitTaskId && tasks.length > 0) {
      const task = tasks.find((t) => t.id === submitTaskId);
      if (task && task.use_custom_form) {
        if (isDeadlineCrossed(task.submission_deadline)) {
          setDeadlineCrossedTask(task);
          setSubmissionTask(null);
          setQuizTask(null);
        } else {
          setQuizTask(task);
          setDeadlineCrossedTask(null);
        }
      }
      setSearchParams({});
    }
  }, [searchParams, tasks, setSearchParams]);

  useEffect(() => {
    if (quizTask) {
      fetchQuizQuestions(quizTask.task_id);
    }
  }, [quizTask]);

  const fetchQuizQuestions = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_quizzes')
        .select('*')
        .eq('task_id', taskId);
      if (error) throw error;
      setQuizQuestions(data || []);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizResult(null);
      setFinalScore(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch quiz questions.');
    }
  };

  const handleFetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    setSubmissions([]);

    try {
      const { data, error: fetchError } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('email', email.trim().toLowerCase());
      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setSubmissions(data);
      } else {
        setError('No submissions found for this email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = async (data: FormData) => {
    setSubmissionError(null);
    if (!submissionTask) {
      setSubmissionError('Task not found.');
      setSubmissionStatus('error');
      return;
    }

    if (isDeadlineCrossed(submissionTask.submission_deadline)) {
      setSubmissionError('Submission deadline has passed.');
      setSubmissionStatus('error');
      setSubmissionTask(null);
      return;
    }

    try {
      const file = data.image[0];
      let imageUrl = null;
      if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('task-submissions-images')
          .upload(`public/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) throw uploadError;

        imageUrl = `${supabase.storage.from('task-submissions-images').getPublicUrl('public/' + fileName).data.publicUrl}`;
      }

      const { error: dbError } = await supabase.from('task_submissions').insert({
        event_name: submissionTask.task_name,
        name: data.name,
        email: data.email,
        phone: data.phone,
        year: data.year,
        discipline: data.discipline,
        program: data.program,
        registration_number: data.registration_number,
        timestamp: new Date().toISOString(),
        batch: data.batch,
        image_url: imageUrl,
        quiz_score: finalScore ? Math.round(finalScore) : null,
        learnings: submissionTask.require_learnings ? data.learnings : null,
        doc_links: submissionTask.require_doc_links ? data.doc_links : null,
      });
      if (dbError) throw dbError;

      setSubmissionStatus('success');
      setImagePreview(null);
      reset();
      setSubmissionTask(null);
      setFinalScore(null);
    } catch (err) {
      setSubmissionError(err.message || 'Submission failed. Please try again.');
      setSubmissionStatus('error');
    }
  };

  const onAuthSubmit = async (data: AuthFormData) => {
    setAuthError(null);
    try {
      const { data: user, error } = await supabase
        .from('registered_users')
        .select('email, name')
        .eq('email', data.email.toLowerCase().trim())
        .single();
      if (error || !user) {
        setAuthError('Email not found. Please contact the admin to register.');
        return;
      }

      const { data: submissions, error: submissionError } = await supabase
        .from('task_submissions')
        .select('email')
        .eq('email', data.email.toLowerCase().trim())
        .limit(1);
      if (submissionError) throw submissionError;
      if (!submissions || submissions.length === 0) {
        setAuthError('No submissions found for this email. Please submit a task first.');
        return;
      }

      setUserName(user.name);
      setIsAuthenticated(true);
      setShowWelcomePopup(true);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const yearOptions = ['I Year', 'II Year', 'III Year', 'IV Year', 'V Year'];
  const disciplineOptions = ['Engineering', 'Management', 'Science', 'Other'];
  const programOptions: { [key: string]: string[] } = {
    Engineering: [
      'B.Tech. Aerospace Engineering',
      'B.Tech. Civil Engineering with Computer Application',
      'B.Tech. Computer Science and Engineering',
      'B.Tech. Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
      'B.Tech. Computer Science and Engineering (Cyber Security)',
      'B.Tech. Computer Science and Engineering (Data Science)',
      'B.Tech. Electrical and Computer Engineering',
      'B.Tech. Electronics and Communication Engineering',
      'B.Tech. Electronics Engineering (VLSI Design and Technology)',
      'B.Tech. Mechanical Engineering',
      'B.Tech. Robotics and Artificial Intelligence',
    ],
    Science: [
      'B.Optometry',
      'B.Sc. Computer Science with Cognitive Systems',
      'B.Sc. with major in Biotechnology',
      'B.Sc. with major in Chemistry',
      'B.Sc. with major in Food Science & Technology',
      'B.Sc. with major in Physics',
      'B.Sc. with major in Statistics',
    ],
    Management: [
      'B.Com. (ACCA)',
      'Bachelor of Business Administration',
      'BBA (Business Analytics)',
      'BBA (Financial Markets)',
    ],
    Other: ['II Year B.Optometry'],
  };
  const batchOptions = ['Wednesday Batch', 'Thursday Batch'];

  const linkifyOptions = {
    className: 'text-cyan underline hover:text-blue-400 transition-colors duration-200',
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  const glitchVariants = {
    initial: { opacity: 1 },
    animate: {
      opacity: [1, 0.8, 1, 0.9, 1],
      x: [0, -2, 2, -1, 0],
      transition: {
        duration: 0.5,
        repeat: 3,
        repeatType: 'loop' as const,
        ease: 'easeInOut',
      },
    },
  };

  const isDeadlineCrossed = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    return deadlineDate < currentDate;
  };

  const calculateQuizScore = () => {
    if (!quizQuestions.length) return 0;
    let correctCount = 0;
    quizQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.correct_answer) correctCount++;
    });
    const score = (correctCount / quizQuestions.length) * 100;
    return Math.round(score);
  };

  const handleQuizSubmit = () => {
    const score = calculateQuizScore();
    setFinalScore(score);
    if (score >= 75) {
      setQuizResult('passed');
      setQuizTask(null);
      setSubmissionTask(quizTask);
    } else {
      setQuizResult('failed');
    }
  };

  const getOptionText = (question: QuizQuestion, option: string) => {
    return question[`option_${option}` as keyof QuizQuestion];
  };

  return (
    <div className="min-h-screen bg-navy-light text-white p-4 sm:p-6 lg:p-8">
      {/* Authentication Overlay */}
      <AnimatePresence>
        {!isAuthenticated && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-6 max-w-md w-full rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-cyan mb-6 text-center">
                Please Enter Your Registered Email ID to Continue
              </h2>
              <form onSubmit={handleAuthSubmit(onAuthSubmit)} className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input
                    {...registerAuth('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
                    })}
                    className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                    placeholder="your@email.com"
                  />
                  {authErrors.email && <p className="text-red-500 mt-1">{authErrors.email.message}</p>}
                  {authError && <p className="text-red-500 mt-2">{authError}</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="submit" variant="primary" className="w-full">
                    Verify Email
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Popup with Glitch Animation */}
      <AnimatePresence>
        {showWelcomePopup && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-6 max-w-md w-full rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-cyan mb-4 text-center">
                Verification Successful
              </h1>
              <motion.h4
                className="text-xl sm:text-2xl font-semibold text-white mb-6 text-center"
                variants={glitchVariants}
                initial="initial"
                animate="animate"
              >
                Welcome Back, {userName}!
              </motion.h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  className="w-full py-3 text-base sm:text-lg"
                  onClick={() => setShowWelcomePopup(false)}
                >
                  Continue
                </Button>
                <Button
                  variant="secondary"
                  className="w-full py-3 text-base sm:text-lg"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content (Visible only after authentication) */}
      {isAuthenticated && (
        <Card className="p-6 sm:p-8 bg-navy border-2 border-cyan rounded-lg shadow-lg">
          <h2 className="text-3xl sm:text-4xl font-bold text-cyan text-center mb-8">Members Portal</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              variant={activeTab === 'submissions' ? 'primary' : 'secondary'}
              onClick={() => {
                setActiveTab('submissions');
                setSearchParams({});
              }}
              className="px-6 py-3 text-lg sm:text-xl"
            >
              Task Submissions
            </Button>
            <Button
              variant={activeTab === 'status' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('status')}
              className="px-6 py-3 text-lg sm:text-xl"
            >
              Submission Status
            </Button>
          </div>

          {activeTab === 'submissions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p className="text-center text-lg">Loading tasks...</p>
              ) : tasks.length > 0 ? (
                tasks.map((task) =>
                  task.use_custom_form ? (
                    <Card
                      key={task.id}
                      className="p-6 bg-navy-light border-cyan rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <h3 className="text-2xl font-semibold text-cyan mb-4">{task.task_name}</h3>
                      <p className="text-gray-300 mb-2">
                        <span className="font-medium">Start Date:</span> {task.date}
                      </p>
                      <p className="text-gray-300 mb-6">
                        <span className="font-medium">Deadline:</span> {task.submission_deadline}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          variant="secondary"
                          className="w-full py-3 text-lg"
                          onClick={() => setSelectedTask(task)}
                        >
                          View Task Details
                        </Button>
                        <Button
                          variant="primary"
                          className="w-full py-3 text-lg"
                          onClick={() => {
                            if (isDeadlineCrossed(task.submission_deadline)) {
                              setDeadlineCrossedTask(task);
                            } else {
                              setQuizTask(task);
                            }
                          }}
                        >
                          Submit Task
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Card
                      key={task.id}
                      className="p-6 bg-navy-light border-cyan rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <h3 className="text-2xl font-semibold text-cyan mb-4">{task.task_name}</h3>
                      <p className="text-gray-300 mb-2">
                        <span className="font-medium">Start Date:</span> {task.date}
                      </p>
                      <p className="text-gray-300 mb-6">
                        <span className="font-medium">Deadline:</span> {task.submission_deadline}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          variant="secondary"
                          className="w-full py-3 text-lg"
                          onClick={() => setSelectedTask(task)}
                        >
                          View Task Details
                        </Button>
                        <Link to={`/task-submission/${task.id}`} className="w-full">
                          <Button variant="primary" className="w-full py-3 text-lg">
                            Submit Task
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  )
                )
              ) : (
                <p className="text-center text-lg mt-6">No tasks available for submission.</p>
              )}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-8">
              <div className="mb-6">
                <label className="block text-xl sm:text-2xl text-white mb-4">Enter Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 sm:p-4 rounded bg-navy text-white border border-gray-800 focus:border-cyan focus:outline-none text-sm sm:text-lg"
                  placeholder="your@email.com"
                />
                <Button
                  onClick={handleFetchSubmissions}
                  variant="primary"
                  className="w-full mt-6 py-2 sm:py-3 text-base sm:text-lg"
                  disabled={loading || !email}
                >
                  {loading ? 'Fetching...' : 'Check Status'}
                </Button>
              </div>
              {error && <p className="text-red-500 text-center text-sm sm:text-lg mb-4">{error}</p>}
              {submissions.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-white min-w-[600px]">
                    <thead>
                      <tr className="bg-navy-dark">
                        <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Task Name</th>
                        <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Submission Date</th>
                        <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Status</th>
                        <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Image</th>
                        <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Quiz Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission, index) => (
                        <tr key={index} className="hover:bg-navy-light/50">
                          <td className="p-3 sm:p-4 text-sm sm:text-base">{submission.event_name}</td>
                          <td className="p-3 sm:p-4 text-sm sm:text-base">{new Date(submission.timestamp).toLocaleString()}</td>
                          <td className="p-3 sm:p-4 text-sm sm:text-base">{submission.status}</td>
                          <td className="p-3 sm:p-4 text-sm sm:text-base">
                            {submission.image_url ? (
                              <a href={submission.image_url} target="_blank" rel="noopener noreferrer" className="text-cyan underline">
                                View Image
                              </a>
                            ) : 'No Image'}
                          </td>
                          <td className="p-3 sm:p-4 text-sm sm:text-base">
                            {submission.quiz_score !== null ? `${submission.quiz_score}%` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Task Details Popup */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-6 max-w-lg w-full rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-cyan mb-4">{selectedTask.task_name}</h3>
              <p className="text-gray-300 mb-2 text-sm sm:text-base">
                <span className="font-medium">Start Date:</span> {selectedTask.date}
              </p>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                <span className="font-medium">Deadline:</span> {selectedTask.submission_deadline}
              </p>
              <p className="text-gray-400 mb-6 leading-relaxed text-sm sm:text-base">
                <span className="font-medium">Description:</span>{' '}
                <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a href={decoratedHref} key={key} target="_blank" rel="noopener noreferrer" className={linkifyOptions.className}>
                    {decoratedText}
                  </a>
                )}>
                  {selectedTask.task_description}
                </Linkify>
              </p>
              <Button
                variant="secondary"
                className="w-full py-3 text-base sm:text-lg"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Submission Popup */}
      <AnimatePresence>
        {submissionTask && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-4 sm:p-6 max-w-lg w-full rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20 max-h-[90vh] overflow-y-auto"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-cyan mb-6">Task Submission</h2>
              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm sm:text-lg text-white mb-2">Event Name</label>
                  <input
                    type="text"
                    value={submissionTask.task_name}
                    readOnly
                    className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-lg text-white mb-2">Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                  />
                  {errors.name && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm sm:text-lg text-white mb-2">Email</label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
                    })}
                    className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                  />
                  {errors.email && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm sm:text-lg text-white mb-2">Phone</label>
                  <input
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: { value: /^[0-9]{10}$/, message: 'Must be a 10-digit number' },
                    })}
                    className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                  />
                  {errors.phone && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm sm:text-lg text-white mb-2">Year</label>
                  <select
                    {...register('year', { required: 'Year is required' })}
                    className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                  >
                    <option value="">Select Year</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.year && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.year.message}</p>}
                </div>

                <div>
                  <label className="block text-sm sm:text-lg text-white mb-2">Discipline</label>
                  <select
                    {...register('discipline', { required: 'Discipline is required' })}
                    className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                  >
                    <option value="">Select Discipline</option>
                    {disciplineOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.discipline && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.discipline.message}</p>}
                </div>

                {discipline && (
                  <div>
                    <label className="block text-sm sm:text-lg text-white mb-2">Program</label>
                    <Controller
                      name="program"
                      control={control}
                      rules={{ required: 'Program is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                        >
                          <option value="">Select Program</option>
                          {programOptions[discipline]?.map((prog) => (
                            <option key={prog} value={prog}>{prog}</option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.program && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.program.message}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm sm:text-lg text-white mb-2">Registration Number</label>
                  <input
                    {...register('registration_number', { required: 'Registration Number is required' })}
                    className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                    placeholder="Enter your registration number"
                  />
                  {errors.registration_number && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.registration_number.message}</p>}
                </div>

                <div>
                  <label className="block text-sm sm:text-lg text-white mb-2">Batch</label>
                  <select
                    {...register('batch', { required: 'Batch is required' })}
                    className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                  >
                    <option value="">Select Batch</option>
                    {batchOptions.map((batch) => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                  {errors.batch && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.batch.message}</p>}
                </div>

                <div>
                  <label className="block text-sm sm:text-lg text-white mb-2">Upload Task Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register('image', { required: 'Image is required' })}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setImagePreview(previewUrl);
                      }
                    }}
                    className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                  />
                  {errors.image && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.image.message}</p>}
                  {imagePreview && (
                    <div className="mt-4">
                      <img src={imagePreview} alt="Preview" className="max-w-full max-h-40 object-cover rounded-md" />
                    </div>
                  )}
                </div>

                {submissionTask.require_learnings && (
                  <div>
                    <label className="block text-sm sm:text-lg text-white mb-2">What have you learnt from this task (100-200 words)</label>
                    <textarea
                      {...register('learnings', {
                        required: submissionTask.require_learnings ? 'Learnings is required' : false,
                        validate: (value) => {
                          if (!submissionTask.require_learnings) return true;
                          const words = value.trim().split(/\s+/).filter(word => word.length > 0);
                          const wordCount = words.length;
                          return (wordCount >= 100 && wordCount <= 200) || 'Must be between 100 and 200 words';
                        },
                      })}
                      className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base h-40"
                      placeholder="Write about what you have learned from this task (100-200 words)..."
                    />
                    {errors.learnings && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.learnings.message}</p>}
                  </div>
                )}

                {submissionTask.require_doc_links && (
                  <div>
                    <label className="block text-sm sm:text-lg text-white mb-2">Document Link</label>
                    <input
                      {...register('doc_links', {
                        required: submissionTask.require_doc_links ? 'Document Link is required' : false,
                        pattern: submissionTask.require_doc_links
                          ? {
                              value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                              message: 'Please enter a valid URL',
                            }
                          : undefined,
                      })}
                      className="w-full p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan text-sm sm:text-base"
                      placeholder="Enter document link (e.g., Google Drive URL)"
                    />
                    {errors.doc_links && <p className="text-red-500 mt-1 text-xs sm:text-sm">{errors.doc_links.message}</p>}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full py-2 sm:py-3 text-base sm:text-lg">
                    {isSubmitting ? 'Submitting...' : 'Submit Task'}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full py-2 sm:py-3 text-base sm:text-lg"
                    onClick={() => {
                      setSubmissionTask(null);
                      reset();
                      setImagePreview(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              {submissionStatus === 'success' && (
                <div className="mt-6 text-center">
                  <p className="text-xl sm:text-2xl text-cyan mb-4">Task Submission Successful!</p>
                  <Button
                    onClick={() => {
                      setSubmissionStatus(null);
                      setSubmissionTask(null);
                      reset();
                      setImagePreview(null);
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300 text-sm sm:text-base"
                  >
                    Close
                  </Button>
                </div>
              )}
              {submissionStatus === 'error' && submissionError && (
                <div className="mt-6 text-red-500 text-sm sm:text-lg">{submissionError}</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deadline Alert Popup */}
      <AnimatePresence>
        {deadlineCrossedTask && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-6 max-w-lg w-full rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <h3 className="text-xl sm:text-2xl font-semibold text-red-400 mb-4">Deadline Alert</h3>
              <p className="text-gray-300 text-sm sm:text-base mb-6">
                Oh no! The deadline for <strong>{deadlineCrossedTask.task_name}</strong> has passed on{' '}
                {new Date(deadlineCrossedTask.submission_deadline).toLocaleDateString()}. Unfortunately, submissions are no
                longer accepted for this task. Please check for upcoming opportunities or contact the coordinator if you
                believe this is an error. Stay proactive for future tasks!
              </p>
              <Button
                variant="secondary"
                className="w-full py-3 text-base sm:text-lg"
                onClick={() => {
                  setDeadlineCrossedTask(null);
                  setSubmissionTask(null);
                }}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Popup */}
      <AnimatePresence>
        {quizTask && quizQuestions.length > 0 && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-4 sm:p-6 max-w-lg w-full rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20 max-h-[90vh] overflow-y-auto"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-cyan mb-6">Quiz for {quizTask.task_name}</h2>
              {currentQuestionIndex < quizQuestions.length && !quizResult ? (
                <>
                  <p className="text-gray-300 text-sm sm:text-base mb-4">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </p>
                  <p className="text-white mb-4 text-sm sm:text-base">{quizQuestions[currentQuestionIndex].question}</p>
                  <div className="space-y-2">
                    {['a', 'b', 'c', 'd'].map((option) => (
                      <label key={option} className="flex items-center text-sm sm:text-base">
                        <input
                          type="radio"
                          name="quizOption"
                          value={option}
                          checked={userAnswers[currentQuestionIndex] === option}
                          onChange={(e) => {
                            setUserAnswers({ ...userAnswers, [currentQuestionIndex]: e.target.value });
                          }}
                          className="mr-2"
                        />
                        {option.toUpperCase()}: {quizQuestions[currentQuestionIndex][`option_${option}`]}
                      </label>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between">
                    {currentQuestionIndex > 0 && (
                      <Button
                        variant="secondary"
                        className="py-2 sm:py-3 text-base sm:text-lg"
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                      >
                        Previous
                      </Button>
                    )}
                    {currentQuestionIndex < quizQuestions.length - 1 ? (
                      <Button
                        variant="primary"
                        className="py-2 sm:py-3 text-base sm:text-lg"
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="py-2 sm:py-3 text-base sm:text-lg"
                        onClick={handleQuizSubmit}
                      >
                        Submit Quiz
                      </Button>
                    )}
                  </div>
                </>
              ) : quizResult ? (
                <>
                  <p className={`text-sm sm:text-base mb-4 ${quizResult === 'passed' ? 'text-green-500' : 'text-red-500'}`}>
                    You scored {finalScore}%!{' '}
                    {quizResult === 'passed'
                      ? 'Congratulations, you passed! You can now proceed to submit your task.'
                      : 'Sorry, you need at least 75% to proceed.'}
                  </p>
                  {quizResult === 'failed' && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">Review Your Answers:</h3>
                      {quizQuestions.map((question, index) => {
                        const userAnswer = userAnswers[index];
                        const isCorrect = userAnswer === question.correct_answer;
                        return (
                          <div key={index} className="mb-4">
                            <p className="text-white text-sm sm:text-base">{index + 1}. {question.question}</p>
                            <p className="text-gray-300 text-sm sm:text-base">
                              Your Answer: {userAnswer ? `${userAnswer.toUpperCase()}: ${getOptionText(question, userAnswer)}` : 'Not answered'}
                            </p>
                            {!isCorrect && (
                              <p className="text-red-500 text-sm sm:text-base">
                                Incorrect! Correct Answer: {question.correct_answer.toUpperCase()}: {getOptionText(question, question.correct_answer)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {quizResult === 'failed' && (
                    <Button
                      variant="primary"
                      className="w-full py-2 sm:py-3 text-base sm:text-lg"
                      onClick={() => {
                        setCurrentQuestionIndex(0);
                        setUserAnswers({});
                        setQuizResult(null);
                        setFinalScore(null);
                      }}
                    >
                      Retake Quiz
                    </Button>
                  )}
                </>
              ) : null}
              <Button
                variant="secondary"
                className="w-full mt-4 py-2 sm:py-3 text-base sm:text-lg"
                onClick={() => {
                  setQuizTask(null);
                  setQuizQuestions([]);
                  setCurrentQuestionIndex(0);
                  setUserAnswers({});
                  setQuizResult(null);
                  setFinalScore(null);
                }}
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}