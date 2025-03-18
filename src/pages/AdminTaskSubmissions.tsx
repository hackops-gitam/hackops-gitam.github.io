import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Submission {
  id: number;
  event_name: string;
  name: string;
  email: string;
  phone: string;
  year: string;
  discipline: string;
  program: string;
  registration_number: string;
  timestamp: string;
  batch: string;
  image_url: string | null;
  quiz_score: number | null;
  learnings: string | null;
  doc_links: string | null;
  status: string;
}

export function AdminTaskSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterTaskName, setFilterTaskName] = useState<string>('');
  const [filterBatch, setFilterBatch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: number; image_url: string | null } | null>(null);
  const [selectedLearning, setSelectedLearning] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data: result, error: fetchError } = await supabase
          .from('task_submissions')
          .select('*')
          .order('timestamp', { ascending: false });
        if (fetchError) throw fetchError;

        console.log('Fetched task submissions:', result);
        setSubmissions(result || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch task submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const updateStatus = async (submissionId: number, newStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('task_submissions')
        .update({ status: newStatus })
        .eq('id', submissionId);
      if (updateError) throw updateError;

      setSubmissions(submissions.map((item) =>
        item.id === submissionId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const deleteSubmission = async (submissionId: number, imageUrl: string | null) => {
    try {
      if (imageUrl) {
        const filePath = imageUrl.split('/').pop();
        const { error: storageError } = await supabase.storage
          .from('task-submissions-images')
          .remove([`public/${filePath}`]);
        if (storageError) throw storageError;
      }

      const { error: deleteError } = await supabase
        .from('task_submissions')
        .delete()
        .eq('id', submissionId);
      if (deleteError) throw deleteError;

      setSubmissions(submissions.filter((item) => item.id !== submissionId));
      setDeleteConfirmation(null);
    } catch (err) {
      setError(err.message || 'Failed to delete submission');
    }
  };

  const taskNames = [...new Set(submissions.map((item) => item.event_name))];
  const batches = [...new Set(submissions.map((item) => item.batch))];
  const filteredData = submissions.filter((item) => {
    const taskMatch = !filterTaskName || item.event_name === filterTaskName;
    const batchMatch = !filterBatch || item.batch === filterBatch;
    return taskMatch && batchMatch;
  });

  const handleViewLearning = (learnings: string | null) => {
    setSelectedLearning(learnings || 'No learnings provided.');
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  if (loading) return <div className="text-white text-center p-6">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="p-4 sm:p-6 bg-navy-light border-2 border-cyan rounded-lg shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan text-center mb-6">Admin Task Submissions</h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            value={filterTaskName}
            onChange={(e) => setFilterTaskName(e.target.value)}
            className="w-full sm:w-auto p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan focus:outline-none text-sm sm:text-base"
          >
            <option value="">All Tasks</option>
            {taskNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="w-full sm:w-auto p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan focus:outline-none text-sm sm:text-base"
          >
            <option value="">All Batches</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>{batch}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-white min-w-[900px]">
            <thead>
              <tr className="bg-navy-dark">
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Task Name</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Name</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Email</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Phone</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Year</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Discipline</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Program</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Reg. Number</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Batch</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Submission Date</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Status</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Image</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Doc Links</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Learnings</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Quiz Score</th>
                <th className="border p-2 sm:p-3 text-left text-sm sm:text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-navy-light/50">
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{row.event_name}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{row.name}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{row.email}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{row.phone}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{row.year}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{row.discipline}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{row.program}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{row.registration_number}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{row.batch}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">
                    <select
                      value={row.status}
                      onChange={(e) => updateStatus(row.id, e.target.value)}
                      className="p-1 rounded bg-navy text-white border border-gray-800 focus:border-cyan focus:outline-none"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">
                    {row.image_url ? (
                      <a href={row.image_url} target="_blank" rel="noopener noreferrer" className="text-cyan underline">
                        View Image
                      </a>
                    ) : 'No Image'}
                  </td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">
                    {row.doc_links ? (
                      row.doc_links.split(',').length > 1 ? (
                        <span>
                          {row.doc_links.split(',')[0].trim()}...{' '}
                          <a href={row.doc_links} target="_blank" rel="noopener noreferrer" className="text-cyan underline">
                            View All
                          </a>
                        </span>
                      ) : (
                        <a href={row.doc_links.trim()} target="_blank" rel="noopener noreferrer" className="text-cyan underline">
                          View
                        </a>
                      )
                    ) : 'No Docs'}
                  </td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">
                    {row.learnings ? (
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs sm:text-sm"
                        onClick={() => handleViewLearning(row.learnings)}
                      >
                        View
                      </Button>
                    ) : 'N/A'}
                  </td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">
                    {row.quiz_score !== null ? `${row.quiz_score}%` : 'N/A'}
                  </td>
                  <td className="border p-2 sm:p-3 text-sm sm:text-base">
                    <Button
                      variant="danger"
                      className="px-3 py-1 text-sm"
                      onClick={() => setDeleteConfirmation({ id: row.id, image_url: row.image_url })}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && <p className="text-white text-center mt-4">No task submissions available</p>}
        </div>
        <Button
          className="mt-6 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 text-sm sm:text-base"
          onClick={() => {
            const csv = [
              [
                'Task Name', 'Name', 'Email', 'Phone', 'Year', 'Discipline', 'Program',
                'Registration Number', 'Batch', 'Timestamp', 'Status', 'Image URL',
                'Learnings', 'Doc Links', 'Quiz Score',
              ],
              ...filteredData.map((row) => [
                row.event_name,
                row.name,
                row.email,
                row.phone,
                row.year,
                row.discipline,
                row.program,
                row.registration_number,
                row.batch,
                new Date(row.timestamp).toLocaleString(),
                row.status,
                row.image_url || '',
                row.learnings || '',
                row.doc_links || '',
                row.quiz_score !== null ? `${row.quiz_score}%` : 'N/A',
              ]),
            ].map((e) => e.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'task_submissions.csv';
            a.click();
          }}
        >
          Export to CSV
        </Button>
      </Card>

      {/* Glassmorphism Pop-up for Learnings (Improved Responsive Design) */}
      <AnimatePresence>
        {selectedLearning && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4"
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
              className="p-4 sm:p-6 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-cyan mb-4">Learnings</h3>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 whitespace-pre-wrap break-words">
                {selectedLearning}
              </p>
              <Button
                variant="secondary"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base md:text-lg"
                onClick={() => setSelectedLearning(null)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Popup */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="p-6 max-w-sm w-full rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
            <h3 className="text-xl font-semibold text-red-400 mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to delete this submission? This action cannot be undone.
            </p>
            <div className="flex justify-between gap-4">
              <Button
                variant="danger"
                className="w-full py-2 text-sm"
                onClick={() => deleteSubmission(deleteConfirmation.id, deleteConfirmation.image_url)}
              >
                Yes, Delete
              </Button>
              <Button
                variant="secondary"
                className="w-full py-2 text-sm"
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}