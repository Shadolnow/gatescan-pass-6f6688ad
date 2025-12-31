import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import EventCard from '@/components/events/EventCard';
import { useEvents, Event } from '@/hooks/useEvents';
import { useEventAnalytics } from '@/hooks/useEventAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RevenueStats from '@/components/dashboard/RevenueStats';
import SalesChart from '@/components/dashboard/SalesChart';
import LiveCheckIns from '@/components/dashboard/LiveCheckIns';
import EventPerformance from '@/components/dashboard/EventPerformance';
import { 
  Plus, 
  Calendar, 
  Loader2,
  ScanLine,
  BarChart3,
  LayoutGrid
} from 'lucide-react';

const Dashboard = () => {
  const { profile, isLoading: authLoading } = useAuth();
  const { fetchMyEvents, isLoading } = useEvents();
  const [events, setEvents] = useState<Event[]>([]);
  
  const { 
    analytics, 
    dashboardStats, 
    salesData, 
    recentCheckIns, 
    isLoading: analyticsLoading 
  } = useEventAnalytics(profile?.id);

  useEffect(() => {
    const loadEvents = async () => {
      if (profile?.id) {
        const data = await fetchMyEvents(profile.id);
        setEvents(data);
      }
    };
    loadEvents();
  }, [profile?.id, fetchMyEvents]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || 'Organizer'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/scanner">
              <Button variant="outline" className="border-primary/30 hover:border-primary">
                <ScanLine className="w-4 h-4 mr-2" />
                Scanner
              </Button>
            </Link>
            <Link to="/dashboard/events/new">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="mb-8">
          <RevenueStats stats={dashboardStats} />
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-primary/20">
              <LayoutGrid className="w-4 h-4 mr-2" />
              My Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesChart data={salesData} />
              <LiveCheckIns checkIns={recentCheckIns} />
            </div>

            {/* Event Performance */}
            <EventPerformance analytics={analytics} />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Events</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first event to get started
                  </p>
                  <Link to="/dashboard/events/new">
                    <Button className="bg-gradient-to-r from-primary to-accent">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <EventCard key={event.id} event={event} showManage />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
