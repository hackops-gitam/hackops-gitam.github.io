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
  registration_number: string;
  photo: string | null;
  try_hack_me?: {
    rank: number;
    completedRooms: number;
    achievements: string[];
    profileLink: string;
    badge?: string; // Now stores the userPublicId (e.g., "3110189")
  };
  certifications?: string[];
  bio?: string;
  batch_and_branch?: string;
  testimonial?: string;
  skills?: string[];
  socials?: {
    email?: string;
    github?: string;
    twitter?: string;
    blog?: string;
  };
}

interface UserFormData {
  email: string;
  name: string;
  registration_number: string;
}

interface TechTeamMemberFormData {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  photo: string;
  tryHackMe: {
    rank: number;
    completedRooms: number;
    achievements: string[];
    profileLink: string;
    badge: string; // Now stores the userPublicId (e.g., "3110189")
  };
  certifications: string[];
  bio: string;
  batchAndBranch: string;
  testimonial: string;
  skills: string[];
  socials: {
    email?: string;
    github?: string;
    twitter?: string;
    blog?: string;
  };
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'events' | 'submissions' | 'tasks' | 'quizzes' | 'users' | 'techTeam'>('events');
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
  const [editingMember, setEditingMember] = useState<TechTeamMemberFormData | null>(null);
  const [techTeamError, setTechTeamError] = useState<string | null>(null);

  const DEFAULT_PHOTO = 'https://via.placeholder.com/128?text=No+Image';

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
        .rpc('get_users_with_registration');

      if (error) throw error;

      console.log('Raw data from get_users_with_registration:', data); // Debug log

      // Filter out users with undefined or null id
      const validUsers = (data || []).filter((user: any) => user.user_id != null && user.user_id !== 'undefined');
      console.log('Valid users after filtering:', validUsers);

      // Map the data to match the RegisteredUser interface
      const mappedUsers: RegisteredUser[] = validUsers.map((user: any) => ({
        id: user.user_id,
        email: user.email,
        name: user.name,
        registration_number: user.registration_number,
        photo: user.photo,
        try_hack_me: user.try_hack_me,
        certifications: user.certifications,
        bio: user.bio,
        batch_and_branch: user.batch_and_branch,
        testimonial: user.testimonial,
        skills: user.skills,
        socials: user.socials,
      }));

      setRegisteredUsers(mappedUsers);
    } catch (err) {
      setUserError(err.message || 'Failed to fetch registered users. Please check your permissions or try again later.');
      console.error('Error fetching registered users:', err);
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
    const registrationNumber = formData.get('registration_number')?.toString().trim();

    if (!email || !name || !registrationNumber) {
      setUserError('Email, name, and registration number are required.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setUserError('Invalid email format.');
      return;
    }

    if (!/^\d+$/.test(registrationNumber)) {
      setUserError('Registration number must be numeric (e.g., 2023004246).');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('registered_users')
        .insert([{
          email,
          name,
          registration_number: registrationNumber,
          photo: `https://doeresults.gitam.edu/photo/img.aspx?id=${registrationNumber}`,
        }])
        .select()
        .single();
      if (error) throw error;
      console.log('Inserted user:', data); // Debug log
      fetchRegisteredUsers();
      e.currentTarget.reset();
      setUserError('User added successfully!');
    } catch (err) {
      setUserError(err.message || 'Failed to add user.');
      console.error('Error adding user:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!id) {
      setUserError('Cannot delete user: Invalid user ID.');
      return;
    }
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
      console.error('Error deleting user:', err);
    }
  };

  const handleEditTechTeamMember = (user: RegisteredUser) => {
    console.log('User being edited:', user);
    if (!user.id) {
      setTechTeamError('Cannot edit user: Invalid user ID.');
      return;
    }
    setEditingMember({
      id: user.id,
      name: user.name,
      email: user.email,
      registrationNumber: user.registration_number,
      photo: user.photo || DEFAULT_PHOTO,
      tryHackMe: {
        rank: user.try_hack_me?.rank || 0,
        completedRooms: user.try_hack_me?.completedRooms || 0,
        achievements: user.try_hack_me?.achievements || [],
        profileLink: user.try_hack_me?.profileLink || '',
        badge: user.try_hack_me?.badge || '', // Now stores userPublicId (e.g., "3110189")
      },
      certifications: user.certifications || [],
      bio: user.bio || '',
      batchAndBranch: user.batch_and_branch || '',
      testimonial: user.testimonial || '',
      skills: user.skills || [],
      socials: user.socials || {},
    });
    console.log('Editing member set to:', {
      id: user.id,
      name: user.name,
      email: user.email,
      registrationNumber: user.registration_number,
    });
  };

  const handleSaveTechTeamMember = async () => {
    if (!editingMember) {
      setTechTeamError('No member selected for editing.');
      return;
    }

    if (!editingMember.id) {
      setTechTeamError('Cannot save: Invalid user ID.');
      return;
    }

    console.log('Saving member with ID:', editingMember.id);

    try {
      const updatedPhoto = editingMember.registrationNumber
        ? `https://doeresults.gitam.edu/photo/img.aspx?id=${editingMember.registrationNumber}`
        : editingMember.photo;

      const { error } = await supabase
        .from('registered_users')
        .update({
          registration_number: editingMember.registrationNumber,
          photo: updatedPhoto === DEFAULT_PHOTO ? null : updatedPhoto,
          try_hack_me: editingMember.tryHackMe,
          certifications: editingMember.certifications,
          bio: editingMember.bio,
          batch_and_branch: editingMember.batchAndBranch,
          testimonial: editingMember.testimonial,
          skills: editingMember.skills,
          socials: editingMember.socials,
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      setRegisteredUsers(
        registeredUsers.map((user) =>
          user.id === editingMember.id
            ? {
                ...user,
                registration_number: editingMember.registrationNumber,
                photo: updatedPhoto === DEFAULT_PHOTO ? null : updatedPhoto,
                try_hack_me: editingMember.tryHackMe,
                certifications: editingMember.certifications,
                bio: editingMember.bio,
                batch_and_branch: editingMember.batchAndBranch,
                testimonial: editingMember.testimonial,
                skills: editingMember.skills,
                socials: editingMember.socials,
              }
            : user
        )
      );
      setEditingMember(null);
      setTechTeamError('Member updated successfully!');
    } catch (err) {
      setTechTeamError(err.message || 'Failed to update member.');
      console.error('Error updating member:', err);
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
        <Button
          variant={activeTab === 'techTeam' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('techTeam')}
        >
          Tech Team Members
        </Button>
      </div>

      {activeTab === 'events' && <AdminEvents />}
      {activeTab === 'submissions' && <AdminTaskSubmissions />}
      {activeTab === 'tasks' && <AdminTasks />}
      {activeTab === 'quizzes' && (
        <div className="space-y-8">
          {error && <p className={error.includes('successfully') ? 'text-green-500' : 'text-red-500'}>{error}</p>}
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
              <div>
                <label className="block text-lg sm:text-xl text-white mb-2">Registration Number</label>
                <input
                  type="text"
                  name="registration_number"
                  className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                  placeholder="e.g., 2023004246"
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

          {registeredUsers.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-cyan mb-4">Registered Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-white min-w-[600px]">
                  <thead>
                    <tr className="bg-navy-dark">
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Email</th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Name</th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Registration Number</th>
                      <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-navy-light/50">
                        <td className="p-3 sm:p-4 text-sm sm:text-base">{user.email}</td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base">{user.name}</td>
                        <td className="p-3 sm:p-4 text-sm sm:text-base">{user.registration_number}</td>
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
      {activeTab === 'techTeam' && (
        <div className="space-y-8">
          {techTeamError && (
            <p className={techTeamError.includes('successfully') ? 'text-green-500' : 'text-red-500'}>
              {techTeamError}
            </p>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-cyan mb-4">Manage Tech Team Members</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white min-w-[600px]">
                <thead>
                  <tr className="bg-navy-dark">
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Name</th>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Email</th>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Registration Number</th>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Photo</th>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-lg">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-navy-light/50">
                      <td className="p-3 sm:p-4 text-sm sm:text-base">{user.name}</td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">{user.email}</td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">{user.registration_number}</td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">
                        <img
                          src={user.photo || DEFAULT_PHOTO}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => (e.currentTarget.src = DEFAULT_PHOTO)}
                        />
                      </td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">
                        <Button
                          variant="primary"
                          className="py-1 px-2 text-sm sm:text-base"
                          onClick={() => handleEditTechTeamMember(user)}
                          disabled={!user.id}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {editingMember && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-50">
              <div className="bg-navy-light p-6 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-white mb-4">Edit Member: {editingMember.name}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Registration Number</label>
                    <input
                      type="text"
                      value={editingMember.registrationNumber}
                      onChange={(e) => setEditingMember({ ...editingMember, registrationNumber: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white"
                      placeholder="e.g., 2023004246"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Photo URL</label>
                    <div className="flex items-center gap-4">
                      <img
                        src={editingMember.photo}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => (e.currentTarget.src = DEFAULT_PHOTO)}
                      />
                      <input
                        type="text"
                        value={editingMember.photo}
                        onChange={(e) => setEditingMember({ ...editingMember, photo: e.target.value })}
                        className="w-full p-2 rounded bg-gray-800 text-white"
                        placeholder="Enter photo URL or leave as default"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">TryHackMe Rank</label>
                    <input
                      type="number"
                      value={editingMember.tryHackMe.rank}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          tryHackMe: { ...editingMember.tryHackMe, rank: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">TryHackMe Completed Rooms</label>
                    <input
                      type="number"
                      value={editingMember.tryHackMe.completedRooms}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          tryHackMe: { ...editingMember.tryHackMe, completedRooms: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">TryHackMe Achievements (comma-separated)</label>
                    <input
                      type="text"
                      value={editingMember.tryHackMe.achievements.join(', ')}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          tryHackMe: {
                            ...editingMember.tryHackMe,
                            achievements: e.target.value.split(',').map((s) => s.trim()),
                          },
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">TryHackMe Profile Link</label>
                    <input
                      type="text"
                      value={editingMember.tryHackMe.profileLink}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          tryHackMe: { ...editingMember.tryHackMe, profileLink: e.target.value },
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">TryHackMe User Public ID (for Badge)</label>
                    <input
                      type="text"
                      value={editingMember.tryHackMe.badge}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          tryHackMe: { ...editingMember.tryHackMe, badge: e.target.value },
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                      placeholder="e.g., 3110189"
                    />
                    {editingMember.tryHackMe.badge && (
                      <div className="mt-2">
                        <iframe
                          src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${editingMember.tryHackMe.badge}`}
                          style={{ border: 'none', width: '200px', height: '200px' }}
                          title="TryHackMe Badge Preview"
                        />
                      </div>
                    )}
                    {!editingMember.tryHackMe.badge && (
                      <p className="text-gray-400 mt-2">Enter a User Public ID to preview the badge.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Certifications (comma-separated)</label>
                    <input
                      type="text"
                      value={editingMember.certifications.join(', ')}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          certifications: e.target.value.split(',').map((s) => s.trim()),
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Bio</label>
                    <textarea
                      value={editingMember.bio}
                      onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Batch and Branch</label>
                    <input
                      type="text"
                      value={editingMember.batchAndBranch}
                      onChange={(e) => setEditingMember({ ...editingMember, batchAndBranch: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Testimonial</label>
                    <textarea
                      value={editingMember.testimonial}
                      onChange={(e) => setEditingMember({ ...editingMember, testimonial: e.target.value })}
                      className="w-full p-2 rounded bg-gray-800 text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={editingMember.skills.join(', ')}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          skills: e.target.value.split(',').map((s) => s.trim()),
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Socials: Email</label>
                    <input
                      type="text"
                      value={editingMember.socials.email || ''}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          socials: { ...editingMember.socials, email: e.target.value },
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Socials: GitHub</label>
                    <input
                      type="text"
                      value={editingMember.socials.github || ''}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          socials: { ...editingMember.socials, github: e.target.value },
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Socials: Twitter</label>
                    <input
                      type="text"
                      value={editingMember.socials.twitter || ''}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          socials: { ...editingMember.socials, twitter: e.target.value },
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Socials: Blog</label>
                    <input
                      type="text"
                      value={editingMember.socials.blog || ''}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          socials: { ...editingMember.socials, blog: e.target.value },
                        })
                      }
                      className="w-full p-2 rounded bg-gray-800 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={handleSaveTechTeamMember}
                    variant="primary"
                    className="px-4 py-2"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingMember(null)}
                    variant="secondary"
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}