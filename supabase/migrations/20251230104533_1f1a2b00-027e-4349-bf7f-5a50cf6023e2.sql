-- Create tickets table for storing valid tickets
CREATE TABLE public.tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_code TEXT NOT NULL UNIQUE,
    ticket_type TEXT NOT NULL DEFAULT 'general',
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policy for reading tickets (public access for validation)
CREATE POLICY "Anyone can read tickets for validation" 
ON public.tickets 
FOR SELECT 
USING (true);

-- Create scan_logs table for audit trail
CREATE TABLE public.scan_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_code TEXT NOT NULL,
    status TEXT NOT NULL,
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scan_logs
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserts to scan_logs (for logging)
CREATE POLICY "Anyone can insert scan logs" 
ON public.scan_logs 
FOR INSERT 
WITH CHECK (true);

-- Allow reading scan logs (for history display)
CREATE POLICY "Anyone can read scan logs" 
ON public.scan_logs 
FOR SELECT 
USING (true);

-- Insert sample tickets for demo purposes
INSERT INTO public.tickets (ticket_code, ticket_type) VALUES
    ('TICKET-001-ABC123', 'general'),
    ('TICKET-002-DEF456', 'general'),
    ('TICKET-003-GHI789', 'general'),
    ('VIP-PASS-2024', 'vip'),
    ('GENERAL-ADMISSION-100', 'general');