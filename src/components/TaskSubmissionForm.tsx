import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

interface FormData {
  name: string;
  email: string;
  phone: string;
  year: string;
  discipline: string;
  program: string;
  registration_number: string;
  batch: string;
  image: FileList;
  learnings?: string; // Optional since it may not be required
  doc_links?: string; // Optional since it may not be required
}

interface Task {
  id: string;
  task_name: string;
  require_doc_links: boolean;
  require_learnings: boolean; // New field
}

const TaskSubmissionForm: React.FC = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>(); // Get taskId from URL params
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      year: '',
      discipline: '',
      program: '',
      registration_number: '',
      batch: '',
      learnings: '',
      doc_links: '',
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [task, setTask] = useState<Task | null>(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const discipline = watch('discipline');

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

  // Fetch task details to determine if learnings and doc_links are required
  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        setLoadingTask(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, task_name, require_doc_links, require_learnings')
          .eq('id', taskId)
          .single();
        if (error) throw error;
        setTask(data);
      } catch (err) {
        console.error('Error fetching task:', err);
        setSubmissionError('Failed to load task details.');
      } finally {
        setLoadingTask(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const onSubmit = async (data: FormData) => {
    setSubmissionError(null);
    setSubmissionSuccess(false);

    // Validate learnings only if required
    if (task?.require_learnings) {
      const words = data.learnings?.trim().split(/\s+/).filter(word => word.length > 0) || [];
      const wordCount = words.length;
      if (!data.learnings) {
        setSubmissionError('Learnings is required.');
        return;
      }
      if (wordCount < 100 || wordCount > 200) {
        setSubmissionError('Learnings must be between 100 and 200 words.');
        return;
      }
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

      const { error } = await supabase.from('task_submissions').insert({
        event_name: task?.task_name || 'Custom Form Submission',
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
        learnings: task?.require_learnings ? data.learnings : null, // Only include if required
        doc_links: task?.require_doc_links ? data.doc_links : null, // Only include if required
      });

      if (error) throw error;

      setSubmissionSuccess(true);
      reset();
      setImagePreview(null);
      navigate('/members-portal');
    } catch (err) {
      setSubmissionError(err.message || 'Submission failed. Please try again.');
    }
  };

  if (loadingTask) return <div className="text-white text-center p-6">Loading task details...</div>;

  return (
    <div className="min-h-screen bg-navy-light text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-cyan text-center mb-8">Task Submission Form</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-navy p-6 rounded-lg shadow-lg border-2 border-cyan">
          <div>
            <label className="block text-lg sm:text-xl text-white mb-2">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-lg sm:text-xl text-white mb-2">Email</label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
              })}
              className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-lg sm:text-xl text-white mb-2">Phone</label>
            <input
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: /^[0-9]{10}$/, message: 'Must be a 10-digit number' },
              })}
              className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-lg sm:text-xl text-white mb-2">Year</label>
            <select
              {...register('year', { required: 'Year is required' })}
              className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
            >
              <option value="">Select Year</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
          </div>

          <div>
            <label className="block text-lg sm:text-xl text-white mb-2">Discipline</label>
            <select
              {...register('discipline', { required: 'Discipline is required' })}
              className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
            >
              <option value="">Select Discipline</option>
              {disciplineOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.discipline && <p className="text-red-500 text-sm mt-1">{errors.discipline.message}</p>}
          </div>

          {discipline && (
            <div>
              <label className="block text-lg sm:text-xl text-white mb-2">Program</label>
              <select
                {...register('program', { required: 'Program is required' })}
                className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
              >
                <option value="">Select Program</option>
                {programOptions[discipline]?.map((prog) => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
              {errors.program && <p className="text-red-500 text-sm mt-1">{errors.program.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-lg sm:text-xl text-white mb-2">Registration Number</label>
            <input
              {...register('registration_number', { required: 'Registration Number is required' })}
              className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
              placeholder="Enter your registration number"
            />
            {errors.registration_number && <p className="text-red-500 text-sm mt-1">{errors.registration_number.message}</p>}
          </div>

          <div>
            <label className="block text-lg sm:text-xl text-white mb-2">Batch</label>
            <select
              {...register('batch', { required: 'Batch is required' })}
              className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
            >
              <option value="">Select Batch</option>
              {batchOptions.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
            {errors.batch && <p className="text-red-500 text-sm mt-1">{errors.batch.message}</p>}
          </div>

          <div>
            <label className="block text-lg sm:text-xl text-white mb-2">Upload Task Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              {...register('image')}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const previewUrl = URL.createObjectURL(file);
                  setImagePreview(previewUrl);
                }
              }}
              className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="max-w-full max-h-40 object-cover rounded-md" />
              </div>
            )}
          </div>

          {task?.require_learnings && (
            <div>
              <label className="block text-lg sm:text-xl text-white mb-2">What have you learnt from this task (100-200 words)</label>
              <textarea
                {...register('learnings', {
                  required: 'Learnings is required',
                  validate: (value) => {
                    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
                    const wordCount = words.length;
                    return (wordCount >= 100 && wordCount <= 200) || 'Must be between 100 and 200 words';
                  },
                })}
                className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none h-40"
                placeholder="Write about what you have learned from this task (100-200 words)..."
              />
              {errors.learnings && <p className="text-red-500 text-sm mt-1">{errors.learnings.message}</p>}
            </div>
          )}

          {task?.require_doc_links && (
            <div>
              <label className="block text-lg sm:text-xl text-white mb-2">Document Link</label>
              <input
                {...register('doc_links')}
                className="w-full p-2 sm:p-3 rounded bg-navy-dark text-white border border-gray-700 focus:border-cyan focus:outline-none"
                placeholder="Enter document link (e.g., Google Drive URL)"
              />
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-cyan text-navy-dark rounded hover:bg-blue-600 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setImagePreview(null);
                navigate('/members-portal');
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300"
            >
              Cancel
            </button>
          </div>

          {submissionError && <p className="text-red-500 text-sm mt-4">{submissionError}</p>}
          {submissionSuccess && (
            <p className="text-green-500 text-sm mt-4">Submission successful! Redirecting...</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default TaskSubmissionForm;