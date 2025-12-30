import { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine, History } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import QRScanner from '@/components/QRScanner';
import ScanResult, { ScanStatus } from '@/components/ScanResult';
import ScanHistory, { ScanRecord } from '@/components/ScanHistory';
import StatsBar from '@/components/StatsBar';
import { useTicketValidation } from '@/hooks/useTicketValidation';

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
  const [scanDetails, setScanDetails] = useState<{
    eventName?: string;
    tierName?: string;
    attendeeName?: string;
  } | null>(null);
  
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

    const { status, message, eventName, tierName, attendeeName } = await validateTicket(result);
    setScanStatus(status);
    setScanDetails({ eventName, tierName, attendeeName });

    const record: ExtendedScanRecord = {
      id: Date.now().toString(),
      ticketData: result,
      status,
      timestamp: new Date(),
      eventName,
      tierName,
      attendeeName,
    };
    setScanHistory(prev => [record, ...prev]);

    if (status === 'valid') {
      toast.success(message);
      // Vibrate on success if supported
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    } else if (status === 'invalid') {
      toast.error(message);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else if (status === 'already-used') {
      toast.warning(message);
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
          <h1 className="text-2xl font-bold font-mono">GATESCAN</h1>
          <p className="text-muted-foreground">Ticket Validation Scanner</p>
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
                eventName={scanDetails?.eventName}
                tierName={scanDetails?.tierName}
                attendeeName={scanDetails?.attendeeName}
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
