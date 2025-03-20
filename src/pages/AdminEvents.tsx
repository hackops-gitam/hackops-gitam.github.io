import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function AdminEvents() {
  const [data, setData] = useState<any[]>([]);
  const [filterEventId, setFilterEventId] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error: fetchError } = await supabase
          .rpc('get_all_registrations');
        if (fetchError) throw fetchError;

        setData(result || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Function to delete a registration
  const handleDelete = async (registrationId: string) => {
    // Show confirmation prompt
    const confirmDelete = window.confirm('Are you sure you want to delete this registration?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registrationId);

      if (error) throw error;

      // Update local state to remove the deleted registration
      setData((prevData) => prevData.filter((item) => item.id !== registrationId));
      setSuccessMessage('Registration deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3 seconds
    } catch (err) {
      setError(err.message || 'Failed to delete registration');
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  // Extract unique event_ids and dates for filters
  const eventIds = [...new Set(data.map((item) => item.event_id))];
  const dates = [...new Set(data.map((item) => new Date(item.timestamp).toLocaleDateString()))];

  // Filter data
  const filteredData = data.filter((item) => {
    const eventMatch = !filterEventId || item.event_id === filterEventId;
    const dateMatch = !filterDate || new Date(item.timestamp).toLocaleDateString() === filterDate;
    return eventMatch && dateMatch;
  });

  if (loading) return <div className="text-white text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-4 sm:p-6">
      <Card className="p-4 sm:p-6 bg-navy-light border-2 border-cyan rounded-lg">
        <h2 className="text-2xl sm:text-3xl font-bold text-cyan text-center mb-4 sm:mb-6">Admin Events Data</h2>

        {/* Success Message */}
        {successMessage && (
          <div className="text-green-500 text-center mb-4">{successMessage}</div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value)}
            className="w-full sm:w-auto p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan focus:outline-none text-sm sm:text-base"
          >
            <option value="">All Events (by ID)</option>
            {eventIds.map((eventId) => (
              <option key={eventId} value={eventId}>{eventId}</option>
            ))}
          </select>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-auto p-2 sm:p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan focus:outline-none text-sm sm:text-base"
          >
            <option value="">All Dates</option>
            {dates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-white min-w-[600px]">
            <thead>
              <tr className="bg-navy-dark">
                <th className="border p-2 sm:p-3 text-left">Event ID</th>
                <th className="border p-2 sm:p-3 text-left">Name</th>
                <th className="border p-2 sm:p-3 text-left">Email</th>
                <th className="border p-2 sm:p-3 text-left">Phone</th>
                <th className="border p-2 sm:p-3 text-left">Year</th>
                <th className="border p-2 sm:p-3 text-left">Discipline</th>
                <th className="border p-2 sm:p-3 text-left">Program</th>
                <th className="border p-2 sm:p-3 text-left">Registration Number</th>
                <th className="border p-2 sm:p-3 text-left">Timestamp</th>
                <th className="border p-2 sm:p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-navy-light/50">
                  <td className="border p-2 sm:p-3">{row.event_id}</td>
                  <td className="border p-2 sm:p-3">{row.name}</td>
                  <td className="border p-2 sm:p-3">{row.email}</td>
                  <td className="border p-2 sm:p-3">{row.phone}</td>
                  <td className="border p-2 sm:p-3">{row.year}</td>
                  <td className="border p-2 sm:p-3">{row.discipline}</td>
                  <td className="border p-2 sm:p-3">{row.program}</td>
                  <td className="border p-2 sm:p-3">{row.registration_number}</td>
                  <td className="border p-2 sm:p-3">{new Date(row.timestamp).toLocaleString()}</td>
                  <td className="border p-2 sm:p-3">
                    <Button
                      variant="secondary"
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      onClick={() => handleDelete(row.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && <p className="text-white text-center mt-4">No data available</p>}
        </div>

        {/* Export to CSV Button */}
        <Button
          className="mt-4 sm:mt-6 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 text-sm sm:text-base"
          onClick={() => {
            const csv = [
              ['Event ID', 'Name', 'Email', 'Phone', 'Year', 'Discipline', 'Program', 'Registration Number', 'Timestamp'],
              ...filteredData.map((row) => [
                row.event_id,
                row.name,
                row.email,
                row.phone,
                row.year,
                row.discipline,
                row.program,
                row.registration_number,
                new Date(row.timestamp).toLocaleString(),
              ]),
            ].map((e) => e.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'registrations.csv';
            a.click();
          }}
        >
          Export to CSV
        </Button>
      </Card>
    </div>
  );
}