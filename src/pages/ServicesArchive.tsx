import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Archive, Search, Calendar, User, FileText } from 'lucide-react';

interface ServiceRecord {
  id: string;
  type: 'Work Order' | 'Requisition' | 'Issue' | 'Receipt' | 'Return';
  title: string;
  description: string;
  completedBy: string;
  completedDate: string;
  location: string;
  relatedAssets: string[];
  status: 'completed' | 'archived';
}

const mockArchive: ServiceRecord[] = [
  {
    id: 'WO-003',
    type: 'Work Order',
    title: 'Printer Maintenance',
    description: 'Quarterly maintenance for HP LaserJet Pro',
    completedBy: 'Mike Johnson',
    completedDate: '2025-01-20T16:45:00Z',
    location: 'Building A - Floor 1',
    relatedAssets: ['ASSET-5678'],
    status: 'archived',
  },
  {
    id: 'REQ-005',
    type: 'Requisition',
    title: 'Office Supplies Request',
    description: 'Monthly office supplies for IT department',
    completedBy: 'Sarah Wilson',
    completedDate: '2025-01-18T14:20:00Z',
    location: 'Central Warehouse',
    relatedAssets: [],
    status: 'completed',
  },
  {
    id: 'ISS-003',
    type: 'Issue',
    title: 'Laptop Assignment',
    description: 'HP EliteBook 840 issued to new employee',
    completedBy: 'IT Admin',
    completedDate: '2025-01-15T11:30:00Z',
    location: 'Building A - Floor 3',
    relatedAssets: ['ASSET-7890'],
    status: 'archived',
  },
  {
    id: 'REC-004',
    type: 'Receipt',
    title: 'Hardware Delivery',
    description: 'Received shipment of new monitors',
    completedBy: 'Tom Brown',
    completedDate: '2025-01-12T09:15:00Z',
    location: 'Building B Store',
    relatedAssets: ['ASSET-2345', 'ASSET-2346'],
    status: 'completed',
  },
];

const typeColors = {
  'Work Order': 'bg-primary/20 text-primary',
  'Requisition': 'bg-accent/20 text-accent',
  'Issue': 'bg-warning/20 text-warning',
  'Receipt': 'bg-success/20 text-success',
  'Return': 'bg-destructive/20 text-destructive',
};

export default function ServicesArchive() {
  const [searchTerm, setSearchTerm] = useState('');
  const [archive] = useState<ServiceRecord[]>(mockArchive);

  const filteredArchive = archive.filter(record =>
    record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services Archive</h1>
        <p className="text-muted-foreground mt-1">Historical records of completed services</p>
      </div>

      {/* Search */}
      <Card className="gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search archived records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Archive List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredArchive.map((record) => (
          <Card key={record.id} className="gradient-card border-border/50 hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Archive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono text-muted-foreground">{record.id}</span>
                    <Badge className={typeColors[record.type]}>
                      {record.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {record.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{record.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Completed By:</span>
                    <span className="font-medium">{record.completedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(record.completedDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Location: </span>
                    <span className="font-medium">{record.location}</span>
                  </div>
                </div>

                {record.relatedAssets.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Related Assets</p>
                    <div className="flex flex-wrap gap-2">
                      {record.relatedAssets.map(asset => (
                        <Badge key={asset} variant="outline" className="font-mono">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArchive.length === 0 && (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-12 text-center">
            <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No archived records found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
