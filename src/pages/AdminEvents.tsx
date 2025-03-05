// src/pages/AdminEvents.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function AdminEvents() {
  const [data, setData] = useState<any[]>([]);
  const [filterEventId, setFilterEventId] = useState<string>(''); // Filter by event_id
  const [filterDate, setFilterDate] = useState<string>(''); // Filter by date (timestamp)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Extract unique event_ids and dates for filters
  const eventIds = [...new Set(data.map((item) => item.event_id))];
  const dates = [...new Set(data.map((item) => new Date(item.timestamp).toLocaleDateString()))];

  // Filter data
  const filteredData = data.filter((item) => {
    const eventMatch = !filterEventId || item.event_id === filterEventId;
    const dateMatch = !filterDate || new Date(item.timestamp).toLocaleDateString() === filterDate;
    return eventMatch && dateMatch;
  });

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <Card className="p-6 bg-navy-light border-cyan">
        <h2 className="text-2xl font-bold text-cyan mb-4">Admin Events Data</h2>
        <div className="mb-4 space-x-4">
          <select
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value)}
            className="p-2 rounded bg-navy text-white border border-gray-800"
          >
            <option value="">All Events (by ID)</option>
            {eventIds.map((eventId) => (
              <option key={eventId} value={eventId}>{eventId}</option>
            ))}
          </select>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 rounded bg-navy text-white border border-gray-800"
          >
            <option value="">All Dates</option>
            {dates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
        <table className="w-full text-white">
          <thead>
            <tr>
              <th className="border p-2">Event ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Year</th>
              <th className="border p-2">Discipline</th>
              <th className="border p-2">Program</th>
              <th className="border p-2">Registration Number</th>
              <th className="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td className="border p-2">{row.event_id}</td>
                <td className="border p-2">{row.name}</td>
                <td className="border p-2">{row.email}</td>
                <td className="border p-2">{row.phone}</td>
                <td className="border p-2">{row.year}</td>
                <td className="border p-2">{row.discipline}</td>
                <td className="border p-2">{row.program}</td>
                <td className="border p-2">{row.registration_number}</td>
                <td className="border p-2">{new Date(row.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && <p className="text-white mt-4">No data available</p>}
        <Button
          className="mt-4"
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