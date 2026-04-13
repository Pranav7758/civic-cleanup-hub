import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Loader2 } from "lucide-react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: any) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) return;

    // Use a unique ID for the scanner container
    const scannerId = "qr-reader-container";
    scannerRef.current.id = scannerId;

    const scanner = new Html5QrcodeScanner(
      scannerId,
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    scanner.render(
      (data) => {
        // Prevent multiple rapid fires
        scanner.clear();
        onScan(data);
      },
      (error) => {
        if (onError) onError(error);
      }
    );

    setInit(true);

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan, onError]);

  return (
    <div className="w-full relative overflow-hidden rounded-xl border-2 border-border bg-black">
      {!init && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={scannerRef} className="w-full h-full [&_video]:object-cover" />
    </div>
  );
}
