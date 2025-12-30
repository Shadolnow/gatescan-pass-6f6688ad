import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { useEvents, Event, TicketTier } from '@/hooks/useEvents';
import { useTickets, BookTicketData } from '@/hooks/useTickets';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  ArrowLeft, 
  Loader2,
  CheckCircle
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { fetchEvent, fetchEventTiers } = useEvents();
  const { bookTicket, isLoading: isBooking } = useTickets();

  const [event, setEvent] = useState<Event | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      setIsLoading(true);
      const eventData = await fetchEvent(id);
      if (eventData) {
        setEvent(eventData);
        const tiersData = await fetchEventTiers(id);
        setTiers(tiersData);
      }
      setIsLoading(false);
    };
    loadEvent();
  }, [id, fetchEvent, fetchEventTiers]);

  const handleSelectTier = (tier: TicketTier) => {
    setSelectedTier(tier);
    setShowBookingForm(true);
  };

  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier || !event) return;

    const ticketData: BookTicketData = {
      event_id: event.id,
      tier_id: selectedTier.id,
      attendee_name: formData.name,
      attendee_email: formData.email,
      attendee_phone: formData.phone || undefined,
      buyer_id: profile?.id,
    };

    const { data, error } = await bookTicket(ticketData, selectedTier.price);

    if (error) {
      toast.error('Failed to book ticket');
    } else if (data) {
      setBookingSuccess(data.ticket_code);
      toast.success('Ticket booked successfully!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-12">
          <Card className="border-success bg-success/5">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold">Ticket Booked!</h2>
              <p className="text-muted-foreground">
                Your ticket has been confirmed for {event.title}
              </p>
              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">Ticket Code</p>
                <p className="text-xl font-mono font-bold text-primary">{bookingSuccess}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Show this code at the venue for entry
              </p>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => navigate('/my-tickets')} className="flex-1">
                  View My Tickets
                </Button>
                <Button onClick={() => navigate('/events')} className="flex-1">
                  Browse More Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/events')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Ticket className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {event.category && (
                  <Badge variant="outline">{event.category}</Badge>
                )}
                {event.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                )}
                {isPast && (
                  <Badge variant="secondary">Past Event</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold">{event.title}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {format(eventDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p>{format(eventDate, 'h:mm a')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{event.venue}</p>
                    {event.city && <p>{event.city}</p>}
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="pt-4">
                  <h2 className="text-xl font-semibold mb-3">About this event</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {showBookingForm && selectedTier ? (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Book Ticket</span>
                      <Button variant="ghost" size="sm" onClick={() => setShowBookingForm(false)}>
                        Change
                      </Button>
                    </CardTitle>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium">{selectedTier.name}</p>
                      <p className="text-primary font-bold">
                        {selectedTier.price === 0 ? 'Free' : `${event.currency} ${selectedTier.price.toFixed(2)}`}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBookTicket} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isBooking}>
                        {isBooking ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Ticket className="w-4 h-4 mr-2" />
                        )}
                        {selectedTier.price === 0 ? 'Get Free Ticket' : 'Book Now'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle>Select Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isPast ? (
                      <p className="text-muted-foreground text-center py-4">
                        This event has ended
                      </p>
                    ) : tiers.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">No tickets available</p>
                        {event.is_free && (
                          <Button onClick={() => {
                            setSelectedTier({
                              id: 'free',
                              event_id: event.id,
                              name: 'General Admission',
                              description: null,
                              price: 0,
                              capacity: event.capacity,
                              tickets_sold: 0,
                              is_active: true,
                              sort_order: 0,
                            });
                            setShowBookingForm(true);
                          }}>
                            Get Free Ticket
                          </Button>
                        )}
                      </div>
                    ) : (
                      tiers.map((tier) => {
                        const soldOut = tier.capacity && tier.tickets_sold >= tier.capacity;
                        return (
                          <div
                            key={tier.id}
                            className={`p-4 rounded-lg border transition-colors ${
                              soldOut
                                ? 'border-border bg-muted opacity-50'
                                : 'border-border hover:border-primary cursor-pointer'
                            }`}
                            onClick={() => !soldOut && handleSelectTier(tier)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">{tier.name}</h3>
                                {tier.description && (
                                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                                )}
                              </div>
                              <span className="font-bold text-primary">
                                {tier.price === 0 ? 'Free' : `${event.currency} ${tier.price.toFixed(2)}`}
                              </span>
                            </div>
                            {tier.capacity && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                {soldOut ? (
                                  <span className="text-destructive">Sold Out</span>
                                ) : (
                                  <span>{tier.capacity - tier.tickets_sold} remaining</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
