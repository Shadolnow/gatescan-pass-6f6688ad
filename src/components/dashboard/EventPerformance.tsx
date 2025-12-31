import { EventAnalytics } from '@/hooks/useEventAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Ticket, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventPerformanceProps {
  analytics: EventAnalytics[];
}

const EventPerformance = ({ analytics }: EventPerformanceProps) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Event Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analytics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events yet</p>
            <p className="text-xs">Create an event to see performance metrics</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {analytics.map((event) => {
              const soldPercentage = event.totalTickets > 0 
                ? (event.ticketsSold / event.totalTickets) * 100 
                : 0;
              const checkInPercentage = event.ticketsSold > 0 
                ? (event.checkedIn / event.ticketsSold) * 100 
                : 0;

              return (
                <Link 
                  key={event.eventId} 
                  to={`/dashboard/events/${event.eventId}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-sm">{event.eventTitle}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Ticket className="w-3 h-3" />
                            {event.ticketsSold} sold
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            {event.checkedIn} checked in
                          </span>
                          <span className="flex items-center gap-1 text-xs text-success">
                            <DollarSign className="w-3 h-3" />
                            ${event.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant={checkInPercentage > 50 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {checkInPercentage.toFixed(0)}% attendance
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Tickets Sold</span>
                          <span className="font-medium">{soldPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={soldPercentage} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Check-in Rate</span>
                          <span className="font-medium">{checkInPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={checkInPercentage} 
                          className="h-1.5 [&>div]:bg-accent" 
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventPerformance;
