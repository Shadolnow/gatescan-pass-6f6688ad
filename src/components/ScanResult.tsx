import { CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ScanStatus = 'valid' | 'invalid' | 'already-used' | null;

interface ScanResultProps {
  status: ScanStatus;
  ticketData: string | null;
  onReset: () => void;
}

const ScanResult = ({ status, ticketData, onReset }: ScanResultProps) => {
  if (!status || !ticketData) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'valid':
        return {
          icon: CheckCircle2,
          title: 'ACCESS GRANTED',
          subtitle: 'Ticket verified successfully',
          bgClass: 'bg-success/10 border-success/50',
          iconClass: 'text-success',
          glowClass: 'shadow-glow-success',
        };
      case 'invalid':
        return {
          icon: XCircle,
          title: 'ACCESS DENIED',
          subtitle: 'Invalid ticket code',
          bgClass: 'bg-destructive/10 border-destructive/50',
          iconClass: 'text-destructive',
          glowClass: 'shadow-glow-destructive',
        };
      case 'already-used':
        return {
          icon: AlertCircle,
          title: 'ALREADY SCANNED',
          subtitle: 'This ticket was used before',
          bgClass: 'bg-warning/10 border-warning/50',
          iconClass: 'text-warning',
          glowClass: '',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`w-full max-w-sm mx-auto p-6 rounded-2xl border-2 ${config.bgClass} ${config.glowClass} transition-all duration-500`}>
      <div className="flex flex-col items-center text-center gap-4">
        <div className="relative">
          <Icon className={`w-20 h-20 ${config.iconClass}`} strokeWidth={1.5} />
          {status === 'valid' && (
            <div className={`absolute inset-0 w-20 h-20 rounded-full ${config.iconClass} pulse-ring opacity-30`} />
          )}
        </div>
        
        <div>
          <h2 className={`text-2xl font-bold font-mono tracking-wider ${config.iconClass}`}>
            {config.title}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {config.subtitle}
          </p>
        </div>

        <div className="w-full p-3 bg-secondary/50 rounded-lg">
          <p className="text-xs text-muted-foreground font-mono mb-1">TICKET ID</p>
          <p className="text-sm font-mono text-foreground break-all">
            {ticketData.length > 40 ? `${ticketData.slice(0, 40)}...` : ticketData}
          </p>
        </div>

        <Button 
          onClick={onReset}
          variant="outline"
          className="w-full mt-2 border-primary/50 text-primary hover:bg-primary/10 font-mono"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          SCAN NEXT
        </Button>
      </div>
    </div>
  );
};

export default ScanResult;
