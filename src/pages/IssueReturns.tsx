import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RotateCcw, Search, Calendar, Package } from 'lucide-react';

interface IssueReturn {
  id: string;
  originalIssueId: string;
  assetName: string;
  returnedBy: string;
  receivedBy: string;
  location: string;
  quantity: number;
  condition: 'good' | 'damaged' | 'needs-repair';
  status: 'completed' | 'pending' | 'inspecting';
  returnDate: string;
  notes: string;
}

const mockReturns: IssueReturn[] = [
  {
    id: 'RET-001',
    originalIssueId: 'ISS-003',
    assetName: 'HP EliteBook 840',
    returnedBy: 'Alice Cooper',
    receivedBy: 'IT Admin',
    location: 'Central Warehouse',
    quantity: 1,
    condition: 'good',
    status: 'completed',
    returnDate: '2025-01-23T15:00:00Z',
    notes: 'Device in excellent condition, all accessories included',
  },
  {
    id: 'RET-002',
    originalIssueId: 'ISS-005',
    assetName: 'Logitech Webcam',
    returnedBy: 'Bob Martin',
    receivedBy: 'Sarah Wilson',
    location: 'Building A Store',
    quantity: 1,
    condition: 'needs-repair',
    status: 'inspecting',
    returnDate: '2025-01-24T10:30:00Z',
    notes: 'Camera lens appears scratched, requires inspection',
  },
];

const statusColors = {
  completed: 'bg-status-completed text-success-foreground',
  pending: 'bg-status-pending text-warning-foreground',
  inspecting: 'bg-status-inprogress text-primary-foreground',
};

const conditionColors = {
  good: 'border-success',
  damaged: 'border-destructive',
  'needs-repair': 'border-warning',
};

export default function IssueReturns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [returns] = useState<IssueReturn[]>(mockReturns);

  const filteredReturns = returns.filter(ret =>
    ret.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ret.originalIssueId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Issue Returns</h1>
          <p className="text-muted-foreground mt-1">Process returned assets and equipment</p>
        </div>
        <Button className="gradient-primary shadow-glow">
          <RotateCcw className="w-4 h-4 mr-2" />
          Process Return
        </Button>
      </div>

      {/* Search */}
      <Card className="gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Returns List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReturns.map((returnItem) => (
          <Card 
            key={returnItem.id} 
            className={`gradient-card border-l-4 ${conditionColors[returnItem.condition]} hover:shadow-lg transition-all cursor-pointer`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-muted-foreground">{returnItem.id}</span>
                    <Badge className={statusColors[returnItem.status]}>
                      {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      Original: {returnItem.originalIssueId}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    {returnItem.assetName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{returnItem.notes}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground block">Returned By</span>
                  <span className="font-medium">{returnItem.returnedBy}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block">Received By</span>
                  <span className="font-medium">{returnItem.receivedBy}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground block">Condition</span>
                  <Badge variant="outline" className="capitalize">
                    {returnItem.condition.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(returnItem.returnDate).toLocaleDateString()}
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
