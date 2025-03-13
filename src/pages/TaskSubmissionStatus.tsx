// src/pages/TaskSubmissionStatus.tsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function TaskSubmissionStatus() {
  const [email, setEmail] = useState('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="p-4 sm:p-6 bg-navy-light border-2 border-cyan rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan text-center mb-6">Task Submission Status</h2>
        <div className="mb-6">
          <label className="block text-white mb-2">Enter Your Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan focus:outline-none"
            placeholder="your@email.com"
          />
          <Button
            onClick={handleFetchSubmissions}
            variant="primary"
            className="w-full mt-4"
            disabled={loading || !email}
          >
            {loading ? 'Fetching...' : 'Check Status'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {submissions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-white min-w-[500px]">
              <thead>
                <tr className="bg-navy-dark">
                  <th className="border p-2 sm:p-3 text-left">Task Name</th>
                  <th className="border p-2 sm:p-3 text-left">Submission Date</th>
                  <th className="border p-2 sm:p-3 text-left">Status</th>
                  <th className="border p-2 sm:p-3 text-left">Image</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr key={index} className="hover:bg-navy-light/50">
                    <td className="border p-2 sm:p-3">{submission.event_name}</td>
                    <td className="border p-2 sm:p-3">{new Date(submission.timestamp).toLocaleString()}</td>
                    <td className="border p-2 sm:p-3">{submission.status}</td>
                    <td className="border p-2 sm:p-3">
                      {submission.image_url ? (
                        <a href={submission.image_url} target="_blank" rel="noopener noreferrer" className="text-cyan underline">
                          View Image
                        </a>
                      ) : 'No Image'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}