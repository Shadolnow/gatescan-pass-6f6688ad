import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  venue: string;
  address: string | null;
  city: string | null;
  image_url: string | null;
  is_free: boolean;
  base_price: number | null;
  currency: string;
  capacity: number | null;
  category: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketTier {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number | null;
  tickets_sold: number;
  is_active: boolean;
  sort_order: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_date: string;
  end_date?: string;
  venue: string;
  address?: string;
  city?: string;
  image_url?: string;
  is_free?: boolean;
  base_price?: number;
  currency?: string;
  capacity?: number;
  category?: string;
}

export interface CreateTicketTierData {
  event_id: string;
  name: string;
  description?: string;
  price: number;
  capacity?: number;
  sort_order?: number;
}

export function useEvents() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchPublicEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as Event[];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyEvents = useCallback(async (profileId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Event[];
    } catch (error) {
      console.error('Error fetching my events:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEvent = useCallback(async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as Event;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }, []);

  const fetchEventTiers = useCallback(async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as TicketTier[];
    } catch (error) {
      console.error('Error fetching tiers:', error);
      return [];
    }
  }, []);

  const createEvent = useCallback(async (eventData: CreateEventData, profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          organizer_id: profileId,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as Event, error: null };
    } catch (error) {
      console.error('Error creating event:', error);
      return { data: null, error: error as Error };
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, eventData: Partial<CreateEventData> & { status?: string }) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Event, error: null };
    } catch (error) {
      console.error('Error updating event:', error);
      return { data: null, error: error as Error };
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { error: error as Error };
    }
  }, []);

  const createTicketTier = useCallback(async (tierData: CreateTicketTierData) => {
    try {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .insert(tierData)
        .select()
        .single();

      if (error) throw error;
      return { data: data as TicketTier, error: null };
    } catch (error) {
      console.error('Error creating tier:', error);
      return { data: null, error: error as Error };
    }
  }, []);

  const updateTicketTier = useCallback(async (tierId: string, tierData: Partial<CreateTicketTierData>) => {
    try {
      const { data, error } = await supabase
        .from('ticket_tiers')
        .update(tierData)
        .eq('id', tierId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as TicketTier, error: null };
    } catch (error) {
      console.error('Error updating tier:', error);
      return { data: null, error: error as Error };
    }
  }, []);

  const deleteTicketTier = useCallback(async (tierId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_tiers')
        .delete()
        .eq('id', tierId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting tier:', error);
      return { error: error as Error };
    }
  }, []);

  return {
    isLoading,
    fetchPublicEvents,
    fetchMyEvents,
    fetchEvent,
    fetchEventTiers,
    createEvent,
    updateEvent,
    deleteEvent,
    createTicketTier,
    updateTicketTier,
    deleteTicketTier,
  };
}
