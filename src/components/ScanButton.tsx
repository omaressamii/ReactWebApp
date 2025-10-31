import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, RotateCcw, X, CheckCircle } from 'lucide-react';
import { useCamera } from '@/hooks/use-camera';

interface ScanButtonProps {
  onScan: (result: string) => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

export const ScanButton: React.FC<ScanButtonProps> = ({
  onScan,
  placeholder = "Scan barcode or enter manually",
  buttonText = "Scan",
  className = "",
  disabled = false,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  const {
    stream,
    isLoading,
    error: cameraError,
    isSupported,
    hasPermission,
    startCamera,
    stopCamera,
    requestPermission,
    switchCamera,
  } = useCamera();

  useEffect(() => {
    // Initialize ZXing reader
    codeReader.current = new BrowserMultiFormatReader();

    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
      stopCamera();
    };
  }, [stopCamera]);

  const startScanning = async () => {
    setIsScanning(true);
    setScanResult(null);

    try {
      // Request camera permission if not already granted
      if (hasPermission === null) {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) {
          setIsScanning(false);
          return;
        }
      }

      // Start camera
      await startCamera();

      // Start continuous scanning
      if (webcamRef.current && codeReader.current) {
        const scanLoop = async () => {
          if (!isScanning || !webcamRef.current) return;

          try {
            const result = await codeReader.current!.decodeOnceFromVideoDevice(
              undefined,
              webcamRef.current.video!
            );

            if (result) {
              const text = result.getText();
              setScanResult(text);
              setIsScanning(false);
              stopCamera();
            }
          } catch (error) {
            if (!(error instanceof NotFoundException)) {
              console.error('Scanning error:', error);
            }
            // Continue scanning if no barcode found
            if (isScanning) {
              setTimeout(scanLoop, 100);
            }
          }
        };

        scanLoop();
      }
    } catch (error) {
      console.error('Failed to start scanning:', error);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    stopCamera();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      setIsDialogOpen(false);
    }
  };

  const handleScanConfirm = () => {
    if (scanResult) {
      onScan(scanResult);
      setScanResult(null);
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsScanning(false);
    setScanResult(null);
    setManualInput('');
    stopCamera();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className}
          disabled={disabled || !isSupported}
          onClick={() => setIsDialogOpen(true)}
        >
          <Camera className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isSupported && (
            <Alert>
              <AlertDescription>
                Camera scanning is not supported on this device. Please enter the code manually.
              </AlertDescription>
            </Alert>
          )}

          {cameraError && (
            <Alert>
              <AlertDescription>
                {cameraError}
              </AlertDescription>
            </Alert>
          )}

          {isSupported && (
            <div className="space-y-4">
              {!isScanning && !scanResult && (
                <div className="text-center">
                  <Button
                    onClick={startScanning}
                    disabled={isLoading || hasPermission === false}
                    className="w-full"
                  >
                    {isLoading ? 'Starting Camera...' : 'Start Scanning'}
                  </Button>
                </div>
              )}

              {isScanning && stream && (
                <div className="space-y-4">
                  <div className="relative">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      videoConstraints={{
                        facingMode: 'environment',
                        width: 640,
                        height: 480,
                      }}
                      className="w-full rounded-lg border"
                    />
                    <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-24 border-2 border-white rounded">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-red-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={stopScanning} variant="outline" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                    <Button onClick={switchCamera} variant="outline">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {scanResult && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Barcode detected: <strong>{scanResult}</strong>
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button onClick={handleScanConfirm} className="flex-1">
                      Use This Code
                    </Button>
                    <Button onClick={() => setScanResult(null)} variant="outline">
                      Scan Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="manual-input">Or enter manually:</Label>
            <Input
              id="manual-input"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={placeholder}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
              Use Manual Entry
            </Button>
            <Button onClick={handleDialogClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};