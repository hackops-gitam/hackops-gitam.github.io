import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FaTrophy, FaMedal, FaStar, FaShieldAlt, FaCode, FaLock, FaQuestionCircle, FaInfoCircle, FaSyncAlt, FaTimes } from 'react-icons/fa';
import { GiHoodedFigure } from 'react-icons/gi';
import { supabase } from '../supabaseClient';

// Define animation variants
const glitchVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { scale: 1.02, transition: { duration: 0.3 } },
};

const holographicVariants: Variants = {
  hover: {
    background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
    transition: { duration: 0.5 },
  },
};

const neonPulseVariants: Variants = {
  pulse: {
    textShadow: [
      '0 0 5px #00f, 0 0 10px #00f, 0 0 20px #00f',
      '0 0 10px #00f, 0 0 20px #00f, 0 0 40px #00f',
    ],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  },
};

// Reusable CloseButton component
const CloseButton = ({ onClose }) => {
  const buttonRef = useRef(null);

  const handleRipple = (e) => {
    const button = buttonRef.current;
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    ripple.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    ripple.classList.add('ripple');

    const existingRipple = button.getElementsByClassName('ripple')[0];
    if (existingRipple) existingRipple.remove();

    button.appendChild(ripple);
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={(e) => {
        handleRipple(e);
        onClose();
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        handleRipple(e);
        onClose();
      }}
      className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-theme-bg/50 hover:bg-theme-error/20 text-theme-error hover:text-theme-error/70 focus:outline-none focus:ring-2 focus:ring-theme-primary transition-all duration-200 z-50 overflow-hidden"
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Close popup"
    >
      <FaTimes className="w-6 h-6 sm:w-8 sm:h-8 relative z-10" />
    </motion.button>
  );
};

// Define the TechTeamMember interface
interface TechTeamMember {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  photo: string;
  tryHackMe: { rank: number; completedRooms: number; achievements: string[]; profileLink: string };
  certifications: string[];
  bio: string;
  batchAndBranch: string;
  testimonial: string;
  skills: string[];
  socials: { [key: string]: string };
  totalScore: number;
  quizRate: number;
  taskRate: number;
  submittedTasks: number;
  totalTaskAttempts: number;
  completedQuizzes: number;
  totalQuizAttempts: number;
  submissions: any[];
  timingPenalty: number;
  latePenalty: number;
}

export default function TechTeamAchievements() {
  const [members, setMembers] = useState<TechTeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TechTeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState<TechTeamMember | null>(null);
  const [earliestSubmitters, setEarliestSubmitters] = useState<{ [eventName: string]: { userName: string; timestamp: string } }>({});

  const DEFAULT_PHOTO = 'https://placehold.co/128x128?text=Access+Denied';

  // Add keyboard support for closing popups
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showRulesPopup) setShowRulesPopup(false);
        if (showScoreBreakdown) setShowScoreBreakdown(null);
        if (selectedMember) setSelectedMember(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRulesPopup, showScoreBreakdown, selectedMember]);

  const fetchMembers = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      console.log('Starting fetchMembers...');
      const { data: test, error: testError } = await supabase
        .from('registered_users')
        .select('count')
        .single();
      if (testError) {
        console.error('Connection test failed:', testError);
        throw new Error(`Failed to connect to the database: ${testError.message}`);
      }
      console.log('Connection test successful:', test);

      const { data: users, error: userError } = await supabase.rpc('get_users_with_registration');
      if (userError || !users) {
        console.error('Error fetching users via RPC:', userError);
        throw new Error(userError?.message || 'Failed to fetch team members');
      }

      console.log('Fetched users:', users);

      if (users.length === 0) {
        console.warn('No users returned from get_users_with_registration');
        throw new Error('No team members found.');
      }

      const validUsers = users.filter((user: any) => user.user_id != null && user.user_id !== 'undefined');
      console.log('Valid users:', validUsers);

      const userIds = validUsers.map((user: any) => user.user_id);
      console.log('User IDs:', userIds);

      let taskSubmissions: any[] = [];
      if (userIds.length > 0) {
        const { data: taskData, error: taskError } = await supabase
          .from('task_submissions')
          .select('user_id, email, event_name, status, timestamp')
          .in('user_id', userIds);
        if (taskError) {
          console.error('Error fetching task submissions:', taskError);
          taskSubmissions = [];
        } else {
          taskSubmissions = taskData || [];
          console.log('Fetched task submissions:', taskSubmissions);
        }
      }

      let quizAttempts: any[] = [];
      if (userIds.length > 0) {
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_attempts')
          .select('user_id, user_email, score, total_quizzes, completed_quizzes, passed')
          .in('user_id', userIds);
        if (quizError) {
          console.error('Error fetching quiz attempts:', quizError);
          quizAttempts = [];
        } else {
          quizAttempts = quizData || [];
          console.log('Fetched quiz attempts:', quizAttempts);
        }
      }

      let tasks: any[] = [];
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('task_name, submission_deadline');
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        tasks = [];
      } else {
        tasks = tasksData || [];
        console.log('Fetched tasks:', tasks);
      }

      const quizAggregates = quizAttempts.reduce((acc: any, attempt: any) => {
        const userId = attempt.user_id;
        if (!userId) return acc;
        if (!acc[userId]) {
          acc[userId] = { totalQuizzes: 0, completedQuizzes: 0 };
        }
        acc[userId].totalQuizzes += attempt.total_quizzes || 0;
        acc[userId].completedQuizzes += attempt.completed_quizzes || 0;
        return acc;
      }, {});

      const earliestSubmissions: { [key: string]: number } = {};
      const earliestSubmittersTemp: { [key: string]: { userName: string; timestamp: string } } = {};
      const userIdToNameMap: { [key: string]: string } = validUsers.reduce((acc: any, user: any) => {
        acc[user.user_id] = user.name || 'Unknown User';
        return acc;
      }, {});

      taskSubmissions.forEach((submission: any) => {
        const eventName = submission.event_name;
        const submissionTime = new Date(submission.timestamp).getTime();
        if (!earliestSubmissions[eventName] || submissionTime < earliestSubmissions[eventName]) {
          earliestSubmissions[eventName] = submissionTime;
          earliestSubmittersTemp[eventName] = {
            userName: userIdToNameMap[submission.user_id] || 'Unknown User',
            timestamp: submission.timestamp,
          };
        }
      });
      setEarliestSubmitters(earliestSubmittersTemp);

      const taskAggregates = taskSubmissions.reduce((acc: any, submission: any) => {
        const userId = submission.user_id;
        if (!userId) return acc;
        if (!acc[userId]) {
          acc[userId] = {
            totalTasks: new Set<string>().size,
            submittedTasks: new Set<string>().size,
            timingPenalty: 0,
            latePenalty: 0,
            submissions: [],
          };
        }

        acc[userId].submissions.push(submission);
        acc[userId].totalTasks = new Set(
          taskSubmissions
            .filter((s: any) => s.user_id === userId)
            .map((s: any) => s.event_name)
        ).size;

        if (submission.status === 'Approved') {
          acc[userId].submittedTasks = new Set(
            taskSubmissions
              .filter((s: any) => s.user_id === userId && s.status === 'Approved')
              .map((s: any) => s.event_name)
          ).size;
        }

        const eventName = submission.event_name;
        const submissionTime = new Date(submission.timestamp).getTime();
        const earliestTime = earliestSubmissions[eventName];
        if (earliestTime && submissionTime && submission.status === 'Approved') {
          const timeDiffDays = (submissionTime - earliestTime) / (1000 * 60 * 60 * 24);
          const timingPenalty = Math.min(timeDiffDays * 5, 30);
          acc[userId].timingPenalty += timingPenalty;
        }

        const task = tasks.find((t: any) => t.task_name === submission.event_name);
        if (task && submission.timestamp && submission.status === 'Approved') {
          const submissionTime = new Date(submission.timestamp).getTime();
          const deadline = new Date(task.submission_deadline).getTime();
          const timeDiffDays = (submissionTime - deadline) / (1000 * 60 * 60 * 24);
          if (timeDiffDays > 0) {
            const latePenalty = Math.min(timeDiffDays * 10, 40);
            acc[userId].latePenalty += latePenalty;
          }
        }

        return acc;
      }, {});

      const membersData = validUsers.map((user: any) => {
        const userQuizzes = quizAggregates[user.user_id] || { totalQuizzes: 0, completedQuizzes: 0 };
        const userTasks = taskAggregates[user.user_id] || {
          totalTasks: 0,
          submittedTasks: 0,
          timingPenalty: 0,
          latePenalty: 0,
          submissions: [],
        };

        const quizRate = userQuizzes.totalQuizzes > 0
          ? (userQuizzes.completedQuizzes / userQuizzes.totalQuizzes) * 100
          : 0;
        const totalUniqueTasks = new Set(taskSubmissions.map((s: any) => s.event_name)).size;
        const taskRate = totalUniqueTasks > 0 ? (userTasks.submittedTasks / totalUniqueTasks) * 100 : 0;

        const quizScore = (quizRate / 100) * 50;
        const taskScore = (taskRate / 100) * 50;
        const baseScore = quizScore + taskScore;

        let timingBonus = 0;
        if (userTasks.submittedTasks > 0) {
          const totalTimingPenalty = userTasks.timingPenalty || 0;
          const totalLatePenalty = userTasks.latePenalty || 0;
          timingBonus = Math.max(50 - totalTimingPenalty - totalLatePenalty, 0);
        }

        const totalScore = baseScore + timingBonus;

        return {
          id: user.user_id,
          name: user.name || 'Unknown User',
          email: user.email || 'No email',
          registrationNumber: user.registration_number || '',
          photo: user.photo,
          tryHackMe: user.try_hack_me || { rank: 0, completedRooms: 0, achievements: [], profileLink: '' },
          certifications: user.certifications || [],
          bio: user.bio || 'No bio available.',
          batchAndBranch: user.batch_and_branch || 'N/A',
          testimonial: user.testimonial || 'No testimonial provided.',
          skills: user.skills || [],
          socials: user.socials || {},
          totalScore: Math.max(totalScore, 0),
          quizRate,
          taskRate,
          submittedTasks: userTasks.submittedTasks || 0,
          totalTaskAttempts: totalUniqueTasks || 0,
          completedQuizzes: userQuizzes.completedQuizzes || 0,
          totalQuizAttempts: userQuizzes.totalQuizzes || 0,
          submissions: userTasks.submissions || [],
          timingPenalty: userTasks.timingPenalty || 0,
          latePenalty: userTasks.latePenalty || 0,
        };
      });

      const uniqueMembersData = Array.from(
        new Map(membersData.map((member: TechTeamMember) => [member.id, member])).values()
      );

      const sortedMembers = uniqueMembersData.sort((a: TechTeamMember, b: TechTeamMember) => b.totalScore - a.totalScore);
      console.log('Sorted members:', sortedMembers);
      setMembers((prevMembers) => {
        if (JSON.stringify(prevMembers) !== JSON.stringify(sortedMembers)) {
          console.log('Members updated:', sortedMembers);
          return sortedMembers;
        }
        console.log('No change in members data');
        return prevMembers;
      });
    } catch (err: any) {
      console.error('Unexpected error in fetchMembers:', err);
      setError(err.message || 'An unexpected error occurred. Please try again later.');
      setMembers([]);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMembers();

    // Subscribe to changes in task_submissions table
    const taskSubscription = supabase
      .channel('task-submissions-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_submissions' },
        (payload) => {
          console.log('Task submission change detected:', payload);
          fetchMembers();
        }
      )
      .subscribe();

    // Subscribe to changes in quiz_attempts table
    const quizSubscription = supabase
      .channel('quiz-attempts-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_attempts' },
        (payload) => {
          console.log('Quiz attempt change detected:', payload);
          fetchMembers();
        }
      )
      .subscribe();

    // Cleanup subscriptions on component unmount
    return () => {
      console.log('Unsubscribing from real-time channels...');
      supabase.removeChannel(taskSubscription);
      supabase.removeChannel(quizSubscription);
    };
  }, [fetchMembers]);

  const handleRefresh = () => {
    console.log('Manual refresh triggered...');
    fetchMembers();
  };

  const getRankBadge = (score: number, index: number) => {
    if (index === 0) {
      return <FaTrophy className="text-theme-gold text-xl sm:text-2xl" />;
    } else if (index === 1) {
      return <FaMedal className="text-theme-silver text-xl sm:text-2xl" />;
    } else if (index === 2) {
      return <FaStar className="text-theme-bronze text-xl sm:text-2xl" />;
    } else if (score >= 90) {
      return <FaShieldAlt className="text-theme-primary text-xl sm:text-2xl" />;
    } else if (score >= 70) {
      return <FaCode className="text-theme-secondary text-xl sm:text-2xl" />;
    } else {
      return <FaLock className="text-gray-400 text-xl sm:text-2xl" />;
    }
  };

  const getLevel = (score: number) => {
    if (score >= 90) return 'Elite Hacker';
    if (score >= 70) return 'Pro Hacker';
    if (score >= 50) return 'Intermediate';
    if (score >= 30) return 'Script Kiddie';
    return 'Newbie';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-theme-bg">
        <motion.div
          className="text-theme-primary text-xl sm:text-2xl md:text-3xl font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          [SYSTEM BOOTING...]
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-theme-bg">
        <motion.div
          className="text-theme-error text-xl sm:text-2xl md:text-3xl font-mono"
          variants={glitchVariants}
          initial="initial"
          animate="animate"
        >
          [ERROR] {error}
        </motion.div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-theme-bg">
        <p className="text-theme-text text-lg sm:text-xl font-mono">[NO DATA] No team members available.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-theme-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-theme-bg via-theme-bg/90 to-theme-bg/70 z-0"></div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full opacity-10 bg-circuit-pattern"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <motion.h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-theme-primary font-mono"
              variants={glitchVariants}
              initial="initial"
              animate="animate"
              data-text="[TECH TEAM LEADERBOARD]"
            >
              [TECH TEAM LEADERBOARD]
            </motion.h1>
            <motion.p
              className="text-theme-text mt-2 sm:mt-4 text-sm sm:text-lg md:text-xl font-sans max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {'>'} Celebrate the achievements of our tech team and see who’s leading the ranks.
            </motion.p>
            <div className="flex justify-center gap-4 mt-4">
              <motion.button
                onClick={() => setShowRulesPopup(true)}
                className="px-4 py-2 bg-theme-primary text-navy font-mono rounded-lg hover:bg-theme-secondary transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaQuestionCircle className="text-navy" />
                [SCORING RULES]
              </motion.button>
              <motion.button
                onClick={handleRefresh}
                className="px-4 py-2 bg-theme-primary text-navy font-mono rounded-lg hover:bg-theme-secondary transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isRefreshing}
              >
                <FaSyncAlt className={`text-navy ${isRefreshing ? 'animate-spin' : ''}`} />
                [REFRESH SCORES]
              </motion.button>
            </div>
            {isRefreshing && (
              <motion.div
                className="text-theme-primary text-xs sm:text-sm font-mono mt-2 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <FaSyncAlt className="text-theme-primary" />
                </motion.div>
                [UPDATING LEADERBOARD...]
              </motion.div>
            )}
          </motion.div>

          <div className="mb-12 sm:mb-16 lg:mb-20">
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 text-theme-primary text-center font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              data-text="> [TOP PERFORMERS]"
            >
              {'>'} [TOP PERFORMERS]
            </motion.h2>
            <motion.div
              className="glassmorphic-card p-4 sm:p-6 md:p-8 rounded-2xl border border-theme-primary/30 shadow-theme-primary"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <div className="space-y-4 sm:space-y-6">
                {members.slice(0, 5).map((member, index) => (
                  <motion.div
                    key={member.id}
                    variants={cardVariants}
                    whileHover="hover"
                    className={`flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 rounded-xl border transition-all duration-300 ${
                      index === 0
                        ? 'border-theme-gold bg-gradient-to-r from-theme-gold/10 to-theme-secondary/10'
                        : index === 1
                        ? 'border-theme-silver bg-gradient-to-r from-theme-silver/10 to-theme-secondary/10'
                        : index === 2
                        ? 'border-theme-bronze bg-gradient-to-r from-theme-bronze/10 to-theme-secondary/10'
                        : 'border-theme-primary/30 bg-gradient-to-r from-theme-primary/10 to-theme-secondary/10'
                    } glassmorphic-card-inner`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <motion.span
                        className={`text-lg sm:text-2xl font-bold font-mono ${
                          index === 0
                            ? 'text-theme-gold'
                            : index === 1
                            ? 'text-theme-silver'
                            : index === 2
                            ? 'text-theme-bronze'
                            : 'text-theme-primary'
                        }`}
                        animate={index < 3 ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        #{index + 1}
                      </motion.span>
                      <motion.img
                        src={member.photo || DEFAULT_PHOTO}
                        alt={member.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-theme-primary/50"
                        onError={(e) => (e.currentTarget.src = DEFAULT_PHOTO)}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-theme-primary font-mono text-base sm:text-lg">{member.name}</span>
                        {getRankBadge(member.totalScore, index)}
                      </div>
                    </div>
                    <div className="text-center sm:text-right flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto">
                      <div>
                        <p className="text-theme-text font-mono flex items-center justify-center sm:justify-end gap-2 text-sm sm:text-base">
                          [POINTS]:{' '}
                          <motion.span
                            className={`${
                              index === 0 ? 'text-theme-gold' : 'text-theme-primary'
                            } font-bold text-lg sm:text-xl`}
                            variants={index === 0 ? neonPulseVariants : undefined}
                            animate={index === 0 ? 'pulse' : undefined}
                          >
                            {member.totalScore.toFixed(1)}
                          </motion.span>
                        </p>
                        <p className="text-theme-text/70 font-mono text-xs sm:text-sm mt-1">
                          [TASKS]: <span className="text-theme-secondary">{member.taskRate.toFixed(1)}%</span> | [QUIZZES]:{' '}
                          <span className="text-theme-accent">{member.quizRate.toFixed(1)}%</span>
                        </p>
                      </div>
                      <motion.button
                        onClick={() => setShowScoreBreakdown(member)}
                        className="text-theme-primary hover:text-theme-secondary"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaInfoCircle size={20} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 text-theme-primary text-center font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            data-text="> [TEAM PROFILES]"
          >
            {'>'} [TEAM PROFILES]
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {members.map((member) => (
              <motion.div
                key={member.id}
                variants={cardVariants}
                whileHover="hover"
                className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 shadow-theme-primary relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 z-0"
                  variants={holographicVariants}
                  whileHover="hover"
                ></motion.div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <motion.img
                      src={member.photo || DEFAULT_PHOTO}
                      alt={member.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-theme-primary/50"
                      onError={(e) => (e.currentTarget.src = DEFAULT_PHOTO)}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono">{member.name}</h3>
                      <p className="text-theme-text text-xs sm:text-sm font-sans">{member.batchAndBranch}</p>
                      <p className="text-theme-secondary text-xs sm:text-sm font-mono mt-1">[LEVEL]: {getLevel(member.totalScore)}</p>
                    </div>
                  </div>
                  <div className="text-theme-text font-sans space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-theme-text text-xs sm:text-sm">[POINTS]: <span className="text-theme-primary font-bold">{member.totalScore.toFixed(1)}</span></p>
                      <motion.div
                        className="h-2 bg-navy rounded-full mt-1"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(member.totalScore, 100)}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      >
                        <div className="h-full bg-gradient-to-r from-theme-primary to-theme-secondary rounded-full"></div>
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-theme-text text-xs sm:text-sm">[TASKS]: <span className="text-theme-secondary">{member.taskRate.toFixed(1)}%</span></p>
                      <motion.div
                        className="h-2 bg-navy rounded-full mt-1"
                        initial={{ width: 0 }}
                        animate={{ width: `${member.taskRate}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      >
                        <div className="h-full bg-theme-secondary rounded-full"></div>
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-theme-text text-xs sm:text-sm">[QUIZZES]: <span className="text-theme-accent">{member.quizRate.toFixed(1)}%</span></p>
                      <motion.div
                        className="h-2 bg-navy rounded-full mt-1"
                        initial={{ width: 0 }}
                        animate={{ width: `${member.quizRate}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      >
                        <div className="h-full bg-theme-accent rounded-full"></div>
                      </motion.div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-6">
                    <motion.button
                      onClick={() => setSelectedMember(member)}
                      className="flex-1 py-2 bg-theme-primary text-navy font-mono rounded-lg hover:bg-theme-secondary hover:text-navy transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <GiHoodedFigure className="text-navy" />
                      [VIEW PROFILE]
                    </motion.button>
                    <motion.button
                      onClick={() => setShowScoreBreakdown(member)}
                      className="py-2 px-3 sm:px-4 bg-theme-primary text-navy font-mono rounded-lg hover:bg-theme-secondary hover:text-navy transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaInfoCircle className="text-navy" />
                      [SCORE DETAILS]
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Rules Popup */}
      <AnimatePresence>
        {showRulesPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/80 backdrop-blur-md px-4 sm:px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setShowRulesPopup(false)}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <motion.div
              className="glassmorphic-card p-4 sm:p-6 md:p-8 rounded-2xl border border-theme-primary/50 shadow-theme-primary w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto relative bg-navy/90"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton onClose={() => setShowRulesPopup(false)} />
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-primary font-mono">[SCORING RULES]</h3>
                <p className="text-theme-text/70 text-xs sm:text-sm mt-2 font-sans">Understand how your score is calculated</p>
              </div>
              <div className="space-y-4 sm:space-y-6 text-theme-text font-sans">
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">[TOTAL SCORE]</h4>
                  <p className="text-xs sm:text-sm">Your total score is the sum of your Base Score and Timing Bonus:</p>
                  <p className="text-theme-secondary font-mono mt-1 text-xs sm:text-sm">
                    Total Score = Base Score + Timing Bonus (minimum 0)
                  </p>
                </div>

                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">[BASE SCORE] (out of 100)</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-theme-accent">[QUIZ SCORE] (out of 50):</p>
                      <p className="text-xs sm:text-sm ml-4">Percentage of quizzes completed × 50</p>
                      <p className="text-theme-text/70 text-xs ml-4 italic">Example: 80% quiz completion = 40 points</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-theme-secondary">[TASK SCORE] (out of 50):</p>
                      <p className="text-xs sm:text-sm ml-4">Percentage of unique tasks submitted and approved × 50</p>
                      <p className="text-theme-text/70 text-xs ml-4 italic">Example: 60% task completion = 30 points</p>
                    </div>
                  </div>
                </div>

                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">[TIMING BONUS] (out of 50)</h4>
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm">Starts at 50 points, reduced by:</p>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-theme-error">[TIMING PENALTY]:</p>
                      <p className="text-xs sm:text-sm ml-4">5 points per day late compared to the earliest submission, capped at 30 points per task</p>
                      <p className="text-theme-text/70 text-xs ml-4 italic">Example: 2 days late = 10 points penalty</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-theme-error">[LATE PENALTY]:</p>
                      <p className="text-xs sm:text-sm ml-4">10 points per day late past the task deadline, capped at 40 points per task</p>
                      <p className="text-theme-text/70 text-xs ml-4 italic">Example: 1 day past deadline = 10 points penalty</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-theme-secondary text-xs sm:text-sm italic">Submit tasks early to maximize your Timing Bonus!</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Breakdown Popup */}
      <AnimatePresence>
        {showScoreBreakdown && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/80 backdrop-blur-md px-4 sm:px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setShowScoreBreakdown(null)}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <motion.div
              className="glassmorphic-card p-4 sm:p-6 md:p-8 rounded-2xl border border-theme-primary/50 shadow-theme-primary w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto relative bg-navy/90"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton onClose={() => setShowScoreBreakdown(null)} />
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-primary font-mono">[SCORE BREAKDOWN]</h3>
                <p className="text-theme-text/70 text-xs sm:text-sm mt-2 font-sans">For {showScoreBreakdown.name}</p>
              </div>
              <div className="space-y-4 sm:space-y-6 text-theme-text font-sans">
                {/* Total Score */}
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">[TOTAL SCORE]</h4>
                  <p className="text-lg sm:text-2xl font-bold text-theme-primary">{showScoreBreakdown.totalScore.toFixed(1)}</p>
                </div>

                {/* Base Score Breakdown */}
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-3">[BASE SCORE]</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm font-medium text-theme-accent">[QUIZ SCORE]</p>
                      <p className="text-xs sm:text-sm font-bold text-theme-accent">{((showScoreBreakdown.quizRate / 100) * 50).toFixed(1)} / 50</p>
                    </div>
                    <p className="text-xs text-theme-text/70">Quiz Completion Rate: {showScoreBreakdown.quizRate.toFixed(1)}%</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm font-medium text-theme-secondary">[TASK SCORE]</p>
                      <p className="text-xs sm:text-sm font-bold text-theme-secondary">{((showScoreBreakdown.taskRate / 100) * 50).toFixed(1)} / 50</p>
                    </div>
                    <p className="text-xs text-theme-text/70">Task Completion Rate: {showScoreBreakdown.taskRate.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Timing Bonus and Penalties */}
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-3">[TIMING BONUS]</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm font-medium">Bonus Points</p>
                      <p className="text-xs sm:text-sm font-bold text-theme-primary">
                        {Math.max(50 - showScoreBreakdown.timingPenalty - showScoreBreakdown.latePenalty, 0).toFixed(1)} / 50
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm font-medium text-theme-error">[TIMING PENALTY]</p>
                      <p className="text-xs sm:text-sm font-bold text-theme-error">{showScoreBreakdown.timingPenalty.toFixed(1)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm font-medium text-theme-error">[LATE PENALTY]</p>
                      <p className="text-xs sm:text-sm font-bold text-theme-error">{showScoreBreakdown.latePenalty.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* Submission Details */}
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-3">[SUBMISSION DETAILS]</h4>
                  {showScoreBreakdown.submissions.length > 0 ? (
                    <div className="space-y-4">
                      {showScoreBreakdown.submissions
                        .filter((submission: any) => submission.status === 'Approved')
                        .map((submission: any, index: number) => {
                          const eventName = submission.event_name;
                          const submissionTime = new Date(submission.timestamp);
                          const earliestSubmission = earliestSubmitters[eventName];
                          const earliestTime = earliestSubmission ? new Date(earliestSubmission.timestamp) : null;
                          const timeDiffDays = earliestTime
                            ? (submissionTime.getTime() - earliestTime.getTime()) / (1000 * 60 * 60 * 24)
                            : 0;
                          const timingPenalty = Math.min(timeDiffDays * 5, 30);
                          return (
                            <div key={index} className="border-b border-theme-primary/20 pb-3 last:border-b-0">
                              <p className="text-xs sm:text-sm font-medium text-theme-secondary">[TASK: {eventName}]</p>
                              <p className="text-xs mt-1">
                                <span className="text-theme-text/70">Your Submission:</span>{' '}
                                {submissionTime.toLocaleString()}
                              </p>
                              <p className="text-xs mt-1">
                                <span className="text-theme-text/70">Earliest Submission:</span>{' '}
                                {earliestSubmission?.userName || 'Unknown'} on{' '}
                                {earliestTime?.toLocaleString() || 'N/A'}
                              </p>
                              <p className="text-xs mt-1">
                                <span className="text-theme-text/70">Days Late:</span>{' '}
                                <span className="text-theme-error">{timeDiffDays.toFixed(1)}</span>
                              </p>
                              <p className="text-xs mt-1">
                                <span className="text-theme-text/70">Timing Penalty:</span>{' '}
                                <span className="text-theme-error">{timingPenalty.toFixed(1)}</span> points
                              </p>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-theme-text/70 italic">No approved submissions yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Popup */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/80 backdrop-blur-md px-4 sm:px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setSelectedMember(null)}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <motion.div
              className="glassmorphic-card p-4 sm:p-6 md:p-8 rounded-2xl border border-theme-primary/50 shadow-theme-primary w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto relative bg-navy/90"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton onClose={() => setSelectedMember(null)} />
              <div className="text-center">
                <motion.img
                  src={selectedMember.photo || DEFAULT_PHOTO}
                  alt={selectedMember.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-theme-primary/50 mx-auto mb-4"
                  onError={(e) => (e.currentTarget.src = DEFAULT_PHOTO)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-primary font-mono">{selectedMember.name}</h3>
                <p className="text-theme-text text-xs sm:text-sm font-sans">{selectedMember.batchAndBranch}</p>
                <p className="text-theme-secondary text-xs sm:text-sm font-mono mt-1">[LEVEL]: {getLevel(selectedMember.totalScore)}</p>
              </div>
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-theme-text font-sans">
                <p className="text-xs sm:text-sm">
                  [BIO]: <span className="text-theme-primary">{selectedMember.bio}</span>
                </p>
                <p className="text-xs sm:text-sm">
                  [POINTS]: <span className="text-theme-primary font-bold">{selectedMember.totalScore.toFixed(1)}</span>
                </p>
                <p className="text-xs sm:text-sm">
                  [TASKS]: <span className="text-theme-secondary">{selectedMember.taskRate.toFixed(1)}%</span>
                </p>
                <p className="text-xs sm:text-sm">
                  [QUIZZES]: <span className="text-theme-accent">{selectedMember.quizRate.toFixed(1)}%</span>
                </p>
                <p className="text-xs sm:text-sm">
                  [SKILLS]:{' '}
                  <span className="text-theme-primary">
                    {selectedMember.skills.length > 0 ? selectedMember.skills.join(', ') : 'None'}
                  </span>
                </p>
                <p className="text-xs sm:text-sm">
                  [CERTIFICATIONS]:{' '}
                  <span className="text-theme-primary">
                    {selectedMember.certifications.length > 0 ? selectedMember.certifications.join(', ') : 'None'}
                  </span>
                </p>
                <p className="text-xs sm:text-sm">
                  [TRYHACKME]:{' '}
                  <span className="text-theme-secondary">
                    Rank: {selectedMember.tryHackMe.rank}, Rooms: {selectedMember.tryHackMe.completedRooms}
                  </span>
                </p>
                <p className="text-xs sm:text-sm">
                  [TESTIMONIAL]: <span className="text-theme-primary">{selectedMember.testimonial}</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}