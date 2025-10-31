import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LayoutGrid, Search, MapPin, Package, Calendar } from 'lucide-react';

interface AssetArrangement {
  id: string;
  assetName: string;
  fromLocation: string;
  toLocation: string;
  requestedBy: string;
  arrangedBy: string;
  quantity: number;
  status: 'completed' | 'pending' | 'in-transit';
  arrangementDate: string;
  completionDate?: string;
  notes: string;
}

const mockArrangements: AssetArrangement[] = [
  {
    id: 'ARR-001',
    assetName: 'Office Desks',
    fromLocation: 'Building A - Floor 2',
    toLocation: 'Building A - Floor 3',
    requestedBy: 'Facilities Manager',
    arrangedBy: 'IT Admin',
    quantity: 15,
    status: 'completed',
    arrangementDate: '2025-01-20T08:00:00Z',
    completionDate: '2025-01-21T16:00:00Z',
    notes: 'Office reorganization - all desks moved successfully',
  },
  {
    id: 'ARR-002',
    assetName: 'Network Equipment',
    fromLocation: 'Central Warehouse',
    toLocation: 'Building B - Server Room',
    requestedBy: 'IT Manager',
    arrangedBy: 'John Doe',
    quantity: 5,
    status: 'in-transit',
    arrangementDate: '2025-01-23T09:00:00Z',
    notes: 'New network switches for infrastructure upgrade',
  },
  {
    id: 'ARR-003',
    assetName: 'Ergonomic Chairs',
    fromLocation: 'Building C - Storage',
    toLocation: 'Building A - Floor 1',
    requestedBy: 'HR Department',
    arrangedBy: 'Mike Johnson',
    quantity: 20,
    status: 'pending',
    arrangementDate: '2025-01-24T10:00:00Z',
    notes: 'New employee workstation setup',
  },
];

const statusColors = {
  completed: 'bg-status-completed text-success-foreground',
  pending: 'bg-status-pending text-warning-foreground',
  'in-transit': 'bg-status-inprogress text-primary-foreground',
};

export default function AssetArrangements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [arrangements] = useState<AssetArrangement[]>(mockArrangements);

  const filteredArrangements = arrangements.filter(arr =>
    arr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arr.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arr.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arr.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Asset Arrangements</h1>
          <p className="text-muted-foreground mt-1">Manage asset movements and relocations</p>
        </div>
        <Button className="gradient-primary shadow-glow">
          <LayoutGrid className="w-4 h-4 mr-2" />
          New Arrangement
        </Button>
      </div>

      {/* Search */}
      <Card className="gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search arrangements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Arrangements List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredArrangements.map((arrangement) => (
          <Card key={arrangement.id} className="gradient-card border-border/50 hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-muted-foreground">{arrangement.id}</span>
                    <Badge className={statusColors[arrangement.status]}>
                      {arrangement.status.charAt(0).toUpperCase() + arrangement.status.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    {arrangement.assetName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{arrangement.notes}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-accent">{arrangement.quantity}</p>
                  <p className="text-xs text-muted-foreground">Units</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">From</p>
                      <p className="font-medium text-sm">{arrangement.fromLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">To</p>
                      <p className="font-medium text-sm">{arrangement.toLocation}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested By: </span>
                    <span className="font-medium">{arrangement.requestedBy}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Arranged By: </span>
                    <span className="font-medium">{arrangement.arrangedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(arrangement.arrangementDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
