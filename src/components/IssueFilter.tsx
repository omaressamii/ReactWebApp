import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Issue } from '@/redux/slices/issueSlice';

interface IssueFilterProps {
  issues: Issue[];
  selected: string;
  setFilteredIssues: (issues: Issue[]) => void;
  setSelected: (selected: string) => void;
  setIssueCode: (code: string) => void;
}

const statusOptions = [
  { value: 'all', label: 'All Issues', color: 'bg-gray-500', icon: Filter },
  { value: 'U', label: 'Unfinished', color: 'bg-status-pending', icon: Clock },
  { value: 'A', label: 'Approved', color: 'bg-status-completed', icon: CheckCircle },
  { value: 'R', label: 'Rejected', color: 'bg-status-cancelled', icon: XCircle },
  { value: 'ApprovedRequisistions', label: 'Approved Requisitions', color: 'bg-blue-500', icon: CheckCircle },
];

export default function IssueFilter({
  issues,
  selected,
  setFilteredIssues,
  setSelected,
  setIssueCode
}: IssueFilterProps) {
  const [issueCode, setLocalIssueCode] = useState('');

  const handleTabChange = (tabValue: string) => {
    setSelected(tabValue);
    if (tabValue === 'ApprovedRequisistions') {
      // When switching to requisitions view, clear issue filters
      setFilteredIssues(issues);
      setLocalIssueCode('');
      setIssueCode('');
    } else {
      // Apply current filters to issues
      applyFilters(tabValue, issueCode);
    }
  };

  const handleIssueCodeSearch = (code: string) => {
    setLocalIssueCode(code);
    setIssueCode(code);
    if (selected !== 'ApprovedRequisistions') {
      applyFilters(selected, code);
    }
  };

  const applyFilters = (status: string, code: string) => {
    let filtered = issues;

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(issue => issue.issue_status_code === status);
    }

    // Filter by issue code (if provided)
    if (code.trim()) {
      filtered = filtered.filter(issue =>
        issue.issue_created_requisition_code.toLowerCase().includes(code.toLowerCase())
      );
    }

    setFilteredIssues(filtered);
  };

  const clearFilters = () => {
    setLocalIssueCode('');
    setIssueCode('');
    setFilteredIssues(issues);
  };

  const hasActiveFilters = issueCode.trim() !== '';

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Button
              key={option.value}
              variant={selected === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleTabChange(option.value)}
              className="flex items-center gap-2"
            >
              <IconComponent className="w-4 h-4" />
              {option.label}
              {selected === option.value && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {issues.filter(issue =>
                    option.value === 'all' ||
                    option.value === 'ApprovedRequisistions' ||
                    issue.issue_status_code === option.value
                  ).length}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Search - Only show for issues, not requisitions */}
      {selected !== 'ApprovedRequisistions' && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by issue code..."
              value={issueCode}
              onChange={(e) => handleIssueCodeSearch(e.target.value)}
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
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && selected !== 'ApprovedRequisistions' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {issueCode.trim() && (
            <Badge variant="outline" className="text-xs">
              Issue Code: {issueCode}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}