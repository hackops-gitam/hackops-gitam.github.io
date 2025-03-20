import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { supabase } from '../supabaseClient'; // Import Supabase client

interface FormData {
  name: string;
  phone: string;
  email: string;
  year: string;
  discipline: string;
  program: string;
  termsAccepted: boolean;
  registrationNumber: string;
}

interface RegistrationFormProps {
  eventId: string;
  title: string;
  whatsappLink?: string;
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

// Allowed email domains
const allowedDomains = ['gitam.in', 'gitam.edu', 'student.gitam.edu', 'hackopsgitam.live', 'gmail.com'];

export function RegistrationForm({ eventId, title, whatsappLink }: RegistrationFormProps) {
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { termsAccepted: false },
  });
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
  const [duplicateRegistration, setDuplicateRegistration] = useState(false); // New state for duplicate registration
  const [timer, setTimer] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const discipline = watch('discipline');
  const termsAccepted = watch('termsAccepted');

  useEffect(() => {
    if (submissionStatus === 'success' && whatsappLink && timer === null) {
      setTimer(5);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(timerRef.current!);
            window.location.href = whatsappLink;
            return null;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    } else if (submissionStatus !== 'success' || !whatsappLink) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimer(null);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [submissionStatus, whatsappLink]);

  // Function to check for duplicate registration
  const checkDuplicateRegistration = async (email: string, phone: string, registrationNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', eventId)
        .or(`email.eq.${email},phone.eq.${phone},registration_number.eq.${registrationNumber}`);

      if (error) throw error;

      return data && data.length > 0; // Return true if a duplicate is found
    } catch (error) {
      console.error('Error checking duplicate registration:', error);
      return false; // Assume no duplicate in case of error to avoid blocking submission
    }
  };

  const onFormSubmit = async (data: FormData) => {
    // Validate email domain
    const emailDomain = data.email.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
      setSubmissionStatus('error');
      return; // Prevent submission and popup if domain is invalid
    }

    // Check for duplicate registration
    const isDuplicate = await checkDuplicateRegistration(data.email, data.phone, data.registrationNumber);
    if (isDuplicate) {
      setDuplicateRegistration(true);
      return; // Stop submission and show duplicate popup
    }

    // Proceed with registration if no duplicate
    try {
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnhybHhyeHdxcHB6ZGFzd251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTEzMzgsImV4cCI6MjA1NjU4NzMzOH0.H7NH1KAugyrUi0QHWfXTe6C4P9vXzH-ZOYDnwGJRo0A';
      const functionUrl = 'https://lyrxrlxrxwqppzdaswnu.functions.supabase.co/register';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          eventId,
          title,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Registration failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Registration successful:', result.message);
      setSubmissionStatus('success');
    } catch (error) {
      console.error('Error:', error.message || error);
      setSubmissionStatus('error');
    }
  };

  return (
    <Card className="max-w-lg mx-auto p-6 bg-navy-light border-cyan">
      <h2 className="text-2xl font-bold text-cyan mb-6">Event Registration</h2>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
          {submissionStatus === 'error' && !errors.email && (
            <p className="text-red-500">
              Please use an email from gitam.in, gitam.edu, student.gitam.edu, or hackopsgitam.live.
            </p>
          )}
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
            {...register('registrationNumber', { required: 'Registration Number is required' })}
            className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            placeholder="Enter your registration number"
          />
          {errors.registrationNumber && <p className="text-red-500">{errors.registrationNumber.message}</p>}
        </div>

        {/* Terms & Conditions */}
        <div>
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              {...register('termsAccepted', { required: 'You must accept the terms' })}
              className="mr-2"
            />
            I agree to the{' '}
            <span
              className="text-cyan cursor-pointer underline"
              onClick={() => setShowTermsPopup(true)}
            >
              Terms & Conditions
            </span>
          </label>
          {errors.termsAccepted && <p className="text-red-500">{errors.termsAccepted.message}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" variant="primary" disabled={!termsAccepted || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Register'}
        </Button>
      </form>

      {/* Terms Popup */}
      {showTermsPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md">
            <h3 className="text-xl font-bold text-cyan">Terms & Conditions</h3>
            <p className="text-gray-400 mt-2">
              By registering, you agree to participate respectfully and follow HackOps Club rules.
              Your data will be used solely for event purposes.
            </p>
            <Button className="mt-4" onClick={() => setShowTermsPopup(false)}>
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Duplicate Registration Popup */}
      {duplicateRegistration && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md text-center">
            <p className="text-red-500 text-lg mb-4">
              You have already registered to this event.
            </p>
            <p className="text-white mb-4">
              For any queries, please join the WhatsApp group with the button below.
            </p>
            {whatsappLink && (
              <Button
                href={whatsappLink}
                target="_blank"
                className="mt-4 mb-4 w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                onClick={() => setDuplicateRegistration(false)}
              >
                Join WhatsApp Group
              </Button>
            )}
            <Button
              onClick={() => setDuplicateRegistration(false)}
              className="mt-2 w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300"
            >
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Submission Feedback */}
      {submissionStatus === 'success' && whatsappLink && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md text-center">
            <p className="text-cyan text-lg mb-4">Registration Successful!</p>
            {timer !== null && (
              <p className="text-white mb-4">
                You will be automatically redirected to the <strong>{title}</strong> WhatsApp group in <strong>{timer}</strong> seconds.
              </p>
            )}
            {timer === null && whatsappLink && (
              <p className="text-white mb-4">
                If you haven’t been redirected, please click the button below to join the <strong>{title}</strong> WhatsApp group for the latest event updates.
              </p>
            )}
            <Button
              href={whatsappLink}
              target="_blank"
              className="mt-4 mb-4 w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
              onClick={() => setSubmissionStatus(null)}
            >
              Join WhatsApp Group
            </Button>
            <Button
              onClick={() => setSubmissionStatus(null)}
              className="mt-2 w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300"
            >
              Close
            </Button>
          </Card>
        </div>
      )}
      {submissionStatus === 'error' && !duplicateRegistration && (
        <div className="mt-4 text-red-500">
          Registration failed. Please use an email from gitam.in, gitam.edu, student.gitam.edu, or hackopsgitam.live.
        </div>
      )}
    </Card>
  );
}