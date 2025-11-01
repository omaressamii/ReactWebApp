import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Package, Scan, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAsset, resetGetAsset } from '@/redux/slices/issueReturnSlice';

interface AssetLookupProps {
  assetCode: string;
  setAssetCode: (code: string) => void;
  user: any; // User data from Redux store
  selectedOperation?: 'ISSUE' | 'RETURN' | null;
  t?: (key: string) => string;
}

export default function AssetLookup({
  assetCode,
  setAssetCode,
  user,
  selectedOperation,
  t = (key: string) => key // Default to identity function
}: AssetLookupProps) {
  const dispatch = useAppDispatch();
  const { getAsset: assets, getAssetLoading, getAssetError } = useAppSelector(
    (state) => state.issueReturn
  );

  const [isValidCode, setIsValidCode] = useState(false);

  const validateAssetCode = (code: string) => {
    // Asset codes should be numeric and not empty
    const isValid = /^\d+$/.test(code) && code.length > 0;
    setIsValidCode(isValid);
    return isValid;
  };

  const handleAssetCodeChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setAssetCode(numericValue);
    validateAssetCode(numericValue);
  };

  const handleSearch = async () => {
    if (!validateAssetCode(assetCode)) {
      return;
    }

    const request = {
      user: user,
      asset: {
        assetCode: assetCode,
      },
    };

    dispatch(getAsset(request));
  };

  const handleClear = () => {
    setAssetCode('');
    setIsValidCode(false);
    dispatch(resetGetAsset());
  };

  const asset = assets?.[0];

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Asset Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asset Code Input */}
        <div className="space-y-2">
          <Label htmlFor="assetCode">Asset Code</Label>
          <div className="flex gap-2">
            <Input
              id="assetCode"
              type="text"
              value={assetCode}
            onChange={(e) => handleAssetCodeChange(e.target.value)}
            placeholder="Enter asset code"
            className="flex-1"
            maxLength={20}
          />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              title="Scan barcode"
            >
              <Scan className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={!isValidCode || getAssetLoading}
            className="flex-1 gradient-primary"
          >
            <Search className="w-4 h-4 mr-2" />
            {getAssetLoading ? 'Loading...' : 'Search'}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!assetCode && !asset}
          >
            Clear
          </Button>
        </div>

        {/* Error Display */}
        {getAssetError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getAssetError}</AlertDescription>
          </Alert>
        )}

        {/* Asset Details */}
        {asset && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm">Asset Details</h4>
            <div className="space-y-3">
              {/* Primary Status and Location */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Current Status:</span>
                <span className={`font-semibold px-2 py-1 rounded text-xs ${
                  asset.OBJ_STATUS === 'T' ? 'bg-orange-100 text-orange-800' :
                  asset.OBJ_STATUS === 'C' ? 'bg-green-100 text-green-800' :
                  asset.OBJ_STATUS === 'B' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {asset.OBJ_STATUS === 'T' ? 'In Transit' :
                   asset.OBJ_STATUS === 'C' ? 'Available' :
                   asset.OBJ_STATUS === 'B' ? 'In Use' :
                   asset.OBJ_STATUS || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">
                  {selectedOperation === 'ISSUE' ? 'Current Store:' : 'Current Location:'}
                </span>
                <span className="font-semibold text-sm">
                  {selectedOperation === 'ISSUE'
                    ? (asset.OBJ_STORE ? `${asset.OBJ_STORE} (${asset.STR_DESC || 'Store'})` : 'Not Assigned')
                    : (asset.OBJ_LOCATION ? `${asset.OBJ_LOCATION} (${asset.LOC_DESC || 'Location'})` :
                       asset.OBJ_STORE ? `${asset.OBJ_STORE} (${asset.STR_DESC || 'Store'})` :
                       'Not Assigned')
                  }
                </span>
              </div>

              {/* Additional Asset Details */}
              <div className="border-t pt-3 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Asset Code:</span>
                    <div className="font-medium">{asset.OBJ_CODE}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Part Code:</span>
                    <div className="font-medium">{asset.OBJ_PART}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Transaction Type:</span>
                    <div className="font-medium">{asset.OBJ_TRAN_TYPE || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Part Bin:</span>
                    <div className="font-medium">{asset.OBJ_BIN || '*'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Part Lot:</span>
                    <div className="font-medium">{asset.OBJ_LOT || '*'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Organization:</span>
                    <div className="font-medium">{asset.STR_ORG || asset.LOC_ORG || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}