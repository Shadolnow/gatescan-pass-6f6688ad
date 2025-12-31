-- Enable realtime for tickets table to support live check-in updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;