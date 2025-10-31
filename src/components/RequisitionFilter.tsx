import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { Requisition } from '@/redux/slices/requisitionSlice';

interface RequisitionFilterProps {
  requisitions: Requisition[];
  onFilteredRequisitionsChange: (filtered: Requisition[]) => void;
  onRequisitionCodeChange: (code: string) => void;
}

const statusOptions = [
  { value: 'all', label: 'All', color: 'bg-gray-500' },
  { value: 'U', label: 'Unfinished', color: 'bg-status-pending' },
  { value: 'A', label: 'Approved', color: 'bg-status-completed' },
  { value: 'C', label: 'Cancelled', color: 'bg-status-cancelled' },
  { value: 'J', label: 'Rejected', color: 'bg-status-cancelled' },
];

export default function RequisitionFilter({
  requisitions,
  onFilteredRequisitionsChange,
  onRequisitionCodeChange
}: RequisitionFilterProps) {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [requisitionCode, setRequisitionCode] = useState('');

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    applyFilters(status, requisitionCode);
  };

  const handleRequisitionCodeSearch = (code: string) => {
    setRequisitionCode(code);
    onRequisitionCodeChange(code);
    applyFilters(selectedStatus, code);
  };

  const applyFilters = (status: string, code: string) => {
    let filtered = requisitions;

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(req => req.requisition_status_code === status);
    }

    // Filter by requisition code (if provided)
    if (code.trim()) {
      filtered = filtered.filter(req =>
        req.requisition_code.toLowerCase().includes(code.toLowerCase())
      );
    }

    onFilteredRequisitionsChange(filtered);
  };

  const clearFilters = () => {
    setSelectedStatus('all');
    setRequisitionCode('');
    onRequisitionCodeChange('');
    onFilteredRequisitionsChange(requisitions);
  };

  const hasActiveFilters = selectedStatus !== 'all' || requisitionCode.trim() !== '';

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      {/* Search by Requisition Code */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by requisition code..."
            value={requisitionCode}
            onChange={(e) => handleRequisitionCodeSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filter by Status
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={selectedStatus === status.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter(status.value)}
              className="flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              {status.label}
              {selectedStatus === status.value && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {requisitions.filter(req =>
                    status.value === 'all' || req.requisition_status_code === status.value
                  ).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {selectedStatus !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Status: {statusOptions.find(s => s.value === selectedStatus)?.label}
            </Badge>
          )}
          {requisitionCode.trim() && (
            <Badge variant="outline" className="text-xs">
              Code: {requisitionCode}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}