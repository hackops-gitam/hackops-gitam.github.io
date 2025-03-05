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