export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  socialLink:string[];
  additionalLinks: string[];
  certificateLink: string;
  detailsLink:string;
  whatsappLink?:string;
  type: 'workshop' | 'webinar' | 'competition';
  status: 'upcoming' | 'ongoing' | 'past' | '#';
  registrationStatus: 'started' | 'notStarted';
  registrationLink?: string;
  useCustomForm?: boolean;
  image: string;
  participants: {
    current: number;
    total: number;
  };
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