import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { ScanStatus } from './ScanResult';

export interface ScanRecord {
  id: string;
  ticketData: string;
  status: ScanStatus;
  timestamp: Date;
}

interface ScanHistoryProps {
  records: ScanRecord[];
}

const ScanHistory = ({ records }: ScanHistoryProps) => {
  const getStatusIcon = (status: ScanStatus) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'already-used':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-mono text-sm">No scans yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div
          key={record.id}
          className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border/50"
        >
          {getStatusIcon(record.status)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-foreground truncate">
              {record.ticketData.length > 30 
                ? `${record.ticketData.slice(0, 30)}...` 
                : record.ticketData}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {formatTime(record.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScanHistory;
