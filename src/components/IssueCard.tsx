import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight, Calendar, Eye, Bug } from 'lucide-react';
import { Issue } from '@/redux/slices/issueSlice';

interface IssueCardProps {
  issue: Issue;
  onViewDetails?: (issue: Issue) => void;
}

const statusColors = {
  U: 'bg-status-pending text-warning-foreground', // Unfinished
  A: 'bg-status-completed text-success-foreground', // Approved
  R: 'bg-status-cancelled text-destructive-foreground', // Rejected
  AR: 'bg-status-completed text-success-foreground', // Approved & Received
};

const statusLabels = {
  U: 'Unfinished',
  A: 'Approved',
  R: 'Rejected',
  AR: 'Approved & Received',
};

export default function IssueCard({ issue, onViewDetails }: IssueCardProps) {
  const handleViewDetails = () => {
    onViewDetails?.(issue);
  };

  return (
    <Card className="gradient-card border-border/50 hover:shadow-lg transition-all cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-muted-foreground">{issue.issue_code}</span>
              <Badge className={statusColors[issue.issue_status_code as keyof typeof statusColors] || 'bg-gray-500'}>
                {statusLabels[issue.issue_status_code as keyof typeof statusLabels] || issue.issue_status_desc}
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <Bug className="w-5 h-5 text-primary" />
              Issue Transaction
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {issue.issue_description || 'No description provided'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground font-medium text-sm">
                {issue.issue_created_requisition_fromStoreDesc}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="px-3 py-1 rounded-md bg-primary text-primary-foreground font-medium text-sm">
                {issue.issue_created_requisition_toStoreDesc}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Created by: {issue.issue_created_byName}</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {issue.issue_created_date ?
                new Date(issue.issue_created_date).toLocaleDateString() :
                'N/A'
              }
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}