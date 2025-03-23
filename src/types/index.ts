export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'ongoing' | 'upcoming' | 'past';
  image: string;
  venue?: string;
  timings?: string;
  FetchFromDB?: boolean;
  participants: {
    current: number;
    total: number;
  };
  registrationStatus: 'notStarted' | 'started' | 'closed';
  certificateLink?: string;
  additionalLinks?: { text: string; link: string }[];
  socialLink?: { text: string; link: string }[];
  eventImages?: string[];
  whatsappLink?: string;
  useCustomForm?: boolean;
}
export interface TeamMember{}

// types.ts
export interface CTFEvent {
  id: string;
  title: string;
  organizer: string;
  startDate: string;
  endDate: string;
  format: 'jeopardy' | 'attack-defense';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  registrationLink: string;
  description: string;
  weight: number;
  location: string;
}