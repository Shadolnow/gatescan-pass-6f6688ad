import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine, History } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import QRScanner from '@/components/QRScanner';
import ScanResult, { ScanStatus } from '@/components/ScanResult';
import ScanHistory, { ScanRecord } from '@/components/ScanHistory';
import StatsBar from '@/components/StatsBar';

// Simulated valid ticket codes (in production, this would be a database check)
const VALID_TICKETS = new Set([
  'TICKET-001-ABC123',
  'TICKET-002-DEF456',
  'TICKET-003-GHI789',
  'VIP-PASS-2024',
  'GENERAL-ADMISSION-100',
]);

const Index = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus>(null);
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [usedTickets, setUsedTickets] = useState<Set<string>>(new Set());

  const validateTicket = useCallback((ticketData: string): ScanStatus => {
    // Check if already used
    if (usedTickets.has(ticketData)) {
      return 'already-used';
    }
    
    // Check if valid ticket (in production, this would be an API call)
    // For demo: any ticket starting with "TICKET-", "VIP-", or "GENERAL-" is valid
    const isValid = VALID_TICKETS.has(ticketData) || 
                    ticketData.startsWith('TICKET-') || 
                    ticketData.startsWith('VIP-') || 
                    ticketData.startsWith('GENERAL-');
    
    return isValid ? 'valid' : 'invalid';
  }, [usedTickets]);

  const handleScan = useCallback((result: string) => {
    // Pause scanning
    setIsScanning(false);
    setCurrentTicket(result);

    // Validate ticket
    const status = validateTicket(result);
    setScanStatus(status);

    // Add to history
    const record: ScanRecord = {
      id: Date.now().toString(),
      ticketData: result,
      status,
      timestamp: new Date(),
    };
    setScanHistory(prev => [record, ...prev]);

    // Mark as used if valid
    if (status === 'valid') {
      setUsedTickets(prev => new Set([...prev, result]));
      toast.success('Ticket validated successfully!');
    } else if (status === 'invalid') {
      toast.error('Invalid ticket code');
    } else if (status === 'already-used') {
      toast.warning('This ticket has already been scanned');
    }
  }, [validateTicket]);

  const handleReset = useCallback(() => {
    setIsScanning(true);
    setScanStatus(null);
    setCurrentTicket(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 pb-8">
        <Header />
        
        <StatsBar records={scanHistory} />

        <Tabs defaultValue="scanner" className="mt-6">
          <TabsList className="w-full bg-secondary border border-border">
            <TabsTrigger 
              value="scanner" 
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono"
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Scanner
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-mono"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="mt-6">
            {scanStatus ? (
              <ScanResult 
                status={scanStatus}
                ticketData={currentTicket}
                onReset={handleReset}
              />
            ) : (
              <QRScanner 
                onScan={handleScan}
                isScanning={isScanning}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <ScanHistory records={scanHistory} />
          </TabsContent>
        </Tabs>

        {/* Demo hint */}
        <div className="mt-8 p-4 bg-secondary/50 rounded-xl border border-border/50">
          <p className="text-xs text-muted-foreground font-mono text-center">
            <span className="text-primary">TIP:</span> Scan any QR code starting with 
            "TICKET-", "VIP-", or "GENERAL-" for a valid result.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
