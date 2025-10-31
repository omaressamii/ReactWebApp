import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Package, TrendingUp, Scan } from 'lucide-react';

interface LocationInventory {
  location: string;
  building: string;
  floor: string;
  totalAssets: number;
  categories: {
    category: string;
    count: number;
    value: number;
  }[];
  lastUpdated: string;
}

const mockInventory: LocationInventory[] = [
  {
    location: 'Building A - Floor 1',
    building: 'Building A',
    floor: 'Floor 1',
    totalAssets: 47,
    categories: [
      { category: 'Laptops', count: 12, value: 18000 },
      { category: 'Monitors', count: 20, value: 6000 },
      { category: 'Printers', count: 3, value: 2400 },
      { category: 'Phones', count: 12, value: 3600 },
    ],
    lastUpdated: '2025-01-24T14:30:00Z',
  },
  {
    location: 'Building A - Floor 2',
    building: 'Building A',
    floor: 'Floor 2',
    totalAssets: 62,
    categories: [
      { category: 'Laptops', count: 25, value: 37500 },
      { category: 'Monitors', count: 28, value: 8400 },
      { category: 'Keyboards', count: 9, value: 675 },
    ],
    lastUpdated: '2025-01-24T10:15:00Z',
  },
  {
    location: 'Building B - Server Room',
    building: 'Building B',
    floor: 'Server Room',
    totalAssets: 35,
    categories: [
      { category: 'Servers', count: 12, value: 60000 },
      { category: 'Network Equipment', count: 15, value: 45000 },
      { category: 'Storage Devices', count: 8, value: 16000 },
    ],
    lastUpdated: '2025-01-23T16:45:00Z',
  },
];

export default function LocationInventory() {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [inventory] = useState<LocationInventory[]>(mockInventory);

  const filteredInventory = selectedBuilding === 'all' 
    ? inventory 
    : inventory.filter(inv => inv.building === selectedBuilding);

  const buildings = ['all', ...Array.from(new Set(inventory.map(inv => inv.building)))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Location Inventory</h1>
          <p className="text-muted-foreground mt-1">Track assets by physical location</p>
        </div>
        <Button className="gradient-primary shadow-glow">
          <Scan className="w-4 h-4 mr-2" />
          Scan Location
        </Button>
      </div>

      {/* Filter */}
      <Card className="gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Building:</label>
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger className="w-48 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {buildings.map(building => (
                  <SelectItem key={building} value={building}>
                    {building === 'all' ? 'All Buildings' : building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredInventory.map((location) => {
          const totalValue = location.categories.reduce((sum, cat) => sum + cat.value, 0);
          
          return (
            <Card key={location.location} className="gradient-card border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {location.location}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(location.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{location.totalAssets}</p>
                    <p className="text-xs text-muted-foreground">Total Assets</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Value Summary */}
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <span className="font-medium">Total Asset Value</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        ${totalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Asset Categories</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {location.categories.map((category) => (
                        <div 
                          key={category.category} 
                          className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-accent" />
                            <span className="font-medium text-sm">{category.category}</span>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-2xl font-bold">{category.count}</p>
                              <p className="text-xs text-muted-foreground">Units</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-accent">
                                ${category.value.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">Value</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
