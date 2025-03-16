import { useState, useEffect } from 'react'; // Added useEffect for initial render check
import { useForm, Controller } from 'react-hook-form';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { supabase } from '../supabaseClient';

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
  learnings: string;
  doc_links: string;
}

interface TaskSubmissionFormProps {
  eventName: string;
}

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
  Other: ['Other'],
};

const batchOptions = ['Wednesday Batch', 'Thursday Batch'];

export function TaskSubmissionForm({ eventName }: TaskSubmissionFormProps) {
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { event_name: eventName, batch: '' },
  });
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TaskSubmissionForm mounted with eventName:', eventName);
    console.log('Rendering form - Checking all fields');
  }, [eventName]);

  const discipline = watch('discipline');
  const learningsText = watch('learnings') || '';
  const wordCount = learningsText.trim().split(/\s+/).filter(Boolean).length;

  const onFormSubmit = async (data: FormData) => {
    setSubmissionError(null);
    console.log('Form data submitted:', data);

    try {
      if (wordCount < 100 || wordCount > 200) {
        throw new Error('Your response for "What did you learn?" must be between 100 and 200 words.');
      }

      let imageUrl = null;
      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        console.log('Uploading image:', file?.name);
        const fileName = `${Date.now()}_${file?.name || 'image'}`;
        const { error: uploadError } = await supabase.storage
          .from('task-submissions-images')
          .upload(`public/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
        imageUrl = `${supabase.storage.from('task-submissions-images').getPublicUrl('public/' + fileName).data.publicUrl}`;
        console.log('Image URL generated:', imageUrl);
      }

      console.log('Submitting to database with doc_links:', data.doc_links);
      const { error: dbError } = await supabase.from('task_submissions').insert({
        event_name: data.event_name,
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
        learnings: data.learnings,
        doc_links: data.doc_links || null,
      });
      if (dbError) {
        console.error('Database error details:', dbError);
        throw new Error(`Database insertion failed: ${dbError.message}`);
      }

      setSubmissionStatus('success');
    } catch (error) {
      console.error('Submission error details:', error);
      setSubmissionError(error.message || 'Submission failed. Please try again.');
      setSubmissionStatus('error');
    }
  };

  return (
    <Card className="mt-6 p-6 bg-navy-light border-cyan">
      <h2 className="text-2xl font-bold text-cyan mb-6">Task Submission</h2>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-white">Event Name</label>
          <input
            type="text"
            value={eventName}
            readOnly
            className="w-full p-2 rounded bg-navy text-white border border-gray-800"
          />
        </div>
        <div>
          <label className="block text-white">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-white">Email</label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
            })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-white">Phone</label>
          <input
            {...register('phone', {
              required: 'Phone is required',
              pattern: { value: /^[0-9]{10}$/, message: 'Must be a 10-digit number' },
            })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
          />
          {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-white">Year</label>
          <select
            {...register('year', { required: 'Year is required' })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
          >
            <option value="">Select Year</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.year && <p className="text-red-500">{errors.year.message}</p>}
        </div>
        <div>
          <label className="block text-white">Discipline</label>
          <select
            {...register('discipline', { required: 'Discipline is required' })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
          >
            <option value="">Select Discipline</option>
            {disciplineOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.discipline && <p className="text-red-500">{errors.discipline.message}</p>}
        </div>
        {discipline && (
          <div>
            <label className="block text-white">Program</label>
            <Controller
              name="program"
              control={control}
              rules={{ required: 'Program is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
                >
                  <option value="">Select Program</option>
                  {programOptions[discipline]?.map((prog) => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              )}
            />
            {errors.program && <p className="text-red-500">{errors.program.message}</p>}
          </div>
        )}
        <div>
          <label className="block text-white">Registration Number</label>
          <input
            {...register('registration_number', { required: 'Registration Number is required' })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            placeholder="Enter your registration number"
          />
          {errors.registration_number && <p className="text-red-500">{errors.registration_number.message}</p>}
        </div>
        <div>
          <label className="block text-white">Batch</label>
          <select
            {...register('batch', { required: 'Batch is required' })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
          >
            <option value="">Select Batch</option>
            {batchOptions.map((batch) => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
          {errors.batch && <p className="text-red-500">{errors.batch.message}</p>}
        </div>
        <div>
          <label className="block text-white">Upload Task Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            {...register('image')}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);
              } else {
                setImagePreview(null);
              }
            }}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
          />
          {errors.image && <p className="text-red-500">{errors.image.message}</p>}
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="max-w-xs max-h-32 object-cover" />
            </div>
          )}
        </div>
        <div>
          <label className="block text-white">What did you learn from this task? Please explain your key takeaways from this task (100–200 words)</label>
          <textarea
            {...register('learnings', { required: 'This field is required' })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            rows={6}
          />
          <p className="text-gray-400 text-sm mt-1">Word count: {wordCount} (100–200 words required)</p>
          {errors.learnings && <p className="text-red-500">{errors.learnings.message}</p>}
        </div>
        <div>
          <label className="block text-white">Add links to PDFs/Docs (Optional)</label>
          <input
            type="url"
            {...register('doc_links', {
              pattern: { value: /^(https?:\/\/[^\s]+)?$/, message: 'Invalid URL format' },
            })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            placeholder="https://example.com/document.pdf"
          />
          {errors.doc_links && <p className="text-red-500">{errors.doc_links.message}</p>}
        </div>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Task'}
        </Button>
      </form>
      {submissionStatus === 'success' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md text-center">
            <p className="text-cyan text-lg mb-4">Task Submission Successful!</p>
            <Button
              onClick={() => setSubmissionStatus(null)}
              className="mt-4 w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300"
            >
              Close
            </Button>
          </Card>
        </div>
      )}
      {submissionStatus === 'error' && submissionError && (
        <div className="mt-4 text-red-500">
          {submissionError}
        </div>
      )}
    </Card>
  );
}