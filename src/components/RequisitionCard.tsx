import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight, Calendar, Eye } from 'lucide-react';

interface RequisitionCardProps {
  requisition: any; // Flexible type to work with different requisition interfaces
  onViewDetails?: (requisition: any) => void;
}

const statusColors = {
  U: 'bg-status-pending text-warning-foreground', // Unfinished
  A: 'bg-status-completed text-success-foreground', // Approved
  C: 'bg-status-cancelled text-destructive-foreground', // Cancelled
  J: 'bg-status-cancelled text-destructive-foreground', // Rejected
};

const statusLabels = {
  U: 'Unfinished',
  A: 'Approved',
  C: 'Cancelled',
  J: 'Rejected',
};

export default function RequisitionCard({ requisition, onViewDetails }: RequisitionCardProps) {
  const handleViewDetails = () => {
    onViewDetails?.(requisition);
  };

  return (
    <Card className="gradient-card border-border/50 hover:shadow-lg transition-all cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-muted-foreground">{requisition.requisitioncode}</span>
              <Badge className={statusColors[requisition.requisition_status_code as keyof typeof statusColors] || 'bg-gray-500'}>
                {statusLabels[requisition.requisition_status_code as keyof typeof statusLabels] || 'Unknown'}
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Requisition Request
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {requisition.description || requisition.requisition_description || 'No description provided'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground font-medium text-sm">
                From: {requisition.requisition_created_fromStoreDesc || requisition.fromstore}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className="px-3 py-1 rounded-md bg-primary text-primary-foreground font-medium text-sm">
                To: {requisition.requisition_created_toStoreDesc || requisition.tostore}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Organization: {requisition.requisition_created_fromStoreOrg || requisition.FromStoreOrg} → {requisition.requisition_created_toStoreOrg || requisition.ToStoreOrg}</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {requisition.created_date ?
                new Date(requisition.created_date).toLocaleDateString() :
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