import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Sanitize event name for table name (remove special characters, limit length)
function sanitizeTableName(eventName: string): string {
  return eventName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .substring(0, 50); // Limit to 50 characters to fit PostgreSQL identifier limits
}

const supabaseUrl = 'https://lyrxrlxrxwqppzdaswnu.supabase.co'; // Your project URL
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnhybHhyeHdxcHB6ZGFzd251Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTAxMTMzOCwiZXhwIjoyMDU2NTg3MzM4fQ.oxeoPugpai79SIFoI2cI1pJHcpSKBngP5k6ecDmckek'; // Your Service Role Key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Allowed origins for CORS
const allowedOrigins = ['http://localhost:5173', 'https://hackopsgitam.live'];

serve(async (req) => {
  const origin = req.headers.get('Origin') || '';
  if (!allowedOrigins.includes(origin) && req.method !== 'OPTIONS') {
    return new Response('CORS policy violation', { status: 403 });
  }

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Handle POST request
  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const { eventId, name, email, phone, year, discipline, program, registrationNumber, title } = data;

      if (!eventId || !title) {
        throw new Error('eventId and title are required');
      }

      // Sanitize event name for table name
      const sanitizedEventName = sanitizeTableName(title);
      const tableName = `registrations_event_${eventId}_${sanitizedEventName}`;

      // Check if table exists, create if it doesn’t
      const createTableQuery = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' AND tablename = '${tableName}'
          ) THEN
            EXECUTE FORMAT('CREATE TABLE public.${tableName} (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              event_id TEXT NOT NULL,
              event_name TEXT NOT NULL,
              name TEXT NOT NULL,
              email TEXT NOT NULL,
              phone TEXT NOT NULL,
              year TEXT NOT NULL,
              discipline TEXT NOT NULL,
              program TEXT NOT NULL,
              registration_number TEXT NOT NULL,
              timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )');
          END IF;
        END $$;
      `;
      await supabase.rpc('execute_raw_sql', { sql: createTableQuery });

      // Insert data into the dynamic table
      const { error: dbError } = await supabase.from(tableName).insert([
        { 
          event_id: eventId, 
          event_name: title, 
          name, 
          email, 
          phone, 
          year, 
          discipline, 
          program, 
          registration_number: registrationNumber, 
          timestamp: new Date().toISOString() 
        }
      ]);
      if (dbError) throw dbError;

      return new Response(JSON.stringify({ message: 'Registration successful' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
        },
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ message: 'Registration failed', error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
        },
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});