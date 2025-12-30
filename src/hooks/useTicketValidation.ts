import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScanStatus } from '@/components/ScanResult';
import { ScanRecord } from '@/components/ScanHistory';

export interface ValidationResult {
  status: ScanStatus;
  message: string;
  ticketType: string | null;
  eventName: string | null;
  tierName: string | null;
  attendeeName: string | null;
  eventDate: string | null;
  venue: string | null;
}

export const useTicketValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateTicket = useCallback(async (ticketCode: string): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-ticket', {
        body: { ticketCode }
      });

      if (error) {
        console.error('Validation error:', error);
        return {
          status: 'invalid',
          message: 'Validation failed. Please try again.',
          ticketType: null,
          eventName: null,
          tierName: null,
          attendeeName: null,
          eventDate: null,
          venue: null
        };
      }

      return {
        status: data.status as ScanStatus,
        message: data.message,
        ticketType: data.ticketType,
        eventName: data.eventName,
        tierName: data.tierName,
        attendeeName: data.attendeeName,
        eventDate: data.eventDate,
        venue: data.venue
      };
    } catch (error) {
      console.error('Network error:', error);
      return {
        status: 'invalid',
        message: 'Network error. Please check your connection.',
        ticketType: null,
        eventName: null,
        tierName: null,
        attendeeName: null,
        eventDate: null,
        venue: null
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const fetchScanHistory = useCallback(async (): Promise<ScanRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('scan_logs')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch scan history:', error);
        return [];
      }

      return data.map(log => ({
        id: log.id,
        ticketData: log.ticket_code,
        status: log.status as ScanStatus,
        timestamp: new Date(log.scanned_at)
      }));
    } catch (error) {
      console.error('Error fetching scan history:', error);
      return [];
    }
  }, []);

  return {
    validateTicket,
    fetchScanHistory,
    isValidating
  };
};
