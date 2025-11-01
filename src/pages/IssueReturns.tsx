import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCcw, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { resetMakePartIssue, resetMakePartReturn, makePartIssue, makePartReturn, resetGetAsset } from '@/redux/slices/issueReturnSlice';

// Import our new components
import OperationSelector from '@/components/issue-return/OperationSelector';
import AssetLookup from '@/components/issue-return/AssetLookup';
import StoreLocationSelector from '@/components/issue-return/StoreLocationSelector';

interface StoreLocationOption {
  option: string;
  value: string;
  organization: string;
  description: string;
}

export default function IssueReturns() {
  const dispatch = useAppDispatch();

  // Redux state
  const userState = useAppSelector((state) => state.user);
  const issueReturnState = useAppSelector((state) => state.issueReturn);

  // Local state
  const [selectedOperation, setSelectedOperation] = useState<'ISSUE' | 'RETURN' | null>(null);
  const [assetCode, setAssetCode] = useState('');
  const [selectedStore, setSelectedStore] = useState<StoreLocationOption | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<StoreLocationOption | null>(null);
  const [operationMismatchError, setOperationMismatchError] = useState<string | null>(null);
  const [locationStatusError, setLocationStatusError] = useState<string | null>(null);

  // Get current asset from Redux state
  const asset = issueReturnState.getAsset?.[0];

  // Validate operation type matches asset's transaction type (like Expo app)
  useEffect(() => {
    if (asset && selectedOperation) {
      const assetTransactionType = asset.OBJ_TRAN_TYPE;
      console.log('🔍 [Validation] Asset OBJ_TRAN_TYPE:', assetTransactionType, 'Selected operation:', selectedOperation);

      if (selectedOperation !== assetTransactionType) {
        const errorMessage = `Operation mismatch: Selected ${selectedOperation} but asset requires ${assetTransactionType} operation. Transaction cannot proceed - please select the correct operation type.`;
        console.log('❌ [Validation] Operation mismatch detected:', errorMessage);
        setOperationMismatchError(errorMessage);
        
        // Clear the asset to allow selecting a different one (like Expo app)
        dispatch(resetGetAsset());
        setAssetCode('');
        setSelectedStore(null);
        setSelectedLocation(null);
      } else {
        console.log('✅ [Validation] Operation matches asset transaction type');
        setOperationMismatchError(null);
      }
    }
  }, [asset, selectedOperation, dispatch]);

  // Validate asset location and status (must be in store or location, not in transit)
  useEffect(() => {
    if (asset) {
      const hasValidLocation = asset.OBJ_STORE !== null && asset.OBJ_STORE !== '' || 
                              asset.OBJ_LOCATION !== null && asset.OBJ_LOCATION !== '';
      const isNotInTransit = asset.OBJ_STATUS !== 'T';
      
      console.log('🔍 [Location Validation] Asset location check:', {
        objStore: asset.OBJ_STORE,
        objLocation: asset.OBJ_LOCATION,
        objStatus: asset.OBJ_STATUS,
        hasValidLocation,
        isNotInTransit
      });
      
      if (!hasValidLocation || !isNotInTransit) {
        let errorMessage = 'Asset location/status validation failed: ';
        if (!hasValidLocation) {
          errorMessage += 'Asset must be in a Store or Location. ';
        }
        if (!isNotInTransit) {
          errorMessage += 'Asset is in transit and cannot be processed. ';
        }
        console.log('❌ [Location Validation] Asset invalid:', errorMessage);
        setLocationStatusError(errorMessage);
        
        // Clear the asset to prevent invalid transactions
        dispatch(resetGetAsset());
        setAssetCode('');
        setSelectedStore(null);
        setSelectedLocation(null);
      } else {
        console.log('✅ [Location Validation] Asset is in valid location and status');
        setLocationStatusError(null);
      }
    }
  }, [asset, dispatch]);

  // Validation
  const isFormValid = () => {
    if (!selectedOperation || !asset) return false;
    if (locationStatusError) return false; // Prevent submission when asset is in invalid location/status
    if (operationMismatchError) return false; // Prevent submission when operation doesn't match asset type
    
    // Allow submission even with operation mismatch since backend overrides OBJ_TRAN_TYPE

    if (selectedOperation === 'ISSUE') {
      return !!(selectedStore?.value && selectedLocation?.value);
    } else {
      return !!(selectedStore?.value && selectedLocation?.value);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isFormValid() || !asset) return;

    // Prepare request data matching backend expectations
    const requestData = {
      user: userState.user,
      part: {
        ...asset,
        OBJ_TRAN_TYPE: selectedOperation, // Override with selected operation (like Expo app)
        OBJ_LOCATION: selectedLocation?.value,
        LOC_DESC: selectedLocation?.description,
        OBJ_STORE: selectedStore?.value,
        STR_DESC: selectedStore?.description,
        STR_ORG: selectedStore?.organization,
        LOC_ORG: selectedLocation?.organization,
      },
    };

    // Replace null values for OBJ_BIN and OBJ_LOT with '*' to allow successful processing
    if (requestData.part.OBJ_BIN == null || requestData.part.OBJ_BIN === '') {
      requestData.part.OBJ_BIN = '*';
    }
    if (requestData.part.OBJ_LOT == null || requestData.part.OBJ_LOT === '') {
      requestData.part.OBJ_LOT = '*';
    }

    // Dispatch the appropriate action based on selectedOperation
    if (selectedOperation === 'ISSUE') {
      dispatch(makePartIssue(requestData));
    } else {
      dispatch(makePartReturn(requestData));
    }
  };

  // Handle operation change - reset form
  const handleOperationChange = (operation: 'ISSUE' | 'RETURN') => {
    setSelectedOperation(operation);
    // Reset form when operation changes
    setAssetCode('');
    setSelectedStore(null);
    setSelectedLocation(null);
    setOperationMismatchError(null);
    setLocationStatusError(null);
    dispatch(resetMakePartIssue());
    dispatch(resetMakePartReturn());
    dispatch(resetGetAsset());
  };

  // Check if user has permission for Issue Return Parts
  const hasPermission = () => {
    // TODO: Implement proper permission checking based on user role and screens
    return userState.isAuthenticated;
  };

  if (!hasPermission()) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access Issue Return Parts.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Issue Return Parts</h1>
          <p className="text-muted-foreground mt-1">
            Process asset issue and return transactions between stores and locations
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedOperation(null);
            setAssetCode('');
            setSelectedStore(null);
            setSelectedLocation(null);
            dispatch(resetMakePartIssue());
            dispatch(resetMakePartReturn());
          }}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Operation Type Selection */}
      <OperationSelector
        selectedOperation={selectedOperation}
        onSelectOperation={handleOperationChange}
        t={(key: string) => key} // Placeholder translation function
      />

      {/* Main Form - Only show when operation is selected */}
      {selectedOperation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <AssetLookup
              assetCode={assetCode}
              setAssetCode={setAssetCode}
              user={userState.user}
              selectedOperation={selectedOperation}
              t={(key: string) => key} // Placeholder translation function
            />

            {asset && (
              <StoreLocationSelector
                selectedOperation={selectedOperation}
                selectedStore={selectedStore}
                selectedLocation={selectedLocation}
                onStoreChange={setSelectedStore}
                onLocationChange={setSelectedLocation}
                t={(key: string) => key} // Placeholder translation function
              />
            )}
          </div>

          {/* Right Column - Transaction Summary */}
          <div className="space-y-6">
            {asset && (
              <Card className="gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Transaction Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Operation:</span>
                      <p className="font-medium">{selectedOperation === 'ISSUE' ? 'Issue' : 'Return'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Asset Code:</span>
                      <p className="font-medium">{asset.OBJ_CODE}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Part Code:</span>
                      <p className="font-medium">{asset.OBJ_PART}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{selectedOperation === 'ISSUE' ? 'From Store:' : 'From Location:'}</span>
                      <p className="font-medium">{selectedOperation === 'ISSUE' ? (selectedStore?.description || asset.STR_DESC) : (selectedLocation?.description || asset.LOC_DESC)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{selectedOperation === 'ISSUE' ? 'To Location:' : 'To Store:'}</span>
                      <p className="font-medium">{selectedOperation === 'ISSUE' ? (selectedLocation?.description || asset.LOC_DESC) : (selectedStore?.description || asset.STR_DESC)}</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || issueReturnState.makePartIssueLoading || issueReturnState.makePartReturnLoading}
                    className="w-full gradient-primary"
                    size="lg"
                  >
                    {issueReturnState.makePartIssueLoading || issueReturnState.makePartReturnLoading ? (
                      'Processing...'
                    ) : (
                      'Submit Transaction'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            {locationStatusError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {locationStatusError}
                </AlertDescription>
              </Alert>
            )}

            {operationMismatchError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {operationMismatchError}
                </AlertDescription>
              </Alert>
            )}

            {(issueReturnState.makePartIssueError || issueReturnState.makePartReturnError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {issueReturnState.makePartIssueError || issueReturnState.makePartReturnError}
                </AlertDescription>
              </Alert>
            )}

            {(issueReturnState.makePartIssueIsDone || issueReturnState.makePartReturnIsDone) && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {selectedOperation === 'ISSUE'
                    ? 'Asset issued successfully'
                    : 'Asset returned successfully'
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
