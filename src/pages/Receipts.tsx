import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileInput, Search, Calendar, Package, CheckCircle } from 'lucide-react';

interface Receipt {
  id: string;
  partName: string;
  supplier: string;
  receivedBy: string;
  location: string;
  quantity: number;
  status: 'received' | 'pending' | 'verified';
  receivedDate: string;
  poNumber: string;
  notes: string;
}

const mockReceipts: Receipt[] = [
  {
    id: 'REC-001',
    partName: 'Samsung SSD 1TB',
    supplier: 'Tech Supplies Inc.',
    receivedBy: 'Mike Johnson',
    location: 'Central Warehouse',
    quantity: 10,
    status: 'verified',
    receivedDate: '2025-01-22T09:00:00Z',
    poNumber: 'PO-2025-001',
    notes: 'All items inspected and verified',
  },
  {
    id: 'REC-002',
    partName: 'Dell Monitor 27"',
    supplier: 'Office Equipment Co.',
    receivedBy: 'Sarah Wilson',
    location: 'Building A Store',
    quantity: 5,
    status: 'received',
    receivedDate: '2025-01-23T11:30:00Z',
    poNumber: 'PO-2025-002',
    notes: 'Awaiting quality check',
  },
  {
    id: 'REC-003',
    partName: 'Network Cables Cat6',
    supplier: 'Network Solutions',
    receivedBy: 'Tom Brown',
    location: 'Building B Store',
    quantity: 100,
    status: 'pending',
    receivedDate: '2025-01-24T08:00:00Z',
    poNumber: 'PO-2025-003',
    notes: 'Partial delivery - 50 units received',
  },
];

const statusColors = {
  verified: 'bg-status-completed text-success-foreground',
  received: 'bg-status-inprogress text-primary-foreground',
  pending: 'bg-status-pending text-warning-foreground',
};

export default function Receipts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [receipts] = useState<Receipt[]>(mockReceipts);

  const filteredReceipts = receipts.filter(receipt =>
    receipt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Receipts</h1>
          <p className="text-muted-foreground mt-1">Process and manage incoming deliveries</p>
        </div>
        <Button className="gradient-primary shadow-glow">
          <FileInput className="w-4 h-4 mr-2" />
          Create Receipt
        </Button>
      </div>

      {/* Search */}
      <Card className="gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReceipts.map((receipt) => (
          <Card key={receipt.id} className="gradient-card border-border/50 hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-muted-foreground">{receipt.id}</span>
                    <Badge className={statusColors[receipt.status]}>
                      {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {receipt.poNumber}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    {receipt.partName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{receipt.notes}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{receipt.quantity}</p>
                  <p className="text-xs text-muted-foreground">Units</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Supplier:</span>
                  <span className="font-medium">{receipt.supplier}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Received By:</span>
                  <span className="font-medium">{receipt.receivedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium">{receipt.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(receipt.receivedDate).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
