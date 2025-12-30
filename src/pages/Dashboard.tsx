import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import EventCard from '@/components/events/EventCard';
import { useEvents, Event } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Calendar, 
  Ticket, 
  Users, 
  TrendingUp,
  Loader2,
  ScanLine
} from 'lucide-react';

const Dashboard = () => {
  const { profile, isLoading: authLoading } = useAuth();
  const { fetchMyEvents, isLoading } = useEvents();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      if (profile?.id) {
        const data = await fetchMyEvents(profile.id);
        setEvents(data);
      }
    };
    loadEvents();
  }, [profile?.id, fetchMyEvents]);

  const publishedEvents = events.filter(e => e.status === 'published');
  const draftEvents = events.filter(e => e.status === 'draft');
  const upcomingEvents = publishedEvents.filter(e => new Date(e.event_date) >= new Date());

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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || 'Organizer'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/scanner">
              <Button variant="outline">
                <ScanLine className="w-4 h-4 mr-2" />
                Scanner
              </Button>
            </Link>
            <Link to="/dashboard/events/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                {publishedEvents.length} published
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                events scheduled
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Draft Events
              </CardTitle>
              <Ticket className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftEvents.length}</div>
              <p className="text-xs text-muted-foreground">
                awaiting publish
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Capacity
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((sum, e) => sum + (e.capacity || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                total across events
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Events */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Events</h2>
            <Link to="/dashboard/events">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event to get started
                </p>
                <Link to="/dashboard/events/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} showManage />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
