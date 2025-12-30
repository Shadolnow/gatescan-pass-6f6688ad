import { Scanner } from '@yudiel/react-qr-scanner';
import { useState } from 'react';

interface QRScannerProps {
  onScan: (result: string) => void;
  isScanning: boolean;
}

const QRScanner = ({ onScan, isScanning }: QRScannerProps) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Scanner container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary border-2 border-primary/30">
        {isScanning ? (
          <>
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  onScan(result[0].rawValue);
                }
              }}
              onError={(err: Error | unknown) => {
                const message = err instanceof Error ? err.message : 'Camera error';
                setError(message);
              }}
              styles={{
                container: {
                  width: '100%',
                  height: '100%',
                },
                video: {
                  objectFit: 'cover',
                },
              }}
            />
            {/* Scanning frame overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="scanner-frame w-full h-full" />
              {/* Scan line animation */}
              <div className="absolute inset-x-8 top-8 h-1 scan-line rounded-full" />
            </div>
            {/* Corner markers */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg" />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-center font-mono">Scanner paused</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-4 text-center text-destructive text-sm font-mono">
          {error}
        </p>
      )}

      {/* Scanning indicator */}
      {isScanning && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary pulse-ring" />
          </div>
          <span className="text-sm font-mono text-muted-foreground">
            Scanning for QR codes...
          </span>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
