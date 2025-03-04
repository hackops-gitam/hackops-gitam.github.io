import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';

const supabaseUrl = 'https://lyrxrlxrxwqppzdaswnu.supabase.co'; // Your project URL
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnhybHhyeHdxcHB6ZGFzd251Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTAxMTMzOCwiZXhwIjoyMDU2NTg3MzM4fQ.oxeoPugpai79SIFoI2cI1pJHcpSKBngP5k6ecDmckek'; // Replace with your Service Role Key
const mailgunApiKey = '7d6e62760fd5ce741c2f83a623efd94c-e298dd8e-72d43344';
const mailgunDomain = 'hackopsgitam.live';

const allowedOrigins = ['http://localhost:5173', 'https://hackopsgitam.live'];

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const origin = req.headers.get('Origin') || '';
  if (!allowedOrigins.includes(origin)) {
    return new Response('CORS policy violation', { status: 403 });
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info', // Added x-client-info
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (req.method === 'POST') {
    try {
      const data = await req.json();
      const { eventId, name, email, phone, year, discipline, program } = data;

      const auth = encode(`api:${mailgunApiKey}`);
      const emailResponse = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          from: 'HackOps Club <no-reply@hackopsgitam.live>',
          to: email,
          subject: 'Registration Confirmation',
          text: `Thank you for registering for Event ${eventId}!\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nYear: ${year}\nDiscipline: ${discipline}\nProgram: ${program}`,
        }).toString(),
      });
      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        throw new Error(`Mailgun failed: ${errorText}`);
      }

      const { error: dbError } = await supabase.from('registrations').insert([{ event_id: eventId, name, email, phone, year, discipline, program, timestamp: new Date().toISOString() }]);
      if (dbError) throw dbError;

      return new Response(JSON.stringify({ message: 'Registration successful' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info', // Added x-client-info
        },
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ message: 'Registration failed', error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info', // Added x-client-info
        },
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});