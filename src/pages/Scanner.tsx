import { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine, History } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import QRScanner from '@/components/QRScanner';
import ScanResult, { ScanStatus } from '@/components/ScanResult';
import ScanHistory, { ScanRecord } from '@/components/ScanHistory';
import StatsBar from '@/components/StatsBar';
import { useTicketValidation, ValidationResult } from '@/hooks/useTicketValidation';

interface ExtendedScanRecord extends ScanRecord {
  eventName?: string;
  tierName?: string;
  attendeeName?: string;
}

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus>(null);
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ExtendedScanRecord[]>([]);
  const [scanDetails, setScanDetails] = useState<Partial<ValidationResult> | null>(null);
  
  const { validateTicket, fetchScanHistory, isValidating } = useTicketValidation();

  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchScanHistory();
      setScanHistory(history);
    };
    loadHistory();
  }, [fetchScanHistory]);

  const handleScan = useCallback(async (result: string) => {
    setIsScanning(false);
    setCurrentTicket(result);
    setScanStatus(null);
    setScanDetails(null);

    const validationResult = await validateTicket(result);
    setScanStatus(validationResult.status);
    setScanDetails(validationResult);

    const record: ExtendedScanRecord = {
      id: Date.now().toString(),
      ticketData: result,
      status: validationResult.status,
      timestamp: new Date(),
      eventName: validationResult.eventName || undefined,
      tierName: validationResult.tierName || undefined,
      attendeeName: validationResult.attendeeName || undefined,
    };
    setScanHistory(prev => [record, ...prev]);

    if (validationResult.status === 'valid') {
      toast.success(validationResult.message);
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    } else if (validationResult.status === 'invalid') {
      toast.error(validationResult.message);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else if (validationResult.status === 'already-used') {
      toast.warning(validationResult.message);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    }
  }, [validateTicket]);

  const handleReset = useCallback(() => {
    setIsScanning(true);
    setScanStatus(null);
    setCurrentTicket(null);
    setScanDetails(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pb-8 pt-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-mono bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GATESCAN
          </h1>
          <p className="text-muted-foreground text-sm">Ticket Validation Scanner</p>
        </div>
        
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
                eventName={scanDetails?.eventName || undefined}
                tierName={scanDetails?.tierName || undefined}
                attendeeName={scanDetails?.attendeeName || undefined}
                venue={scanDetails?.venue || undefined}
                eventDate={scanDetails?.eventDate || undefined}
              />
            ) : isValidating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground font-mono">Validating ticket...</p>
              </div>
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
      </div>
    </div>
  );
};

export default Scanner;
