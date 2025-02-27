import { CTFEvent } from '../types';

const CTFTIME_API_BASE = 'https://ctftime.org/api/v1';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function fetchUpcomingCTFs(): Promise<CTFEvent[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const threeMonthsFromNow = now + (90 * 24 * 60 * 60);
    
    const response = await fetch(
      `${CORS_PROXY}${encodeURIComponent(
        `${CTFTIME_API_BASE}/events/?limit=100&start=${now}&finish=${threeMonthsFromNow}`
      )}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch CTFs');
    }

    const data = await response.json();
    
    // Log the raw data for debugging
    console.log('Raw CTF data:', data);
    
    return data.map((ctf: any) => {
      // Log individual CTF data for debugging
      console.log('Processing CTF:', ctf.title, 'URL:', ctf.url);
      
      return {
        id: ctf.id.toString(),
        title: ctf.title,
        organizer: ctf.organizers[0].name,
        startDate: new Date(ctf.start).toISOString(),
        endDate: new Date(ctf.finish).toISOString(),
        format: ctf.format.toLowerCase().includes('attack') ? 'attack-defense' : 'jeopardy',
        difficulty: determineDifficulty(ctf.weight),
        registrationLink: ctf.url,
        description: ctf.description,
        weight: ctf.weight,
        location: ctf.onsite ? ctf.location : 'Online',
      };
    });
  } catch (error) {
    console.error('Error fetching CTFs:', error);
    throw error;
  }
}

function determineDifficulty(weight: number): 'beginner' | 'intermediate' | 'advanced' {
  if (weight < 25) return 'beginner';
  if (weight < 35) return 'intermediate';
  return 'advanced';
}