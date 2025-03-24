// add_users.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://lyrxrlxrxwqppzdaswnu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnhybHhyeHdxcHB6ZGFzd251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTEzMzgsImV4cCI6MjA1NjU4NzMzOH0.H7NH1KAugyrUi0QHWfXTe6C4P9vXzH-ZOYDnwGJRo0A');

// List of users to add (from the query output)
const usersToAdd = [
    { email: 'vikramsaivarma.k2007@gmail.com', oldUserId: null },
    { email: 'nkalapal@gitam.in', oldUserId: '43621298-14a8-4bf3-a3f9-871c27da7be4' },
    { email: 'schebrol2@gitam.in', oldUserId: '2c6e9a02-9c56-451d-bd23-5996d35d2e6e' },
    { email: 'nbommise@gitam.in', oldUserId: '6e208ab1-57d4-463e-ac39-a6081788a646' },
    { email: 'ssiddoju@gitam.in', oldUserId: 'f40612c3-479e-4003-8bf6-74e26d56b3b5' },
    { email: 'skaipa2@gitam.in', oldUserId: 'fd1a1f16-ea36-4d0c-a0a9-d752a8acf49d' },
    { email: 'smogili@gitam.in', oldUserId: '16a60117-02ed-4773-935b-86935095ef09' },
    { email: 'lperla@student.gitam.edu', oldUserId: '7deacf47-1217-4c04-b609-97faa5baced6' },
  ];

// Map to store old user_id to new user_id
const userIdMap = new Map();

// Function to add a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function addUsers() {
  for (const user of usersToAdd) {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: 'defaultPassword123', // Use a secure password in production
      });

      if (error) {
        console.error(`Error adding user ${user.email}:`, error.message);
        continue;
      }

      const newUserId = data.user?.id;
      if (newUserId) {
        console.log(`Added user ${user.email} with new user_id: ${newUserId}`);
        userIdMap.set(user.email, { oldUserId: user.oldUserId, newUserId });
      }

      // Add a 1-second delay to avoid rate limiting
      await delay(4000);
    } catch (err) {
      console.error(`Unexpected error adding user ${user.email}:`, err);
    }
  }

  // Log the user_id mapping
  console.log('User ID Mapping:', Array.from(userIdMap.entries()));
}

addUsers();