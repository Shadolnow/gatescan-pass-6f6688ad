import { Link } from 'react-router-dom';
import { Event } from '@/hooks/useEvents';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  showManage?: boolean;
}

const EventCard = ({ event, showManage = false }: EventCardProps) => {
  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();

  return (
    <Card className="overflow-hidden border-border bg-card hover:border-primary/50 transition-colors group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-secondary">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Ticket className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {event.is_featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        {isPast && (
          <Badge variant="secondary" className="absolute top-3 right-3">
            Past Event
          </Badge>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Category */}
        {event.category && (
          <Badge variant="outline" className="text-xs">
            {event.category}
          </Badge>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>

        {/* Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{format(eventDate, 'EEE, MMM d, yyyy • h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          {event.capacity && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>{event.capacity} capacity</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-2">
          {event.is_free ? (
            <span className="text-success font-semibold">Free</span>
          ) : (
            <span className="font-semibold">
              From {event.currency} {event.base_price?.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {showManage ? (
          <div className="flex gap-2 w-full">
            <Link to={`/dashboard/events/${event.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Manage
              </Button>
            </Link>
            <Link to={`/dashboard/events/${event.id}/tickets`} className="flex-1">
              <Button className="w-full">
                <Ticket className="w-4 h-4 mr-2" />
                Tickets
              </Button>
            </Link>
          </div>
        ) : (
          <Link to={`/events/${event.id}`} className="w-full">
            <Button className="w-full" disabled={isPast}>
              {isPast ? 'Event Ended' : 'Get Tickets'}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
