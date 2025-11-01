import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Warehouse, AlertTriangle } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';

interface StoreLocationOption {
  option: string;
  value: string;
  organization: string;
  description: string;
}

interface StoreLocationSelectorProps {
  selectedOperation: 'ISSUE' | 'RETURN' | null;
  selectedStore: StoreLocationOption | null;
  selectedLocation: StoreLocationOption | null;
  onStoreChange: (store: StoreLocationOption | null) => void;
  onLocationChange: (location: StoreLocationOption | null) => void;
  t?: (key: string) => string;
}

export default function StoreLocationSelector({
  selectedOperation,
  selectedStore,
  selectedLocation,
  onStoreChange,
  onLocationChange,
  t = (key: string) => key // Default to identity function
}: StoreLocationSelectorProps) {
  const userState = useAppSelector((state) => state.user);
  const { getAsset: assets } = useAppSelector((state) => state.issueReturn);

  const [storeOptions, setStoreOptions] = useState<StoreLocationOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<StoreLocationOption[]>([]);

  const asset = assets?.[0];

  // Update store and location options when asset changes
  useEffect(() => {
    if (asset && userState.user?.userStores && userState.user?.userLocations) {
      // Filter stores based on asset's organization and ensure valid values
      const filteredStores = userState.user.userStores
        .filter((store: any) => store.STR_ORG === asset.STR_ORG && store.STR_CODE && store.STR_CODE.trim() !== '')
        .map((store: any) => ({
          option: `${store.STR_CODE} ${store.STR_DESC}`,
          value: store.STR_CODE,
          organization: store.STR_ORG,
          description: store.STR_DESC,
        }));

      // Filter locations based on asset's organization and ensure valid values
      const filteredLocations = userState.user.userLocations
        .filter((location: any) => location.LOC_ORG === asset.STR_ORG && location.LOC_CODE && location.LOC_CODE.trim() !== '')
        .map((location: any) => ({
          option: `${location.LOC_CODE} ${location.LOC_DESC}`,
          value: location.LOC_CODE,
          organization: location.LOC_ORG,
          description: location.LOC_DESC,
        }));

      setStoreOptions(filteredStores);
      setLocationOptions(filteredLocations);
    } else {
      setStoreOptions([]);
      setLocationOptions([]);
    }
  }, [asset, userState.user]);

  // Auto-select store/location from asset data when operation changes
  useEffect(() => {
    if (asset && selectedOperation) {
      // For ISSUE: from current store to current store location
      // For RETURN: from current location to current store
      if (selectedOperation === 'ISSUE') {
        // Auto-select current store as "from store"
        const currentStore = storeOptions.find(store => store.value === asset.OBJ_STORE);
        if (currentStore && !selectedStore) {
          onStoreChange(currentStore);
        }
        // Auto-select current location as "to location" (current store location)
        const currentLocation = locationOptions.find(location => location.value === asset.OBJ_LOCATION);
        if (currentLocation && !selectedLocation) {
          onLocationChange(currentLocation);
        }
      } else if (selectedOperation === 'RETURN') {
        // Auto-select current location as "from location"
        const currentLocation = locationOptions.find(location => location.value === asset.OBJ_LOCATION);
        if (currentLocation && !selectedLocation) {
          onLocationChange(currentLocation);
        }
        // Auto-select current store as "to store"
        const currentStore = storeOptions.find(store => store.value === asset.OBJ_STORE);
        if (currentStore && !selectedStore) {
          onStoreChange(currentStore);
        }
      }
    }
  }, [selectedOperation, asset, storeOptions, locationOptions, selectedStore, selectedLocation, onStoreChange, onLocationChange]);

  const getStoreLabel = () => {
    if (!selectedOperation) return 'Select Store';
    return selectedOperation === 'ISSUE'
      ? 'From Store'
      : 'To Store';
  };

  const getLocationLabel = () => {
    if (!selectedOperation) return 'Select Location';
    return selectedOperation === 'ISSUE'
      ? 'To Location'
      : 'From Location';
  };

  const isStoreEditable = () => {
    if (!asset || !selectedOperation) return false;
    return selectedOperation === 'ISSUE' ? false : false; // Store is always auto-selected
  };

  const isLocationEditable = () => {
    if (!asset || !selectedOperation) return false;
    // For ISSUE operations, location is auto-selected (current store location)
    // For RETURN operations, location is always disabled (auto-selected)
    return false; // Location is always auto-selected
  };

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Store & Location Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Store Selection */}
        <div className="space-y-2">
          <Label htmlFor="store-select">{getStoreLabel()}</Label>
          <Select
            value={selectedStore?.value || ""}
            onValueChange={(value) => {
              const store = value ? storeOptions.find(s => s.value === value) || null : null;
              onStoreChange(store);
            }}
            disabled={!selectedOperation || !isStoreEditable()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {storeOptions.map((store) => (
                <SelectItem key={store.value} value={store.value}>
                  {store.option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedStore && (
            <p className="text-xs text-muted-foreground">
              Selected Store: {selectedStore.description}
            </p>
          )}
        </div>

        {/* Location Selection */}
        <div className="space-y-2">
          <Label htmlFor="location-select">{getLocationLabel()}</Label>
          <Select
            value={selectedLocation?.value || ""}
            onValueChange={(value) => {
              const location = value ? locationOptions.find(l => l.value === value) || null : null;
              onLocationChange(location);
            }}
            disabled={!selectedOperation || !isLocationEditable()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  {location.option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedLocation && (
            <p className="text-xs text-muted-foreground">
              Selected Location: {selectedLocation.description}
            </p>
          )}
        </div>

        {/* Validation Messages */}
        {selectedOperation && asset && (
          <Alert>
            <Warehouse className="h-4 w-4" />
            <AlertDescription>
              {selectedOperation === 'ISSUE' ? (
                <span>
                  Issue transaction: {asset.STR_DESC} → {selectedLocation?.description || 'Select Location'}
                </span>
              ) : (
                <span>
                  Return transaction: {selectedStore?.description || 'Select Store'} → {asset.LOC_DESC}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Warning - REMOVED: Expo app doesn't show this error, just disables controls */}
        {/* {asset && !asset._USERCLASS && selectedOperation === 'RETURN' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to modify store/location selections for this asset.
            </AlertDescription>
          </Alert>
        )} */}
      </CardContent>
    </Card>
  );
}