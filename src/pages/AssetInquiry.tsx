import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Package, Cpu, HardDrive, Monitor } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  location: string;
  assignedTo?: string;
  status: 'active' | 'maintenance' | 'retired' | 'available';
  purchaseDate: string;
  warrantyExpiry: string;
  specifications: Record<string, string>;
}

const mockAssets: Asset[] = [
  {
    id: 'ASSET-1234',
    name: 'Dell Latitude 7400',
    category: 'Laptop',
    serialNumber: 'DL7400-2024-001',
    model: 'Latitude 7400',
    manufacturer: 'Dell',
    location: 'Building A - Floor 3',
    assignedTo: 'John Smith',
    status: 'active',
    purchaseDate: '2024-06-15',
    warrantyExpiry: '2027-06-15',
    specifications: {
      CPU: 'Intel Core i7-8665U',
      RAM: '16GB DDR4',
      Storage: '512GB SSD',
      Display: '14" FHD',
    },
  },
  {
    id: 'ASSET-5678',
    name: 'HP LaserJet Pro M404dn',
    category: 'Printer',
    serialNumber: 'HPLJ-2024-025',
    model: 'LaserJet Pro M404dn',
    manufacturer: 'HP',
    location: 'Building A - Floor 1',
    status: 'maintenance',
    purchaseDate: '2023-03-20',
    warrantyExpiry: '2026-03-20',
    specifications: {
      Type: 'Laser Printer',
      'Print Speed': '38 ppm',
      Connectivity: 'Ethernet, USB',
    },
  },
  {
    id: 'ASSET-9012',
    name: 'Cisco Catalyst 2960-X',
    category: 'Network Equipment',
    serialNumber: 'CSC-2960X-2024-008',
    model: 'Catalyst 2960-X',
    manufacturer: 'Cisco',
    location: 'Building B - Server Room',
    status: 'active',
    purchaseDate: '2024-01-10',
    warrantyExpiry: '2029-01-10',
    specifications: {
      Ports: '48x 1GbE',
      Uplinks: '2x 10GbE SFP+',
      'Power': 'PoE+',
    },
  },
];

const statusColors = {
  active: 'bg-status-completed text-success-foreground',
  maintenance: 'bg-status-pending text-warning-foreground',
  retired: 'bg-status-cancelled text-destructive-foreground',
  available: 'bg-status-inprogress text-primary-foreground',
};

const categoryIcons = {
  Laptop: Monitor,
  Printer: Package,
  'Network Equipment': Cpu,
  default: HardDrive,
};

export default function AssetInquiry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [assets] = useState<Asset[]>(mockAssets);

  const filteredAssets = assets.filter(asset =>
    asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Asset Inquiry</h1>
        <p className="text-muted-foreground mt-1">Search and view detailed asset information</p>
      </div>

      {/* Search */}
      <Card className="gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by asset ID, name, serial number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAssets.map((asset) => {
          const CategoryIcon = categoryIcons[asset.category as keyof typeof categoryIcons] || categoryIcons.default;
          
          return (
            <Card key={asset.id} className="gradient-card border-border/50 hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-primary">{asset.id}</span>
                      <Badge className={statusColors[asset.status]}>
                        {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">{asset.category}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <CategoryIcon className="w-5 h-5 text-primary" />
                      {asset.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {asset.manufacturer} {asset.model} • SN: {asset.serialNumber}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Location and Assignment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{asset.location}</span>
                    </div>
                    {asset.assignedTo && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Assigned To:</span>
                        <span className="font-medium">{asset.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  {/* Specifications */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Specifications</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(asset.specifications).map(([key, value]) => (
                        <div key={key} className="p-2 rounded bg-secondary/30">
                          <p className="text-xs text-muted-foreground">{key}</p>
                          <p className="text-sm font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Warranty: {new Date(asset.warrantyExpiry).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No assets found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
