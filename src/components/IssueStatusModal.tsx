import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface StatusOption {
  option: string;
  value: string;
}

interface IssueStatusModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  statusOptions: StatusOption[];
  selectedStatus: StatusOption | null;
  onSelectStatus: (status: StatusOption) => void;
  onConfirm: () => void;
  loading?: boolean;
}

const statusIcons = {
  U: Clock,
  A: CheckCircle,
  R: XCircle,
  AR: CheckCircle,
  default: AlertTriangle,
};

const statusColors = {
  U: 'bg-status-pending text-warning-foreground',
  A: 'bg-status-completed text-success-foreground',
  R: 'bg-status-cancelled text-destructive-foreground',
  AR: 'bg-status-completed text-success-foreground',
};

export default function IssueStatusModal({
  visible,
  onClose,
  title,
  statusOptions,
  selectedStatus,
  onSelectStatus,
  onConfirm,
  loading = false,
}: IssueStatusModalProps) {
  const handleStatusSelect = (status: StatusOption) => {
    onSelectStatus(status);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the new status for this issue:
          </p>

          <div className="space-y-2">
            {statusOptions.map((status) => {
              const IconComponent = statusIcons[status.value as keyof typeof statusIcons] || statusIcons.default;
              const isSelected = selectedStatus?.value === status.value;

              return (
                <div
                  key={status.value}
                  onClick={() => handleStatusSelect(status)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}>
                          {status.option}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status Code: {status.value}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Badge className={statusColors[status.value as keyof typeof statusColors] || 'bg-gray-500'}>
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedStatus && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected Status:</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusColors[selectedStatus.value as keyof typeof statusColors] || 'bg-gray-500'}>
                  {selectedStatus.option}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({selectedStatus.value})
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus || loading}
            className="min-w-[100px]"
          >
            {loading ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}