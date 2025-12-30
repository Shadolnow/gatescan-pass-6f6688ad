import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticketCode } = await req.json();

    // Input validation
    if (!ticketCode || typeof ticketCode !== 'string') {
      console.log('Invalid input: ticketCode is required');
      return new Response(
        JSON.stringify({ status: 'invalid', message: 'Ticket code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input length and format
    if (ticketCode.length > 500) {
      console.log('Invalid input: ticketCode too long');
      return new Response(
        JSON.stringify({ status: 'invalid', message: 'Invalid ticket format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize: only allow alphanumeric characters and hyphens
    const sanitizedCode = ticketCode.trim();
    if (!/^[a-zA-Z0-9-]+$/.test(sanitizedCode)) {
      console.log('Invalid input: ticketCode contains invalid characters');
      return new Response(
        JSON.stringify({ status: 'invalid', message: 'Invalid ticket format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Validating ticket: ${sanitizedCode}`);

    // Check if ticket exists with event and tier info
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select(`
        *,
        events:event_id (
          id,
          title,
          venue,
          event_date
        ),
        ticket_tiers:tier_id (
          id,
          name,
          price
        )
      `)
      .eq('ticket_code', sanitizedCode)
      .maybeSingle();

    if (fetchError) {
      console.error('Database error:', fetchError);
      return new Response(
        JSON.stringify({ status: 'error', message: 'Validation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let status: 'valid' | 'invalid' | 'already-used';
    let message: string;

    if (!ticket) {
      status = 'invalid';
      message = 'Ticket not found';
      console.log(`Ticket not found: ${sanitizedCode}`);
    } else if (ticket.is_used) {
      status = 'already-used';
      message = `Ticket was used at ${new Date(ticket.used_at).toLocaleString()}`;
      console.log(`Ticket already used: ${sanitizedCode}`);
    } else {
      // Mark ticket as used and set checked_in_at
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString(),
          checked_in_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (updateError) {
        console.error('Failed to mark ticket as used:', updateError);
        return new Response(
          JSON.stringify({ status: 'error', message: 'Validation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      status = 'valid';
      message = 'Welcome! Ticket validated successfully';
      console.log(`Ticket validated: ${sanitizedCode}`);
    }

    // Log the scan attempt
    const { error: logError } = await supabase
      .from('scan_logs')
      .insert({
        ticket_code: sanitizedCode,
        status: status,
      });

    if (logError) {
      console.error('Failed to log scan:', logError);
    }

    // Extract event and tier info
    const eventName = ticket?.events?.title || null;
    const tierName = ticket?.ticket_tiers?.name || null;
    const attendeeName = ticket?.attendee_name || null;

    return new Response(
      JSON.stringify({ 
        status, 
        message,
        ticketType: ticket?.ticket_type || tierName || null,
        eventName,
        tierName,
        attendeeName,
        eventDate: ticket?.events?.event_date || null,
        venue: ticket?.events?.venue || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-ticket function:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
