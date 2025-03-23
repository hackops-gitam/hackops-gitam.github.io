// events.ts
import { Event } from '../types';

export const events: Event[] = [
  {
    id: 'CTF',
    title: "Capture The Flag [ CTF ] | Pramana'25",
    description: "A Capture The Flag (CTF) event is a cybersecurity competition where participants solve challenges related to hacking, cryptography, forensics, and reverse engineering to capture flags hidden in different tasks. The event tests participants' skills in penetration testing, problem-solving, and real-world security scenarios.",
    date: '2025-02-06',
    type: 'competition',
    venue: 'B-819 , GITAM UNIVERSITY',
    timings: '9:00 AM - 3:30 PM',
    status: 'past',
    socialLink: [
      { link: "https://www.instagram.com/p/DGDj7iyTMq8/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", text: "Instagram" },
      { link: "https://linkedin.com/company/hackops-gitam", text: "LinkedIn" }
    ],
    registrationStatus: 'started',
    registrationLink: 'https://app.formbricks.com/s/e2gfuya2s9yzwvlj85kp8pdk',
    detailsLink: 'https://www.pramanafest.in/technical/capture-the-flag',
    image: 'https://res.cloudinary.com/dae56bvjp/image/upload/v1739362882/1738399004736_ygsihx.jpg',
    certificateLink: 'https://drive.google.com/drive/folders/10YWdU2nYA4nCnwrNBy8cTRfOTwGAIqg6?usp=sharing',
    additionalLinks: [
      { link: "https://drive.google.com/file/d/1eewDhaJS1VCd4gkBq9FzXhOaCQl8ULVr/view?usp=sharing", text: "Download Event Report" },
      { link: "https://drive.google.com/drive/folders/1an7CNZLdBRxL4OSvvDBLBayzJuQoz_mq?usp=sharing", text: "View Event Pictures [ ALL ]" }
    ],
    eventImages: [
      'https://i.imgur.com/eAgyxYV.jpeg',
      'https://i.imgur.com/dGGx7sY.jpeg',
      'https://i.imgur.com/HaXNoTE.jpeg',
      'https://i.imgur.com/YoLlYNa.jpeg',
      'https://i.imgur.com/9480uzE.jpeg',
      'https://i.imgur.com/eAgyxYV.jpeg',
      'https://i.imgur.com/tZChUJ8.jpeg',
      'https://i.imgur.com/pnLqB8I.jpeg',
      'https://i.imgur.com/4JYrpAW.jpeg'
    ],
    participants: {
      current: 44,
      total: 60
    },
    FetchFromDB: false // Fetch from DB
  },
  {
    id: '1',
    title: 'Recruitments AY 2025-26',
    description: 'Join the revolution where hacking meets honor! We are on the hunt for passionate, driven individuals ready to lead, learn, and dominate the world of cybersecurity. Dont miss the chance to be part of GITAMs premier tech club. Apply now and unleash your potential!',
    date: '2025-01-01',
    type: 'workshop',
    status: 'past',
    registrationStatus: 'started',
    certificateLink: "hackopsgitam.live",
    eventImages: [],
    registrationLink: 'https://forms.zohopublic.in/HackOps-GITAM/form/HackOpsRecruitmentsAY2425/formperma/IN8EuQ3ZsIqPZrpYcNYXThrrPQHiBtcVuzHG90yxkOA',
    detailsLink: '#',
    image: 'https://res.cloudinary.com/dae56bvjp/image/upload/t_Banner 16:9/v1735665167/Final_Insta_ula6zf.png',
    participants: {
      current: 73,
      total: 100
    },
    FetchFromDB: false // Use static value
  },
  {
    id: 'Linux Masterclass',
    title: 'Linux Masterclass',
    description: 'Intensive 2-day bootcamp covering Linux fundamentals.',
    date: '2025-03-26',
    certificateLink: "#",
    eventImages: [],
    type: 'workshop',
    detailsLink: "#",
    status: 'upgoing',
    registrationLink: '#',
    registrationStatus: 'started',
    useCustomForm: true,
    image: 'https://assets.techrepublic.com/uploads/2021/08/tux-new.jpg',
    participants: {
      current: 0,
      total: 50
    },
    FetchFromDB: true // Fetch from DB
  },
  {
    id: 'Wifi Hacking',
    title: 'Wifi Hacking 101',
    description: 'Expert-led session on securing wifi networks.',
    date: '2026-03-27',
    type: 'workshop',
    whatsappLink: 'https://chat.whatsapp.com/G9RNGrXFIqC4nfhniKNr8f',
    eventImages: [],
    status: 'upcoming',
    certificateLink: "#",
    registrationStatus: 'started',
    useCustomForm: true,
    registrationLink: 'https://forms.example.com/network-security-webinar',
    detailsLink: '#',
    image: 'https://res.cloudinary.com/dae56bvjp/image/upload/v1742497165/WIFI_1_mlzley.png',
    participants: {
      current: 0,
      total: 65
    },
    FetchFromDB:true // Use static value
  }
];