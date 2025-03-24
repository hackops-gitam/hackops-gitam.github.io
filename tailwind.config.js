/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a192f',
          light: '#112240',
        },
        cyan: '#64ffda',
        // Theme colors for TechTeamAchievements, aligned with your website
        'theme-bg': '#0a192f', // Matches navy.DEFAULT
        'theme-primary': '#64ffda', // Matches cyan
        'theme-secondary': '#4cd3b0', // A slightly darker cyan for contrast (used for hover states, tasks)
        'theme-accent': '#ff8c00', // Retain orange for quizzes, but can be changed if needed
        'theme-text': '#dfe0e1', // Matches event-description color for consistency
        'theme-error': '#ff0000', // Retain red for errors
        'theme-gold': '#ffd700',
        'theme-silver': '#c0c0c0',
        'theme-bronze': '#cd7f32',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      boxShadow: {
        'theme-primary': '0 0 10px rgba(100, 255, 218, 0.5)', // Matches cyan with glow
        'theme-secondary': '0 0 10px rgba(76, 211, 176, 0.5)', // Matches theme-secondary
        'theme-accent': '0 0 10px rgba(255, 140, 0, 0.5)', // Matches theme-accent
        'theme-gold': '0 0 10px rgba(255, 215, 0, 0.5)',
        'theme-silver': '0 0 10px rgba(192, 192, 192, 0.5)',
        'theme-bronze': '0 0 10px rgba(205, 127, 50, 0.5)',
      },
      backgroundImage: {
        'circuit-pattern': "url('https://www.transparenttextures.com/patterns/circuit-pattern.png')",
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};