import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/redux/hooks';
import { Search, Filter, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusColors = {
  pending: 'bg-status-pending text-warning-foreground',
  inprogress: 'bg-status-inprogress text-primary-foreground',
  completed: 'bg-status-completed text-success-foreground',
  cancelled: 'bg-status-cancelled text-destructive-foreground',
};

const priorityColors = {
  low: 'border-muted',
  medium: 'border-warning',
  high: 'border-destructive',
  urgent: 'border-destructive shadow-glow',
};

export default function WorkOrders() {
  const { workOrders } = useAppSelector((state) => state.workOrder);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredWorkOrders = workOrders.filter(wo =>
    wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track all work orders</p>
        </div>
        <Button className="gradient-primary shadow-glow">
          Create Work Order
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredWorkOrders.map((wo) => (
          <Card
            key={wo.id}
            className={`gradient-card border-l-4 ${priorityColors[wo.priority]} cursor-pointer hover:shadow-lg transition-all`}
            onClick={() => navigate(`/work-orders/${wo.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-muted-foreground">{wo.id}</span>
                    <Badge className={statusColors[wo.status]}>
                      {wo.status.replace('inprogress', 'In Progress')}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {wo.priority}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{wo.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{wo.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{wo.assignedTo}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{wo.location}</span>
                </div>
                {wo.dueDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Due: {new Date(wo.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkOrders.length === 0 && (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No work orders found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
