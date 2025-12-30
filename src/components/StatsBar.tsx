import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { ScanRecord } from './ScanHistory';

interface StatsBarProps {
  records: ScanRecord[];
}

const StatsBar = ({ records }: StatsBarProps) => {
  const validCount = records.filter(r => r.status === 'valid').length;
  const invalidCount = records.filter(r => r.status === 'invalid').length;
  const usedCount = records.filter(r => r.status === 'already-used').length;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col items-center p-3 bg-success/10 rounded-xl border border-success/30">
        <CheckCircle2 className="w-5 h-5 text-success mb-1" />
        <span className="text-2xl font-bold font-mono text-success">{validCount}</span>
        <span className="text-xs text-muted-foreground font-mono">Valid</span>
      </div>
      <div className="flex flex-col items-center p-3 bg-destructive/10 rounded-xl border border-destructive/30">
        <XCircle className="w-5 h-5 text-destructive mb-1" />
        <span className="text-2xl font-bold font-mono text-destructive">{invalidCount}</span>
        <span className="text-xs text-muted-foreground font-mono">Invalid</span>
      </div>
      <div className="flex flex-col items-center p-3 bg-warning/10 rounded-xl border border-warning/30">
        <AlertCircle className="w-5 h-5 text-warning mb-1" />
        <span className="text-2xl font-bold font-mono text-warning">{usedCount}</span>
        <span className="text-xs text-muted-foreground font-mono">Used</span>
      </div>
    </div>
  );
};

export default StatsBar;
