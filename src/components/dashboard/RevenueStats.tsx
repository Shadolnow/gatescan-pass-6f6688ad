import { DashboardStats } from '@/hooks/useEventAnalytics';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  Ticket, 
  UserCheck, 
  Calendar,
  TrendingUp,
  Percent
} from 'lucide-react';

interface RevenueStatsProps {
  stats: DashboardStats;
}

const RevenueStats = ({ stats }: RevenueStatsProps) => {
  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: '+12.5%',
    },
    {
      label: 'Tickets Sold',
      value: stats.totalTicketsSold.toLocaleString(),
      icon: Ticket,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: '+8.2%',
    },
    {
      label: 'Checked In',
      value: stats.totalCheckedIn.toLocaleString(),
      icon: UserCheck,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: 'Live',
    },
    {
      label: 'Check-in Rate',
      value: `${stats.checkInRate.toFixed(1)}%`,
      icon: Percent,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: stats.checkInRate > 50 ? 'Good' : 'Low',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card 
          key={stat.label} 
          className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'Live' ? (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      Live
                    </span>
                  ) : (
                    <span className={`flex items-center gap-1 text-xs ${
                      stat.trend.startsWith('+') ? 'text-success' : 
                      stat.trend === 'Good' ? 'text-success' : 'text-warning'
                    }`}>
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RevenueStats;
