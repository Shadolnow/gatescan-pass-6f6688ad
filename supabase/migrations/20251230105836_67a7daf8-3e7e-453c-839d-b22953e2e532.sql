-- Create function to increment tickets_sold
CREATE OR REPLACE FUNCTION public.increment_tickets_sold(tier_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ticket_tiers
  SET tickets_sold = tickets_sold + 1
  WHERE id = tier_id;
END;
$$;