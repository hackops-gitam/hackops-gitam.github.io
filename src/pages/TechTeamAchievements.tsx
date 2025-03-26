import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FaTrophy, FaMedal, FaStar, FaShieldAlt, FaCode, FaLock, FaQuestionCircle, FaInfoCircle, FaSyncAlt, FaTimes, FaChevronLeft, FaChevronRight, FaEnvelope, FaGithub, FaTwitter, FaBlog, FaLaptopCode, FaAward } from 'react-icons/fa';
import { GiHoodedFigure } from 'react-icons/gi';
import { supabase } from '../supabaseClient';

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

const holographicSheenVariants: Variants = {
  initial: { backgroundPosition: '0% 50%' },
  hover: {
    backgroundPosition: '100% 50%',
    transition: { duration: 1.5, ease: 'linear', repeat: Infinity, repeatType: 'mirror' },
  },
};

const neonWaveVariants: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%'],
    transition: {
      duration: 5,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

const particleVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    },
  },
};

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

const CertificationsSlider = ({ certifications }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (certifications.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % certifications.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [certifications.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? certifications.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % certifications.length);
  };

  if (!certifications || certifications.length === 0) {
    return (
      <div className="text-center text-theme-text/70 font-mono text-sm sm:text-base italic">
        [NO CERTIFICATIONS AVAILABLE]
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="overflow-hidden rounded-xl">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            className="relative w-full h-48 sm:h-64 md:h-80"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={certifications[currentIndex]}
              alt={`Certification ${currentIndex + 1}`}
              className="w-full h-full object-cover rounded-xl border-2 border-theme-primary/50"
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x300?text=Cert+Not+Found')}
            />
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-theme-primary/50"
              style={{
                background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))',
              }}
              variants={holographicSheenVariants}
              initial="initial"
              whileHover="hover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-theme-bg/80 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 text-theme-primary font-mono text-xs sm:text-sm">
              [CERT {currentIndex + 1}/{certifications.length}]
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {certifications.length > 1 && (
        <>
          <motion.button
            onClick={handlePrev}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 p-2 bg-theme-bg/50 rounded-full text-theme-primary hover:bg-theme-primary/20 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronLeft size={20} />
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 p-2 bg-theme-bg/50 rounded-full text-theme-primary hover:bg-theme-primary/20 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronRight size={20} />
          </motion.button>
        </>
      )}
    </div>
  );
};

interface TechTeamMember {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  photo: string;
  tryHackMe: { rank: number; completedRooms: number; achievements: string[]; profileLink: string; badge?: string };
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
          tryHackMe: user.try_hack_me || { rank: 0, completedRooms: 0, achievements: [], profileLink: '', badge: '' },
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
    fetchMembers();

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
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">[TOTAL SCORE]</h4>
                  <p className="text-lg sm:text-2xl font-bold text-theme-primary">{showScoreBreakdown.totalScore.toFixed(1)}</p>
                </div>

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

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/90 backdrop-blur-lg px-4 sm:px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setSelectedMember(null)}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <motion.div
              className="relative w-full max-w-5xl h-[90vh] bg-navy/95 rounded-2xl border border-theme-primary/50 shadow-theme-primary overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-circuit-pattern opacity-10 pointer-events-none"></div>
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-theme-primary/50 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    variants={particleVariants}
                    animate="animate"
                    transition={{ delay: Math.random() * 2 }}
                  />
                ))}
              </div>

              <CloseButton onClose={() => setSelectedMember(null)} />

              <div className="relative bg-gradient-to-b from-theme-bg/70 to-transparent p-6 sm:p-8 border-b border-theme-primary/40">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-theme-primary/20 via-theme-secondary/20 to-theme-primary/20 opacity-50"
                  variants={neonWaveVariants}
                  animate="animate"
                />
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={selectedMember.photo || DEFAULT_PHOTO}
                      alt={selectedMember.name}
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-theme-primary/70 shadow-theme-primary"
                      onError={(e) => (e.currentTarget.src = DEFAULT_PHOTO)}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-theme-primary/50"
                      style={{
                        background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))',
                      }}
                      variants={holographicSheenVariants}
                      initial="initial"
                      whileHover="hover"
                    />
                  </motion.div>
                  <div className="text-center sm:text-left">
                    <motion.h3
                      className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary font-mono"
                      variants={glitchVariants}
                      initial="initial"
                      animate="animate"
                      data-text={`[${selectedMember.name.toUpperCase()}]`}
                    >
                      [{selectedMember.name.toUpperCase()}]
                    </motion.h3>
                    <p className="text-theme-text text-sm sm:text-base font-sans mt-1">
                      {selectedMember.batchAndBranch}
                    </p>
                    <p className="text-theme-secondary text-sm sm:text-base font-mono mt-1">
                      [LEVEL]: {getLevel(selectedMember.totalScore)}
                    </p>
                    <p className="text-theme-text text-sm sm:text-base font-mono mt-1">
                      [POINTS]:{' '}
                      <motion.span
                        className="text-theme-primary font-bold"
                        variants={neonPulseVariants}
                        animate="pulse"
                      >
                        {selectedMember.totalScore.toFixed(1)}
                      </motion.span>
                    </p>
                    <p className="text-theme-text text-sm sm:text-base font-mono mt-1">
                      [ROLE]: <span className="text-theme-accent">{selectedMember.testimonial}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row h-[calc(90vh-200px)] overflow-hidden">
                <div className="lg:w-2/5 bg-theme-bg/20 border-r border-theme-primary/40 p-6 sm:p-8 overflow-y-auto">
                  <div className="space-y-6">
                    <motion.div
                      className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
                        }}
                        variants={holographicSheenVariants}
                        initial="initial"
                        whileHover="hover"
                      />
                      <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-3 relative z-10 flex items-center gap-2">
                        <FaLaptopCode /> [BIO]
                      </h4>
                      <p className="text-theme-text text-sm sm:text-base font-sans leading-relaxed relative z-10">
                        {selectedMember.bio}
                      </p>
                    </motion.div>

                    <motion.div
                      className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
                        }}
                        variants={holographicSheenVariants}
                        initial="initial"
                        whileHover="hover"
                      />
                      <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-3 relative z-10 flex items-center gap-2">
                        <FaCode /> [SKILLS]
                      </h4>
                      <div className="flex flex-wrap gap-2 relative z-10">
                        {selectedMember.skills && selectedMember.skills.length > 0 ? (
                          selectedMember.skills.map((skill, index) => (
                            <motion.span
                              key={index}
                              className="px-3 py-1 bg-theme-primary/20 text-theme-primary font-mono text-xs sm:text-sm rounded-full border border-theme-primary/50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {skill}
                            </motion.span>
                          ))
                        ) : (
                          <p className="text-theme-text/70 font-mono text-sm italic">[NO SKILLS LISTED]</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
                        }}
                        variants={holographicSheenVariants}
                        initial="initial"
                        whileHover="hover"
                      />
                      <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-3 relative z-10 flex items-center gap-2">
                        <FaEnvelope /> [CONNECT]
                      </h4>
                      <div className="flex flex-wrap gap-3 relative z-10">
                        {selectedMember.socials.email && (
                          <motion.a
                            href={selectedMember.socials.email}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-theme-primary hover:text-theme-secondary font-mono text-sm transition-colors duration-300 flex items-center gap-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaEnvelope /> [EMAIL]
                          </motion.a>
                        )}
                        {selectedMember.socials.github && (
                          <motion.a
                            href={selectedMember.socials.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-theme-primary hover:text-theme-secondary font-mono text-sm transition-colors duration-300 flex items-center gap-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaGithub /> [GITHUB]
                          </motion.a>
                        )}
                        {selectedMember.socials.twitter && (
                          <motion.a
                            href={selectedMember.socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-theme-primary hover:text-theme-secondary font-mono text-sm transition-colors duration-300 flex items-center gap-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaTwitter /> [TWITTER]
                          </motion.a>
                        )}
                        {selectedMember.socials.blog && (
                          <motion.a
                            href={selectedMember.socials.blog}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-theme-primary hover:text-theme-secondary font-mono text-sm transition-colors duration-300 flex items-center gap-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaBlog /> [BLOG]
                          </motion.a>
                        )}
                        {(!selectedMember.socials.email && !selectedMember.socials.github && !selectedMember.socials.twitter && !selectedMember.socials.blog) && (
                          <p className="text-theme-text/70 font-mono text-sm italic">[NO SOCIAL LINKS AVAILABLE]</p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="lg:w-3/5 p-6 sm:p-8 overflow-y-auto">
                  <div className="space-y-8">
                    <motion.div
                      className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md relative"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
                        }}
                        variants={holographicSheenVariants}
                        initial="initial"
                        whileHover="hover"
                      />
                      <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-4 relative z-10 flex items-center gap-2">
                        <FaShieldAlt /> [TRYHACKME STATS]
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                        <div className="bg-theme-bg/40 p-4 rounded-lg border border-theme-secondary/40">
                          <p className="text-theme-secondary font-mono text-sm sm:text-base">
                            [RANK]:{' '}
                            <span className="text-theme-primary font-bold">
                              {selectedMember.tryHackMe.rank || 'N/A'}
                            </span>
                          </p>
                        </div>
                        <div className="bg-theme-bg/40 p-4 rounded-lg border border-theme-secondary/40">
                          <p className="text-theme-secondary font-mono text-sm sm:text-base">
                            [ROOMS COMPLETED]:{' '}
                            <span className="text-theme-primary font-bold">
                              {selectedMember.tryHackMe.completedRooms || 0}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 relative z-10">
                        <p className="text-theme-secondary font-mono text-sm sm:text-base mb-2">
                          [ACHIEVEMENTS]:
                        </p>
                        {selectedMember.tryHackMe.achievements &&
                        selectedMember.tryHackMe.achievements.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedMember.tryHackMe.achievements.map(
                              (achievement, index) => (
                                <motion.span
                                  key={index}
                                  className="px-3 py-1 bg-theme-primary/20 text-theme-primary font-mono text-xs sm:text-sm rounded-full border border-theme-primary/50"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  {achievement}
                                </motion.span>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-theme-text/70 font-mono text-sm italic">
                            [NO ACHIEVEMENTS YET]
                          </p>
                        )}
                      </div>
                      {selectedMember.tryHackMe.profileLink && (
                        <div className="mt-4 relative z-10">
                          <a
                            href={selectedMember.tryHackMe.profileLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-theme-primary font-mono text-sm hover:text-theme-secondary transition-colors duration-300 flex items-center gap-2"
                          >
                            <FaLaptopCode /> [VIEW TRYHACKME PROFILE]
                          </a>
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md relative"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
                        }}
                        variants={holographicSheenVariants}
                        initial="initial"
                        whileHover="hover"
                      />
                      <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-4 relative z-10 flex items-center gap-2">
                        <FaAward /> [TRYHACKME BADGE]
                      </h4>
                      <div className="relative z-10 flex justify-center">
                        {selectedMember.tryHackMe.badge ? (
                          <motion.div
                            className="relative"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <iframe
                              src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${selectedMember.tryHackMe.badge}`}
                              style={{ border: 'none', width: '200px', height: '200px' }}
                              title="TryHackMe Badge"
                              className="rounded-lg border-2 border-theme-primary/50 shadow-theme-primary"
                            />
                            <motion.div
                              className="absolute inset-0 rounded-lg border-2 border-theme-primary/50"
                              style={{
                                background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))',
                              }}
                              variants={holographicSheenVariants}
                              initial="initial"
                              whileHover="hover"
                            />
                          </motion.div>
                        ) : (
                          <p className="text-theme-text/70 font-mono text-sm italic">[NO BADGE AVAILABLE]</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-4 flex items-center gap-2">
                        <FaAward /> [CERTIFICATIONS]
                      </h4>
                      <CertificationsSlider certifications={selectedMember.certifications} />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



/*import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FaTrophy, FaMedal, FaStar, FaShieldAlt, FaCode, FaLock, FaQuestionCircle, FaInfoCircle, FaSyncAlt, FaTimes, FaChevronLeft, FaChevronRight, FaEnvelope, FaGithub, FaTwitter, FaBlog, FaLaptopCode, FaAward, FaUserSecret, FaNetworkWired, FaKey } from 'react-icons/fa';
import { GiHoodedFigure } from 'react-icons/gi';
import { supabase } from '../supabaseClient';

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

const holographicSheenVariants: Variants = {
  initial: { backgroundPosition: '0% 50%' },
  hover: {
    backgroundPosition: '100% 50%',
    transition: { duration: 1.5, ease: 'linear', repeat: Infinity, repeatType: 'mirror' },
  },
};

const neonWaveVariants: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%'],
    transition: {
      duration: 5,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

const particleVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    },
  },
};

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

const CertificationsSlider = ({ certifications }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (certifications.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % certifications.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [certifications.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? certifications.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % certifications.length);
  };

  if (!certifications || certifications.length === 0) {
    return (
      <div className="text-center text-theme-text/70 font-mono text-sm sm:text-base italic">
        [NO CERTIFICATIONS DETECTED]
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="overflow-hidden rounded-xl">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            className="relative w-full h-48 sm:h-64 md:h-80"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={certifications[currentIndex]}
              alt={`Certification ${currentIndex + 1}`}
              className="w-full h-full object-cover rounded-xl border-2 border-theme-primary/50 shadow-lg shadow-theme-primary/20"
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x300?text=Cert+Access+Denied')}
            />
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-theme-primary/50"
              style={{
                background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))',
              }}
              variants={holographicSheenVariants}
              initial="initial"
              whileHover="hover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-theme-bg/80 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 text-theme-primary font-mono text-xs sm:text-sm">
              [CERT {currentIndex + 1}/{certifications.length}]
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {certifications.length > 1 && (
        <>
          <motion.button
            onClick={handlePrev}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 p-2 bg-theme-bg/50 rounded-full text-theme-primary hover:bg-theme-primary/20 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronLeft size={20} />
          </motion.button>
          <motion.button
            onClick={handleNext}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 p-2 bg-theme-bg/50 rounded-full text-theme-primary hover:bg-theme-primary/20 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaChevronRight size={20} />
          </motion.button>
        </>
      )}
    </div>
  );
};

interface TechTeamMember {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  photo: string;
  tryHackMe: { rank: number; completedRooms: number; achievements: string[]; profileLink: string; badge?: string };
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
      const { data: test, error: testError } = await supabase
        .from('registered_users')
        .select('count')
        .single();
      if (testError) throw new Error(`Failed to connect to the database: ${testError.message}`);

      const { data: users, error: userError } = await supabase.rpc('get_users_with_registration');
      if (userError || !users) throw new Error(userError?.message || 'Failed to fetch team members');

      if (users.length === 0) throw new Error('No team members found.');

      const validUsers = users.filter((user: any) => user.user_id != null && user.user_id !== 'undefined');
      const userIds = validUsers.map((user: any) => user.user_id);

      let taskSubmissions: any[] = [];
      if (userIds.length > 0) {
        const { data: taskData, error: taskError } = await supabase
          .from('task_submissions')
          .select('user_id, email, event_name, status, timestamp')
          .in('user_id', userIds);
        if (taskError) taskSubmissions = [];
        else taskSubmissions = taskData || [];
      }

      let quizAttempts: any[] = [];
      if (userIds.length > 0) {
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_attempts')
          .select('user_id, user_email, score, total_quizzes, completed_quizzes, passed')
          .in('user_id', userIds);
        if (quizError) quizAttempts = [];
        else quizAttempts = quizData || [];
      }

      let tasks: any[] = [];
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('task_name, submission_deadline');
      if (tasksError) tasks = [];
      else tasks = tasksData || [];

      const quizAggregates = quizAttempts.reduce((acc: any, attempt: any) => {
        const userId = attempt.user_id;
        if (!userId) return acc;
        if (!acc[userId]) acc[userId] = { totalQuizzes: 0, completedQuizzes: 0 };
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
          acc[userId].timingPenalty += Math.min(timeDiffDays * 5, 30);
        }

        const task = tasks.find((t: any) => t.task_name === submission.event_name);
        if (task && submission.timestamp && submission.status === 'Approved') {
          const submissionTime = new Date(submission.timestamp).getTime();
          const deadline = new Date(task.submission_deadline).getTime();
          const timeDiffDays = (submissionTime - deadline) / (1000 * 60 * 60 * 24);
          if (timeDiffDays > 0) acc[userId].latePenalty += Math.min(timeDiffDays * 10, 40);
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
          tryHackMe: user.try_hack_me || { rank: 0, completedRooms: 0, achievements: [], profileLink: '', badge: '' },
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

      setMembers(uniqueMembersData.sort((a: TechTeamMember, b: TechTeamMember) => b.totalScore - a.totalScore));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setMembers([]);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();

    const taskSubscription = supabase
      .channel('task-submissions-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_submissions' }, fetchMembers)
      .subscribe();

    const quizSubscription = supabase
      .channel('quiz-attempts-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_attempts' }, fetchMembers)
      .subscribe();

    return () => {
      supabase.removeChannel(taskSubscription);
      supabase.removeChannel(quizSubscription);
    };
  }, [fetchMembers]);

  const handleRefresh = () => fetchMembers();

  const getRankBadge = (score: number, index: number) => {
    if (index === 0) return <FaTrophy className="text-theme-gold text-xl sm:text-2xl" />;
    if (index === 1) return <FaMedal className="text-theme-silver text-xl sm:text-2xl" />;
    if (index === 2) return <FaStar className="text-theme-bronze text-xl sm:text-2xl" />;
    if (score >= 90) return <FaShieldAlt className="text-theme-primary text-xl sm:text-2xl" />;
    if (score >= 70) return <FaCode className="text-theme-secondary text-xl sm:text-2xl" />;
    return <FaLock className="text-gray-400 text-xl sm:text-2xl" />;
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
        <p className="text-theme-text text-lg sm:text-xl font-mono">[NO DATA] No operatives detected.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-theme-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-theme-bg via-theme-bg/90 to-theme-bg/70 z-0"></div>
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-circuit-pattern"></div>

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
              data-text="[CYBER OPS LEADERBOARD]"
            >
              [CYBER OPS LEADERBOARD]
            </motion.h1>
            <motion.p
              className="text-theme-text mt-2 sm:mt-4 text-sm sm:text-lg md:text-xl font-sans max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {'>'} Infiltrating the ranks of the elite. Who’s dominating the cyber battlefield?
            </motion.p>
            <div className="flex justify-center gap-4 mt-4">
              <motion.button
                onClick={() => setShowRulesPopup(true)}
                className="px-4 py-2 bg-theme-primary text-navy font-mono rounded-lg hover:bg-theme-secondary transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaQuestionCircle className="text-navy" /> [DECODE RULES]
              </motion.button>
              <motion.button
                onClick={handleRefresh}
                className="px-4 py-2 bg-theme-primary text-navy font-mono rounded-lg hover:bg-theme-secondary transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isRefreshing}
              >
                <FaSyncAlt className={`text-navy ${isRefreshing ? 'animate-spin' : ''}`} /> [RELOAD INTEL]
              </motion.button>
            </div>
            {isRefreshing && (
              <motion.div
                className="text-theme-primary text-xs sm:text-sm font-mono mt-2 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <FaSyncAlt className="text-theme-primary" />
                </motion.div>
                [RECOMPILING DATA...]
              </motion.div>
            )}
          </motion.div>

          <div className="mb-12 sm:mb-16 lg:mb-20">
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-10 text-theme-primary text-center font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              data-text="> [TOP CYBER AGENTS]"
            >
              {'>'} [TOP CYBER AGENTS]
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
                          index === 0 ? 'text-theme-gold' : index === 1 ? 'text-theme-silver' : index === 2 ? 'text-theme-bronze' : 'text-theme-primary'
                        }`}
                        animate={index < 3 ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        #{index + 1}
                      </motion.span>
                      <motion.img
                        src={member.photo || DEFAULT_PHOTO}
                        alt={member.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-theme-primary/50 shadow-theme-primary/20"
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
                          [SCORE]:{' '}
                          <motion.span
                            className={`${index === 0 ? 'text-theme-gold' : 'text-theme-primary'} font-bold text-lg sm:text-xl`}
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
            data-text="> [OPERATIVE DOSSIERS]"
          >             {'>'} [OPERATIVE DOSSIERS]
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
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-theme-primary/50 shadow-theme-primary/20"
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
                      <p className="text-theme-text text-xs sm:text-sm">[SCORE]: <span className="text-theme-primary font-bold">{member.totalScore.toFixed(1)}</span></p>
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
                      <GiHoodedFigure className="text-navy" /> [ACCESS PROFILE]
                    </motion.button>
                    <motion.button
                      onClick={() => setShowScoreBreakdown(member)}
                      className="py-2 px-3 sm:px-4 bg-theme-primary text-navy font-mono rounded-lg hover:bg-theme-secondary hover:text-navy transition-all duration-300 flex items-center justify-center gap-2 text-xs sm:text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaInfoCircle className="text-navy" /> [SCORE DECRYPT]
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showRulesPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/80 backdrop-blur-md px-4 sm:px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setShowRulesPopup(false)}
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
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-primary font-mono">[SCORING PROTOCOL]</h3>
                <p className="text-theme-text/70 text-xs sm:text-sm mt-2 font-sans">Decrypting the scoring matrix</p>
              </div>
              <div className="space-y-4 sm:space-y-6 text-theme-text font-sans">
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">[TOTAL SCORE]</h4>
                  <p className="text-xs sm:text-sm">Base Score + Timing Bonus:</p>
                  <p className="text-theme-secondary font-mono mt-1 text-xs sm:text-sm">Total Score = Base + Bonus (min 0)</p>
                </div>
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">[BASE SCORE] (max 100)</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-theme-accent">[QUIZ SCORE] (max 50):</p>
                      <p className="text-xs sm:text-sm ml-4">Quiz Completion % × 50</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-theme-secondary">[TASK SCORE] (max 50):</p>
                      <p className="text-xs sm:text-sm ml-4">Task Completion % × 50</p>
                    </div>
                  </div>
                </div>
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">[TIMING BONUS] (max 50)</h4>
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm">Base 50, reduced by:</p>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-theme-error">[TIMING PENALTY]:</p>
                      <p className="text-xs sm:text-sm ml-4">5 points/day late vs earliest, max 30/task</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-theme-error">[LATE PENALTY]:</p>
                      <p className="text-xs sm:text-sm ml-4">10 points/day past deadline, max 40/task</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScoreBreakdown && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/80 backdrop-blur-md px-4 sm:px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setShowScoreBreakdown(null)}
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
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-theme-primary font-mono">[SCORE DECRYPTION]</h3>
                <p className="text-theme-text/70 text-xs sm:text-sm mt-2 font-sans">Operative: {showScoreBreakdown.name}</p>
              </div>
              <div className="space-y-4 sm:space-y-6 text-theme-text font-sans">
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-2">[TOTAL SCORE]</h4>
                  <p className="text-lg sm:text-2xl font-bold text-theme-primary">{showScoreBreakdown.totalScore.toFixed(1)}</p>
                </div>
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-3">[BASE SCORE]</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm font-medium text-theme-accent">[QUIZ SCORE]</p>
                      <p className="text-xs sm:text-sm font-bold text-theme-accent">{((showScoreBreakdown.quizRate / 100) * 50).toFixed(1)} / 50</p>
                    </div>
                    <p className="text-xs text-theme-text/70">Quiz Rate: {showScoreBreakdown.quizRate.toFixed(1)}%</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm font-medium text-theme-secondary">[TASK SCORE]</p>
                      <p className="text-xs sm:text-sm font-bold text-theme-secondary">{((showScoreBreakdown.taskRate / 100) * 50).toFixed(1)} / 50</p>
                    </div>
                    <p className="text-xs text-theme-text/70">Task Rate: {showScoreBreakdown.taskRate.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-3">[TIMING BONUS]</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs sm:text-sm font-medium">Bonus</p>
                      <p className="text-xs sm:text-sm font-bold text-theme-primary">{Math.max(50 - showScoreBreakdown.timingPenalty - showScoreBreakdown.latePenalty, 0).toFixed(1)} / 50</p>
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
                <div className="bg-theme-bg/50 p-4 sm:p-5 rounded-lg border border-theme-primary/20">
                  <h4 className="text-base sm:text-lg font-semibold text-theme-primary mb-3">[SUBMISSION LOG]</h4>
                  {showScoreBreakdown.submissions.length > 0 ? (
                    <div className="space-y-4">
                      {showScoreBreakdown.submissions.filter((s: any) => s.status === 'Approved').map((submission: any, index: number) => {
                        const eventName = submission.event_name;
                        const submissionTime = new Date(submission.timestamp);
                        const earliestSubmission = earliestSubmitters[eventName];
                        const earliestTime = earliestSubmission ? new Date(earliestSubmission.timestamp) : null;
                        const timeDiffDays = earliestTime ? (submissionTime.getTime() - earliestTime.getTime()) / (1000 * 60 * 60 * 24) : 0;
                        const timingPenalty = Math.min(timeDiffDays * 5, 30);
                        return (
                          <div key={index} className="border-b border-theme-primary/20 pb-3 last:border-b-0">
                            <p className="text-xs sm:text-sm font-medium text-theme-secondary">[TASK: {eventName}]</p>
                            <p className="text-xs mt-1">Submitted: {submissionTime.toLocaleString()}</p>
                            <p className="text-xs mt-1">Earliest: {earliestSubmission?.userName || 'Unknown'} @ {earliestTime?.toLocaleString() || 'N/A'}</p>
                            <p className="text-xs mt-1">Delay: <span className="text-theme-error">{timeDiffDays.toFixed(1)}</span> days</p>
                            <p className="text-xs mt-1">Penalty: <span className="text-theme-error">{timingPenalty.toFixed(1)}</span> points</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-theme-text/70 italic">[NO SUBMISSIONS DETECTED]</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMember && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/95 backdrop-blur-lg px-4 sm:px-6 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              className="relative w-full max-w-5xl max-h-[90vh] bg-navy/95 rounded-2xl border border-theme-primary/50 shadow-theme-primary overflow-hidden flex flex-col"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-circuit-pattern opacity-10 pointer-events-none"></div>
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-theme-primary/50 rounded-full"
                    style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                    variants={particleVariants}
                    animate="animate"
                    transition={{ delay: Math.random() * 2 }}
                  />
                ))}
              </div>

              <CloseButton onClose={() => setSelectedMember(null)} />

              {/* Header Section } -------------------------------------
              <div className="relative bg-gradient-to-b from-theme-bg/80 to-navy/90 p-6 sm:p-8 border-b border-theme-primary/40">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-theme-primary/20 via-theme-secondary/20 to-theme-accent/20 opacity-60"
                  variants={neonWaveVariants}
                  animate="animate"
                />
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
                  <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <img
                      src={selectedMember.photo || DEFAULT_PHOTO}
                      alt={selectedMember.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-theme-primary/70 shadow-theme-primary"
                      onError={(e) => (e.currentTarget.src = DEFAULT_PHOTO)}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-theme-primary/50"
                      style={{ background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))' }}
                      variants={holographicSheenVariants}
                      initial="initial"
                      whileHover="hover"
                    />
                  </motion.div>
                  <div className="text-center sm:text-left">
                    <motion.h3
                      className="text-2xl sm:text-3xl md:text-4xl font-bold text-theme-primary font-mono"
                      variants={glitchVariants}
                      initial="initial"
                      animate="animate"
                      data-text={`[OPERATIVE: ${selectedMember.name.toUpperCase()}]`}
                    >
                      [OPERATIVE: {selectedMember.name.toUpperCase()}]
                    </motion.h3>
                    <p className="text-theme-text text-sm sm:text-base font-sans mt-1">{selectedMember.batchAndBranch}</p>
                    <p className="text-theme-secondary text-sm sm:text-base font-mono mt-1">[RANK]: {getLevel(selectedMember.totalScore)}</p>
                    <p className="text-theme-text text-sm sm:text-base font-mono mt-1">
                      [SCORE]: <motion.span className="text-theme-primary font-bold" variants={neonPulseVariants} animate="pulse">{selectedMember.totalScore.toFixed(1)}</motion.span>
                    </p>
                    <p className="text-theme-text text-sm sm:text-base font-mono mt-1">[DESIGNATION]: <span className="text-theme-accent">{selectedMember.testimonial}</span></p>
                  </div>
                </div>
              </div>

              {/* Main Content } -----------
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column } ------------
                <div className="space-y-6">
                  <motion.div
                    className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))' }}
                      variants={holographicSheenVariants}
                      initial="initial"
                      whileHover="hover"
                    />
                    <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-3 relative z-10 flex items-center gap-2">
                      <FaUserSecret /> [OPERATIVE INTEL]
                    </h4>
                    <p className="text-theme-text text-sm sm:text-base font-sans leading-relaxed relative z-10">{selectedMember.bio}</p>
                  </motion.div>

                  <motion.div
                    className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))' }}
                      variants={holographicSheenVariants}
                      initial="initial"
                      whileHover="hover"
                    />
                    <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-3 relative z-10 flex items-center gap-2">
                      <FaKey /> [CYBER ARSENAL]
                    </h4>
                    <div className="flex flex-wrap gap-2 relative z-10">
                      {selectedMember.skills.length > 0 ? (
                        selectedMember.skills.map((skill, index) => (
                          <motion.span
                            key={index}
                            className="px-3 py-1 bg-theme-primary/20 text-theme-primary font-mono text-xs sm:text-sm rounded-full border border-theme-primary/50"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {skill}
                          </motion.span>
                        ))
                      ) : (
                        <p className="text-theme-text/70 font-mono text-sm italic">[ARSENAL EMPTY]</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))' }}
                      variants={holographicSheenVariants}
                      initial="initial"
                      whileHover="hover"
                    />
                    <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-3 relative z-10 flex items-center gap-2">
                      <FaNetworkWired /> [DIGITAL FOOTPRINT]
                    </h4>
                    <div className="flex flex-wrap gap-3 relative z-10">
                      {selectedMember.socials.email && (
                        <motion.a
                          href={`mailto:${selectedMember.socials.email}`}
                          className="text-theme-primary hover:text-theme-secondary font-mono text-sm transition-colors duration-300 flex items-center gap-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaEnvelope /> [EMAIL]
                        </motion.a>
                      )}
                      {selectedMember.socials.github && (
                        <motion.a
                          href={selectedMember.socials.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-theme-primary hover:text-theme-secondary font-mono text-sm transition-colors duration-300 flex items-center gap-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaGithub /> [GITHUB]
                        </motion.a>
                      )}
                      {selectedMember.socials.twitter && (
                        <motion.a
                          href={selectedMember.socials.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-theme-primary hover:text-theme-secondary font-mono text-sm transition-colors duration-300 flex items-center gap-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaTwitter /> [TWITTER]
                        </motion.a>
                      )}
                      {selectedMember.socials.blog && (
                        <motion.a
                          href={selectedMember.socials.blog}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-theme-primary hover:text-theme-secondary font-mono text-sm transition-colors duration-300 flex items-center gap-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaBlog /> [BLOG]
                        </motion.a>
                      )}
                      {Object.keys(selectedMember.socials).length === 0 && (
                        <p className="text-theme-text/70 font-mono text-sm italic">[NO TRACE DETECTED]</p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Right Column } -----------
                <div className="space-y-6">
                  <motion.div
                    className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))' }}
                      variants={holographicSheenVariants}
                      initial="initial"
                      whileHover="hover"
                    />
                    <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-4 relative z-10 flex items-center gap-2">
                      <FaShieldAlt /> [HACK STATS]
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                      <div className="bg-theme-bg/40 p-4 rounded-lg border border-theme-secondary/40">
                        <p className="text-theme-secondary font-mono text-sm sm:text-base">
                          [RANK]: <span className="text-theme-primary font-bold">{selectedMember.tryHackMe.rank || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="bg-theme-bg/40 p-4 rounded-lg border border-theme-secondary/40">
                        <p className="text-theme-secondary font-mono text-sm sm:text-base">
                          [ROOMS]: <span className="text-theme-primary font-bold">{selectedMember.tryHackMe.completedRooms || 0}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 relative z-10">
                      <p className="text-theme-secondary font-mono text-sm sm:text-base mb-2">[ACHIEVEMENTS]:</p>
                      {selectedMember.tryHackMe.achievements.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.tryHackMe.achievements.map((achievement, index) => (
                            <motion.span
                              key={index}
                              className="px-3 py-1 bg-theme-primary/20 text-theme-primary font-mono text-xs sm:text-sm rounded-full border border-theme-primary/50"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {achievement}
                            </motion.span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-theme-text/70 font-mono text-sm italic">[NO ACHIEVEMENTS DETECTED]</p>
                      )}
                    </div>
                    {selectedMember.tryHackMe.profileLink && (
                      <div className="mt-4 relative z-10">
                        <a
                          href={selectedMember.tryHackMe.profileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-theme-primary font-mono text-sm hover:text-theme-secondary transition-colors duration-300 flex items-center gap-2"
                        >
                          <FaLaptopCode /> [TRYHACKME PROFILE]
                        </a>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    className="glassmorphic-card p-4 sm:p-6 rounded-xl border border-theme-primary/30 backdrop-blur-md relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))' }}
                      variants={holographicSheenVariants}
                      initial="initial"
                      whileHover="hover"
                    />
                    <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-4 relative z-10 flex items-center gap-2">
                      <FaAward /> [OPERATIVE BADGE]
                    </h4>
                    <div className="relative z-10 flex justify-center">
                      {selectedMember.tryHackMe.badge ? (
                        <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                          <iframe
                            src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${selectedMember.tryHackMe.badge}`}
                            style={{ border: 'none', width: '100%', maxWidth: '200px', height: '200px' }}
                            title="TryHackMe Badge"
                            className="rounded-lg border-2 border-theme-primary/50 shadow-theme-primary"
                          />
                          <motion.div
                            className="absolute inset-0 rounded-lg border-2 border-theme-primary/50"
                            style={{ background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.2), rgba(255, 0, 255, 0.2))' }}
                            variants={holographicSheenVariants}
                            initial="initial"
                            whileHover="hover"
                          />
                        </motion.div>
                      ) : (
                        <p className="text-theme-text/70 font-mono text-sm italic">[NO BADGE DETECTED]</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h4 className="text-lg sm:text-xl font-semibold text-theme-primary font-mono mb-4 flex items-center gap-2">
                      <FaAward /> [CREDENTIALS]
                    </h4>
                    <CertificationsSlider certifications={selectedMember.certifications} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}*/
           