import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Ticket {
  id: string;
  ticket_code: string;
  ticket_type: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  event_id: string | null;
  tier_id: string | null;
  attendee_name: string | null;
  attendee_email: string | null;
  attendee_phone: string | null;
  buyer_id: string | null;
  payment_status: string;
  checked_in_at: string | null;
  qr_code_url: string | null;
}

export interface BookTicketData {
  event_id: string;
  tier_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  buyer_id?: string;
}

function generateTicketCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const timestamp = Date.now().toString(36).toUpperCase();
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TIX-${timestamp}-${random}`;
}

export function useTickets() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyTickets = useCallback(async (profileId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('buyer_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Ticket[];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEventTickets = useCallback(async (eventId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Ticket[];
    } catch (error) {
      console.error('Error fetching event tickets:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bookTicket = useCallback(async (ticketData: BookTicketData, tierPrice: number) => {
    try {
      const ticketCode = generateTicketCode();
      
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ticket_code: ticketCode,
          ticket_type: 'event',
          event_id: ticketData.event_id,
          tier_id: ticketData.tier_id,
          attendee_name: ticketData.attendee_name,
          attendee_email: ticketData.attendee_email,
          attendee_phone: ticketData.attendee_phone || null,
          buyer_id: ticketData.buyer_id || null,
          payment_status: tierPrice === 0 ? 'free' : 'paid',
          is_used: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update tickets_sold count on tier
      await supabase.rpc('increment_tickets_sold', { tier_id: ticketData.tier_id });

      return { data: data as Ticket, error: null };
    } catch (error) {
      console.error('Error booking ticket:', error);
      return { data: null, error: error as Error };
    }
  }, []);

  const getTicketWithEvent = useCallback(async (ticketCode: string) => {
    try {
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_code', ticketCode)
        .single();

      if (ticketError) throw ticketError;

      let event = null;
      let tier = null;

      if (ticket.event_id) {
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', ticket.event_id)
          .single();
        event = eventData;
      }

      if (ticket.tier_id) {
        const { data: tierData } = await supabase
          .from('ticket_tiers')
          .select('*')
          .eq('id', ticket.tier_id)
          .single();
        tier = tierData;
      }

      return { ticket: ticket as Ticket, event, tier };
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return { ticket: null, event: null, tier: null };
    }
  }, []);

  return {
    isLoading,
    fetchMyTickets,
    fetchEventTickets,
    bookTicket,
    getTicketWithEvent,
  };
}
