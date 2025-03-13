// src/components/TaskSubmissionForm.tsx
import { useState } from 'react';
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
  const [submissionError, setSubmissionError] = useState<string | null>(null); // Track specific errors
  const discipline = watch('discipline');

  const onFormSubmit = async (data: FormData) => {
    setSubmissionError(null); // Clear previous errors
    console.log('Form data:', data); // Log form data for debugging

    try {
      // Upload image to Supabase Storage
      const file = data.image[0];
      let imageUrl = null;
      if (file) {
        console.log('Uploading image:', file.name);
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
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

      // Insert data into task_submissions table
      console.log('Inserting data into task_submissions:', {
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
      });
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
        {/* Event Name (Read-only) */}
        <div>
          <label className="block text-white">Event Name</label>
          <input
            type="text"
            value={eventName}
            readOnly
            className="w-full p-2 rounded bg-navy text-white border border-gray-800"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-white">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email */}
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

        {/* Phone */}
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

        {/* Year (Dropdown) */}
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

        {/* Discipline */}
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

        {/* Program (Conditional) */}
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

        {/* Registration Number */}
        <div>
          <label className="block text-white">Registration Number</label>
          <input
            {...register('registration_number', { required: 'Registration Number is required' })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            placeholder="Enter your registration number"
          />
          {errors.registration_number && <p className="text-red-500">{errors.registration_number.message}</p>}
        </div>

        {/* Batch (Dropdown) */}
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

        {/* Image Upload */}
        <div>
          <label className="block text-white">Upload Task Image</label>
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
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
          />
          {errors.image && <p className="text-red-500">{errors.image.message}</p>}
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="max-w-xs max-h-32 object-cover" />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Task'}
        </Button>
      </form>

      {/* Submission Feedback */}
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