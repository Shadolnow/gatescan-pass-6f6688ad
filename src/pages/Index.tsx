import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  ScanLine, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const Index = () => {
  const features = [
    {
      icon: Ticket,
      title: 'Flexible Ticketing',
      description: 'Create unlimited ticket tiers with custom pricing, capacity limits, and early bird specials.'
    },
    {
      icon: ScanLine,
      title: 'Instant Validation',
      description: 'Scan and validate tickets in milliseconds with our powerful GATESCAN technology.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with real-time fraud detection and duplicate prevention.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Handle thousands of check-ins per minute with zero downtime guarantee.'
    },
    {
      icon: Users,
      title: 'Attendee Management',
      description: 'Track attendance, manage guest lists, and communicate with your audience.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Monitor sales, check-ins, and revenue with beautiful live dashboards.'
    },
  ];

  const stats = [
    { value: '50K+', label: 'Events Created' },
    { value: '2M+', label: 'Tickets Issued' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<100ms', label: 'Scan Speed' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-secondary border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">The Future of Event Ticketing</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="gradient-text">Digital Tickets</span>
              <br />
              <span className="text-foreground">For The Future</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Create, sell, and validate event tickets with our powerful platform. 
              From intimate gatherings to massive festivals, we've got you covered.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard/create">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-glow">
                  Create Event
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-border hover:bg-secondary">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating Ticket Mockup */}
          <div className="mt-20 flex justify-center">
            <div className="relative float">
              <div className="w-80 h-48 glass rounded-2xl p-6 gradient-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">TICKET</p>
                    <p className="text-lg font-bold text-foreground">Summer Festival</p>
                  </div>
                  <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                    <ScanLine className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="flex gap-8 text-sm">
                  <div>
                    <p className="text-muted-foreground">DATE</p>
                    <p className="text-foreground font-medium">Aug 15, 2025</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SEAT</p>
                    <p className="text-foreground font-medium">VIP-A12</p>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-secondary/30">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to
              <span className="gradient-text"> Succeed</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed for modern event organizers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl glass glass-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20" />
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl" />
            
            <div className="relative p-12 md:p-20 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Events?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of organizers who trust EventTix for their ticketing needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/scanner">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    <ScanLine className="w-5 h-5 mr-2" />
                    Try GATESCAN
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">EventTix</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 EventTix. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
