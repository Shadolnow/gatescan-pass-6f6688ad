import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  totalTickets: number;
  ticketsSold: number;
  checkedIn: number;
  revenue: number;
  recentCheckIns: CheckInRecord[];
}

export interface CheckInRecord {
  id: string;
  ticketCode: string;
  attendeeName: string;
  tierName: string;
  checkedInAt: string;
}

export interface SalesDataPoint {
  date: string;
  tickets: number;
  revenue: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalTicketsSold: number;
  totalCheckedIn: number;
  totalEvents: number;
  checkInRate: number;
}

export const useEventAnalytics = (profileId: string | undefined) => {
  const [analytics, setAnalytics] = useState<EventAnalytics[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalCheckedIn: 0,
    totalEvents: 0,
    checkInRate: 0,
  });
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!profileId) return;

    try {
      // Fetch organizer's events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title')
        .eq('organizer_id', profileId);

      if (eventsError) throw eventsError;
      if (!events || events.length === 0) {
        setIsLoading(false);
        return;
      }

      const eventIds = events.map(e => e.id);

      // Fetch all tickets for these events
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_code,
          attendee_name,
          is_used,
          checked_in_at,
          created_at,
          event_id,
          tier_id,
          payment_status
        `)
        .in('event_id', eventIds);

      if (ticketsError) throw ticketsError;

      // Fetch ticket tiers for pricing
      const { data: tiers, error: tiersError } = await supabase
        .from('ticket_tiers')
        .select('id, name, price, event_id')
        .in('event_id', eventIds);

      if (tiersError) throw tiersError;

      // Calculate analytics per event
      const eventAnalytics: EventAnalytics[] = events.map(event => {
        const eventTickets = tickets?.filter(t => t.event_id === event.id) || [];
        const eventTiers = tiers?.filter(t => t.event_id === event.id) || [];
        
        const soldTickets = eventTickets.filter(t => t.payment_status === 'paid' || t.payment_status === 'free');
        const checkedInTickets = eventTickets.filter(t => t.is_used);
        
        const revenue = soldTickets.reduce((sum, ticket) => {
          const tier = eventTiers.find(t => t.id === ticket.tier_id);
          return sum + (tier?.price || 0);
        }, 0);

        const recentCheckIns = checkedInTickets
          .filter(t => t.checked_in_at)
          .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime())
          .slice(0, 5)
          .map(t => ({
            id: t.id,
            ticketCode: t.ticket_code,
            attendeeName: t.attendee_name || 'Guest',
            tierName: eventTiers.find(tier => tier.id === t.tier_id)?.name || 'General',
            checkedInAt: t.checked_in_at!,
          }));

        return {
          eventId: event.id,
          eventTitle: event.title,
          totalTickets: eventTiers.reduce((sum, t) => sum + (t.price > 0 ? 100 : 50), 0), // Placeholder capacity
          ticketsSold: soldTickets.length,
          checkedIn: checkedInTickets.length,
          revenue,
          recentCheckIns,
        };
      });

      setAnalytics(eventAnalytics);

      // Calculate dashboard stats
      const totalRevenue = eventAnalytics.reduce((sum, e) => sum + e.revenue, 0);
      const totalTicketsSold = eventAnalytics.reduce((sum, e) => sum + e.ticketsSold, 0);
      const totalCheckedIn = eventAnalytics.reduce((sum, e) => sum + e.checkedIn, 0);
      const checkInRate = totalTicketsSold > 0 ? (totalCheckedIn / totalTicketsSold) * 100 : 0;

      setDashboardStats({
        totalRevenue,
        totalTicketsSold,
        totalCheckedIn,
        totalEvents: events.length,
        checkInRate,
      });

      // Calculate sales data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const salesByDay = last7Days.map(date => {
        const dayTickets = tickets?.filter(t => 
          t.created_at.startsWith(date) && 
          (t.payment_status === 'paid' || t.payment_status === 'free')
        ) || [];
        
        const dayRevenue = dayTickets.reduce((sum, ticket) => {
          const tier = tiers?.find(t => t.id === ticket.tier_id);
          return sum + (tier?.price || 0);
        }, 0);

        return {
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          tickets: dayTickets.length,
          revenue: dayRevenue,
        };
      });

      setSalesData(salesByDay);

      // Get recent check-ins across all events
      const allRecentCheckIns = eventAnalytics
        .flatMap(e => e.recentCheckIns)
        .sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime())
        .slice(0, 10);

      setRecentCheckIns(allRecentCheckIns);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  // Set up realtime subscription for live check-ins
  useEffect(() => {
    if (!profileId) return;

    fetchAnalytics();

    // Subscribe to ticket updates (check-ins)
    const channel = supabase
      .channel('dashboard-analytics')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
        },
        (payload) => {
          // Refetch analytics when a ticket is updated (checked in)
          if (payload.new && (payload.new as any).is_used) {
            fetchAnalytics();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets',
        },
        () => {
          // Refetch when new tickets are purchased
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, fetchAnalytics]);

  return {
    analytics,
    dashboardStats,
    salesData,
    recentCheckIns,
    isLoading,
    refetch: fetchAnalytics,
  };
};
