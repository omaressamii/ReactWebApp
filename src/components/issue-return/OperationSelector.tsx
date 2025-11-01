import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, ArrowUp, ArrowDown } from 'lucide-react';

interface OperationSelectorProps {
  selectedOperation: 'ISSUE' | 'RETURN' | null;
  onSelectOperation: (operation: 'ISSUE' | 'RETURN') => void;
  t?: (key: string) => string;
}

export default function OperationSelector({
  selectedOperation,
  onSelectOperation,
  t = (key: string) => key // Default to identity function
}: OperationSelectorProps) {
  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          Select Operation Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant={selectedOperation === 'ISSUE' ? 'default' : 'outline'}
            className={`h-20 flex flex-col items-center gap-2 ${
              selectedOperation === 'ISSUE'
                ? 'gradient-primary shadow-glow'
                : 'hover:bg-accent'
            }`}
            onClick={() => onSelectOperation('ISSUE')}
          >
            <ArrowUp className="w-6 h-6" />
            <span className="font-medium">Issue</span>
            <span className="text-xs text-muted-foreground">
              Move parts from store to location
            </span>
          </Button>

          <Button
            variant={selectedOperation === 'RETURN' ? 'default' : 'outline'}
            className={`h-20 flex flex-col items-center gap-2 ${
              selectedOperation === 'RETURN'
                ? 'gradient-primary shadow-glow'
                : 'hover:bg-accent'
            }`}
            onClick={() => onSelectOperation('RETURN')}
          >
            <ArrowDown className="w-6 h-6" />
            <span className="font-medium">Return</span>
            <span className="text-xs text-muted-foreground">
              Move parts from location to store
            </span>
          </Button>
        </div>

        {selectedOperation && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Selected: {' '}
              <span className="font-medium text-foreground">
                {selectedOperation === 'ISSUE' ? 'Issue' : 'Return'}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}