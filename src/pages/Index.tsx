import { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine, History } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import QRScanner from '@/components/QRScanner';
import ScanResult, { ScanStatus } from '@/components/ScanResult';
import ScanHistory, { ScanRecord } from '@/components/ScanHistory';
import StatsBar from '@/components/StatsBar';
import { useTicketValidation } from '@/hooks/useTicketValidation';

const Index = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus>(null);
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  
  const { validateTicket, fetchScanHistory, isValidating } = useTicketValidation();

  // Load scan history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchScanHistory();
      setScanHistory(history);
    };
    loadHistory();
  }, [fetchScanHistory]);

  const handleScan = useCallback(async (result: string) => {
    // Pause scanning
    setIsScanning(false);
    setCurrentTicket(result);
    setScanStatus(null);

    // Validate ticket via backend
    const { status, message } = await validateTicket(result);
    setScanStatus(status);

    // Add to local history immediately for UI feedback
    const record: ScanRecord = {
      id: Date.now().toString(),
      ticketData: result,
      status,
      timestamp: new Date(),
    };
    setScanHistory(prev => [record, ...prev]);

    // Show toast notification
    if (status === 'valid') {
      toast.success(message);
    } else if (status === 'invalid') {
      toast.error(message);
    } else if (status === 'already-used') {
      toast.warning(message);
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

export default Index;