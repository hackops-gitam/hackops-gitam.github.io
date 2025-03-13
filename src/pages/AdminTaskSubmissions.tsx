import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function AdminTaskSubmissions() {
  const [data, setData] = useState<any[]>([]);
  const [filterTaskName, setFilterTaskName] = useState<string>('');
  const [filterBatch, setFilterBatch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: number; image_url: string | null } | null>(null); // State for delete confirmation

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error: fetchError } = await supabase
          .from('task_submissions')
          .select('*');
        if (fetchError) throw fetchError;

        setData(result || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch task submissions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateStatus = async (submissionId: number, newStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('task_submissions')
        .update({ status: newStatus })
        .eq('id', submissionId);
      if (updateError) throw updateError;

      setData(data.map((item) =>
        item.id === submissionId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const deleteSubmission = async (submissionId: number, imageUrl: string | null) => {
    try {
      // Step 1: Delete the associated image from storage if it exists
      if (imageUrl) {
        const filePath = imageUrl.split('/').pop(); // Extract the file name from the URL
        const { error: storageError } = await supabase.storage
          .from('task-submissions-images')
          .remove([`public/${filePath}`]);
        if (storageError) throw storageError;
      }

      // Step 2: Delete the submission from the task_submissions table
      const { error: deleteError } = await supabase
        .from('task_submissions')
        .delete()
        .eq('id', submissionId);
      if (deleteError) throw deleteError;

      // Step 3: Update the UI by removing the deleted submission
      setData(data.filter((item) => item.id !== submissionId));
      setDeleteConfirmation(null); // Close the confirmation dialog
    } catch (err) {
      setError(err.message || 'Failed to delete submission');
    }
  };

  const taskNames = [...new Set(data.map((item) => item.event_name))];
  const batches = [...new Set(data.map((item) => item.batch))];
  const filteredData = data.filter((item) => {
    const taskMatch = !filterTaskName || item.event_name === filterTaskName;
    const batchMatch = !filterBatch || item.batch === filterBatch;
    return taskMatch && batchMatch;
  });

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
          <table className="w-full text-white min-w-[600px]">
            <thead>
              <tr className="bg-navy-dark">
                <th className="border p-2 sm:p-3 text-left">Task Name</th>
                <th className="border p-2 sm:p-3 text-left">Name</th>
                <th className="border p-2 sm:p-3 text-left">Email</th>
                <th className="border p-2 sm:p-3 text-left">Phone</th>
                <th className="border p-2 sm:p-3 text-left">Year</th>
                <th className="border p-2 sm:p-3 text-left">Discipline</th>
                <th className="border p-2 sm:p-3 text-left">Program</th>
                <th className="border p-2 sm:p-3 text-left">Registration Number</th>
                <th className="border p-2 sm:p-3 text-left">Batch</th>
                <th className="border p-2 sm:p-3 text-left">Timestamp</th>
                <th className="border p-2 sm:p-3 text-left">Status</th>
                <th className="border p-2 sm:p-3 text-left">Image URL</th>
                <th className="border p-2 sm:p-3 text-left">Quiz Score</th>
                <th className="border p-2 sm:p-3 text-left">Actions</th> {/* New column for delete button */}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-navy-light/50">
                  <td className="border p-2 sm:p-3">{row.event_name}</td>
                  <td className="border p-2 sm:p-3">{row.name}</td>
                  <td className="border p-2 sm:p-3">{row.email}</td>
                  <td className="border p-2 sm:p-3">{row.phone}</td>
                  <td className="border p-2 sm:p-3">{row.year}</td>
                  <td className="border p-2 sm:p-3">{row.discipline}</td>
                  <td className="border p-2 sm:p-3">{row.program}</td>
                  <td className="border p-2 sm:p-3">{row.registration_number}</td>
                  <td className="border p-2 sm:p-3">{row.batch}</td>
                  <td className="border p-2 sm:p-3">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="border p-2 sm:p-3">
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
                  <td className="border p-2 sm:p-3">
                    {row.image_url ? (
                      <a href={row.image_url} target="_blank" rel="noopener noreferrer" className="text-cyan underline">
                        View Image
                      </a>
                    ) : 'No Image'}
                  </td>
                  <td className="border p-2 sm:p-3">
                    {row.quiz_score !== null ? `${row.quiz_score}%` : 'N/A'}
                  </td>
                  <td className="border p-2 sm:p-3">
                    <Button
                      variant="danger" // Assuming your Button component has a 'danger' variant for red styling
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
              ['Task Name', 'Name', 'Email', 'Phone', 'Year', 'Discipline', 'Program', 'Registration Number', 'Batch', 'Timestamp', 'Status', 'Image URL', 'Quiz Score'],
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

      {/* Delete Confirmation Modal */}
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