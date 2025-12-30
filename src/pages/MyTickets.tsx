import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { useTickets, Ticket } from '@/hooks/useTickets';
import { useEvents, Event } from '@/hooks/useEvents';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Ticket as TicketIcon, Calendar, MapPin, Loader2, QrCode } from 'lucide-react';

const MyTickets = () => {
  const { profile, isLoading: authLoading } = useAuth();
  const { fetchMyTickets, isLoading } = useTickets();
  const { fetchEvent } = useEvents();
  const [tickets, setTickets] = useState<(Ticket & { event?: Event })[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      if (profile?.id) {
        const ticketData = await fetchMyTickets(profile.id);
        
        // Fetch event details for each ticket
        const ticketsWithEvents = await Promise.all(
          ticketData.map(async (ticket) => {
            if (ticket.event_id) {
              const event = await fetchEvent(ticket.event_id);
              return { ...ticket, event: event || undefined };
            }
            return ticket;
          })
        );
        
        setTickets(ticketsWithEvents);
      }
    };
    loadTickets();
  }, [profile?.id, fetchMyTickets, fetchEvent]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <TicketIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Sign in to view your tickets</h1>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center">
              <TicketIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
              <p className="text-muted-foreground mb-4">
                Browse events and book your first ticket
              </p>
              <Link to="/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const isUsed = ticket.is_used || ticket.checked_in_at;
              const eventDate = ticket.event?.event_date ? new Date(ticket.event.event_date) : null;
              const isPast = eventDate && eventDate < new Date();

              return (
                <Card 
                  key={ticket.id} 
                  className={`border-border bg-card overflow-hidden ${isUsed ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Left side - Event info */}
                      <div className="flex-1 p-6 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {ticket.event?.title || 'Event Ticket'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {ticket.attendee_name}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {isUsed && (
                              <Badge variant="secondary">Used</Badge>
                            )}
                            {isPast && !isUsed && (
                              <Badge variant="outline">Expired</Badge>
                            )}
                            <Badge 
                              variant={ticket.payment_status === 'paid' ? 'default' : 'secondary'}
                            >
                              {ticket.payment_status === 'free' ? 'Free' : ticket.payment_status}
                            </Badge>
                          </div>
                        </div>

                        {ticket.event && (
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(ticket.event.event_date), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{ticket.event.venue}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right side - Ticket code */}
                      <div className="border-t sm:border-t-0 sm:border-l border-border border-dashed p-6 flex flex-col items-center justify-center bg-secondary/50 min-w-[180px]">
                        <QrCode className="w-8 h-8 text-primary mb-2" />
                        <p className="text-xs text-muted-foreground mb-1">Ticket Code</p>
                        <p className="font-mono font-bold text-sm text-center break-all">
                          {ticket.ticket_code}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
