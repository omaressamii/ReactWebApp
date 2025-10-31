import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, FileText, Settings, CheckCircle } from 'lucide-react';

interface PrinterOption {
  option: string;
  value: string;
  paperSizes?: string[];
}

interface PrintOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onPrint: (options: PrintOptions) => void;
  printers: PrinterOption[];
  loading?: boolean;
}

interface PrintOptions {
  printerId: string;
  includeImages: boolean;
  includeParts: boolean;
  includeHistory: boolean;
  copies: number;
  paperSize?: string;
}

export default function PrintOptionsModal({
  visible,
  onClose,
  onPrint,
  printers,
  loading = false,
}: PrintOptionsModalProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeParts, setIncludeParts] = useState(true);
  const [includeHistory, setIncludeHistory] = useState(false);
  const [copies, setCopies] = useState(1);

  const selectedPrinterData = printers.find(p => p.value === selectedPrinter);
  const availablePaperSizes = selectedPrinterData?.paperSizes || [];

  const handlePrint = () => {
    if (!selectedPrinter) return;

    const options: PrintOptions = {
      printerId: selectedPrinter,
      includeImages,
      includeParts,
      includeHistory,
      copies,
      paperSize: availablePaperSizes.length > 0 ? availablePaperSizes[0] : undefined,
    };

    onPrint(options);
  };

  const handleClose = () => {
    // Reset form
    setSelectedPrinter('');
    setIncludeImages(true);
    setIncludeParts(true);
    setIncludeHistory(false);
    setCopies(1);
    onClose();
  };

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            Print Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Printer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Select Printer
            </label>
            <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a printer..." />
              </SelectTrigger>
              <SelectContent>
                {printers.map((printer) => (
                  <SelectItem key={printer.value} value={printer.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{printer.option}</span>
                      {printer.paperSizes && printer.paperSizes.length > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {printer.paperSizes.join(', ')}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Print Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Print Options
            </label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-parts"
                  checked={includeParts}
                  onCheckedChange={(checked) => setIncludeParts(checked as boolean)}
                />
                <label
                  htmlFor="include-parts"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include Issue Parts
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-images"
                  checked={includeImages}
                  onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                />
                <label
                  htmlFor="include-images"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include Images
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-history"
                  checked={includeHistory}
                  onCheckedChange={(checked) => setIncludeHistory(checked as boolean)}
                />
                <label
                  htmlFor="include-history"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Include Status History
                </label>
              </div>
            </div>
          </div>

          {/* Copies */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Number of Copies
            </label>
            <Select value={copies.toString()} onValueChange={(value) => setCopies(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Copy</SelectItem>
                <SelectItem value="2">2 Copies</SelectItem>
                <SelectItem value="3">3 Copies</SelectItem>
                <SelectItem value="4">4 Copies</SelectItem>
                <SelectItem value="5">5 Copies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Print Summary */}
          {selectedPrinter && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Print Summary:</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Printer: {selectedPrinterData?.option}</p>
                <p>Copies: {copies}</p>
                <p>Includes: {[
                  includeParts && 'Parts',
                  includeImages && 'Images',
                  includeHistory && 'History'
                ].filter(Boolean).join(', ') || 'Basic Info'}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!selectedPrinter || loading}
            className="min-w-[100px]"
          >
            {loading ? (
              'Printing...'
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}