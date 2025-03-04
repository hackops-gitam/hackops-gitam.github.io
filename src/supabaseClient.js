import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lyrxrlxrxwqppzdaswnu.supabase.co'; // Replace with your URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnhybHhyeHdxcHB6ZGFzd251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMTEzMzgsImV4cCI6MjA1NjU4NzMzOH0.H7NH1KAugyrUi0QHWfXTe6C4P9vXzH-ZOYDnwGJRo0A'; // Replace with your Anon Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);