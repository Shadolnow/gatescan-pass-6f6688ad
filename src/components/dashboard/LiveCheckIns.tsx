import { CheckInRecord } from '@/hooks/useEventAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LiveCheckInsProps {
  checkIns: CheckInRecord[];
}

const LiveCheckIns = ({ checkIns }: LiveCheckInsProps) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="relative">
            <UserCheck className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
          Live Check-ins
        </CardTitle>
      </CardHeader>
      <CardContent>
        {checkIns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No check-ins yet</p>
            <p className="text-xs">Check-ins will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {checkIns.map((checkIn, index) => (
              <div
                key={checkIn.id}
                className={`flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 transition-all duration-300 ${
                  index === 0 ? 'ring-2 ring-primary/30 animate-pulse-slow' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {checkIn.attendeeName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{checkIn.attendeeName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {checkIn.tierName}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {checkIn.ticketCode.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(checkIn.checkedInAt), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveCheckIns;
