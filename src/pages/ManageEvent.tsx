import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { useEvents, Event, TicketTier, CreateTicketTierData } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Loader2, 
  Trash2, 
  Plus, 
  Ticket,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ManageEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    fetchEvent, 
    fetchEventTiers, 
    updateEvent, 
    deleteEvent,
    createTicketTier,
    deleteTicketTier,
  } = useEvents();

  const [event, setEvent] = useState<Event | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [newTier, setNewTier] = useState<Partial<CreateTicketTierData>>({
    name: '',
    description: '',
    price: 0,
    capacity: undefined,
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

  const handleSave = async () => {
    if (!event || !id) return;
    setIsSaving(true);

    const { error } = await updateEvent(id, {
      title: event.title,
      description: event.description || undefined,
      event_date: event.event_date,
      venue: event.venue,
      address: event.address || undefined,
      city: event.city || undefined,
      is_free: event.is_free,
      base_price: event.base_price || undefined,
      capacity: event.capacity || undefined,
      category: event.category || undefined,
      image_url: event.image_url || undefined,
    });

    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Event updated!');
    }
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!id) return;
    setIsSaving(true);
    const { error } = await updateEvent(id, { status: 'published' });
    if (error) {
      toast.error('Failed to publish event');
    } else {
      toast.success('Event published!');
      setEvent(prev => prev ? { ...prev, status: 'published' } : null);
    }
    setIsSaving(false);
  };

  const handleUnpublish = async () => {
    if (!id) return;
    setIsSaving(true);
    const { error } = await updateEvent(id, { status: 'draft' });
    if (error) {
      toast.error('Failed to unpublish event');
    } else {
      toast.success('Event unpublished');
      setEvent(prev => prev ? { ...prev, status: 'draft' } : null);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this event?')) return;
    const { error } = await deleteEvent(id);
    if (error) {
      toast.error('Failed to delete event');
    } else {
      toast.success('Event deleted');
      navigate('/dashboard');
    }
  };

  const handleAddTier = async () => {
    if (!id || !newTier.name) return;
    
    const tierData: CreateTicketTierData = {
      event_id: id,
      name: newTier.name,
      description: newTier.description,
      price: newTier.price || 0,
      capacity: newTier.capacity,
      sort_order: tiers.length,
    };

    const { data, error } = await createTicketTier(tierData);
    if (error) {
      toast.error('Failed to create tier');
    } else if (data) {
      setTiers([...tiers, data]);
      setNewTier({ name: '', description: '', price: 0, capacity: undefined });
      setShowTierDialog(false);
      toast.success('Ticket tier added!');
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;
    const { error } = await deleteTicketTier(tierId);
    if (error) {
      toast.error('Failed to delete tier');
    } else {
      setTiers(tiers.filter(t => t.id !== tierId));
      toast.success('Tier deleted');
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
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={event.title}
                    onChange={(e) => setEvent({ ...event, title: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={event.description || ''}
                    onChange={(e) => setEvent({ ...event, description: e.target.value })}
                    rows={4}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input
                      value={event.venue}
                      onChange={(e) => setEvent({ ...event, venue: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={event.city || ''}
                      onChange={(e) => setEvent({ ...event, city: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={event.category || ''}
                    onChange={(e) => setEvent({ ...event, category: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label>Free Event</Label>
                    <p className="text-sm text-muted-foreground">
                      No ticket price required
                    </p>
                  </div>
                  <Switch
                    checked={event.is_free}
                    onCheckedChange={(checked) => setEvent({ ...event, is_free: checked })}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Ticket Tiers */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Ticket Tiers
                </CardTitle>
                <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Add Ticket Tier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Tier Name *</Label>
                        <Input
                          value={newTier.name}
                          onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                          placeholder="e.g., VIP, General Admission"
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={newTier.description}
                          onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                          placeholder="What's included"
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newTier.price}
                            onChange={(e) => setNewTier({ ...newTier, price: parseFloat(e.target.value) || 0 })}
                            className="bg-secondary border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Capacity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={newTier.capacity || ''}
                            onChange={(e) => setNewTier({ ...newTier, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                            placeholder="Unlimited"
                            className="bg-secondary border-border"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddTier} className="w-full">
                        Add Tier
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {tiers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    No ticket tiers yet. Add one to start selling tickets.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{tier.name}</p>
                          {tier.description && (
                            <p className="text-sm text-muted-foreground">{tier.description}</p>
                          )}
                          <p className="text-sm">
                            <span className="text-primary font-semibold">
                              {tier.price === 0 ? 'Free' : `${event.currency} ${tier.price.toFixed(2)}`}
                            </span>
                            {tier.capacity && (
                              <span className="text-muted-foreground ml-2">
                                • {tier.tickets_sold}/{tier.capacity} sold
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTier(tier.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Event Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{format(new Date(event.event_date), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{event.venue}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.status === 'draft' ? (
                  <Button onClick={handlePublish} disabled={isSaving} className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Publish Event
                  </Button>
                ) : (
                  <Button onClick={handleUnpublish} disabled={isSaving} variant="outline" className="w-full">
                    <EyeOff className="w-4 h-4 mr-2" />
                    Unpublish
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEvent;
