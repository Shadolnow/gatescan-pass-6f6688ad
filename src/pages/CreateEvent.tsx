import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import { useEvents, CreateEventData } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Calendar, MapPin, DollarSign } from 'lucide-react';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createEvent } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    venue: '',
    address: '',
    city: '',
    image_url: '',
    is_free: true,
    base_price: 0,
    currency: 'USD',
    capacity: undefined,
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    if (!profile?.id) {
      toast.error('Please sign in to create an event');
      return;
    }

    setIsLoading(true);

    const eventData = {
      ...formData,
      event_date: new Date(formData.event_date).toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
    };

    const { data, error } = await createEvent(eventData, profile.id);

    if (error) {
      toast.error('Failed to create event');
      setIsLoading(false);
      return;
    }

    if (data && publish) {
      // Publish immediately
      const { updateEvent } = useEvents();
      await updateEvent(data.id, { status: 'published' });
    }

    toast.success(`Event ${publish ? 'published' : 'created as draft'}!`);
    navigate(`/dashboard/events/${data?.id}`);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Basic Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                    required
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={4}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Music, Conference, Workshop"
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Start Date & Time *</Label>
                    <Input
                      id="event_date"
                      type="datetime-local"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date & Time</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="venue">Venue Name *</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Enter venue name"
                    required
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City name"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Maximum attendees"
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Pricing
                </h3>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <Label htmlFor="is_free" className="text-base">Free Event</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle off to set ticket prices
                    </p>
                  </div>
                  <Switch
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                  />
                </div>

                {!formData.is_free && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="base_price">Base Price</Label>
                      <Input
                        id="base_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.base_price}
                        onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        placeholder="USD"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="space-y-2">
                <Label htmlFor="image_url">Event Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="bg-secondary border-border"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Publish Event
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;
