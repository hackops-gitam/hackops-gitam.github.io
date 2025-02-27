import { useState, useEffect } from 'react';
import { CTFEvent } from '../types';
import { fetchUpcomingCTFs } from '../services/ctftime';

export function useCTFs() {
  const [ctfs, setCTFs] = useState<CTFEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCTFs() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUpcomingCTFs();
        setCTFs(data);
      } catch (err) {
        setError('Failed to load CTF events. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadCTFs();
  }, []);

  return { ctfs, loading, error };
}