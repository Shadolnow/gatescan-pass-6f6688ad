import { ScanLine, Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/30">
          <ScanLine className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
            GATE<span className="text-primary">SCAN</span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Ticket Validation System
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span className="text-xs font-mono">SECURE</span>
      </div>
    </header>
  );
};

export default Header;
