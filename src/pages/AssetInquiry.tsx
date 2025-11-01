import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDispatch, useSelector } from 'react-redux';
import { Search, MapPin, Package, Building, AlertTriangle, CheckCircle, Printer, Edit, Save, X } from 'lucide-react';
import { findAsset, resetFindAsset } from '../redux/slices/searchSlice';
import { updateAssetInquiryDetails, updateAssetPrintDataInquiry, AssetInventoryLocationAction } from '../redux/slices/assetInventoryLocationSlice';
import { AppDispatch } from '../redux/store';
import { useToast } from '@/hooks/use-toast';

// Asset interface matching backend response structure
interface Asset {
  OBJ_CODE: string;           // Asset Code
  OBJ_PART?: string;          // Part Number
  OBJ_DESC?: string;          // Description
  OBJ_LOCATION?: string;      // Location Code
  LOC_DESC?: string;          // Location Description
  OBJ_STORE?: string;         // Store Code
  STR_DESC?: string;          // Store Description
  OBJ_TRAN_TYPE: string;      // Status Type (In Location/In Store/In Transite)
  OBJ_ORG?: string;           // Organization
  OBJ_CLASS?: string;         // Asset Class
  OBJ_MRC?: string;           // Department Code
  MRC_DESC?: string;          // Department Description
  OBJ_BIN?: string;           // Bin (nullable)
  OBJ_LOT?: string;           // Lot (nullable)
  OBJ_STATE?: string;         // State (nullable)
  OBJ_SERIALNO?: string;      // Serial Number (nullable)
  STR_ORG?: string;           // Store Organization
  LOC_ORG?: string;           // Location Organization
}

// Edited values interface
interface EditedValues {
  objBin: string;
  objLot: string;
  objState: string;
  objSerialNo: string;
  selectedLocation: { value: string; org: string; desc: string } | null;
  selectedStore: { value: string; org: string; desc: string } | null;
  locationOrStore: 'location' | 'store';
}

export default function AssetInquiry() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // Redux state
  const { user } = useSelector((state: any) => state.user);
  const {
    findAsset: findAssetData,
    findAssetLoading,
    findAssetError,
    findAssetIsDone
  } = useSelector((state: any) => state.search);
  const {
    updateAssetInquiryDetailsLoading,
    updateAssetInquiryDetailsError,
    updateAssetInquiryDetailsIsDone
  } = useSelector((state: any) => state.assetInventoryLocation);

  // Local state
  const [assetCode, setAssetCode] = useState('');
  const [asset, setAsset] = useState<Asset | null>(null);

  // Editing state
  const [editedValues, setEditedValues] = useState<EditedValues>({
    objBin: '',
    objLot: '',
    objState: '',
    objSerialNo: '',
    selectedLocation: null,
    selectedStore: null,
    locationOrStore: 'location'
  });
  const [showEditForm, setShowEditForm] = useState(false);

  // Permission check - requires both checkbox and Edit field
  const hasEditPermission = useMemo(() => {
    return user?.USR_UDFCHKBOX01 === "+" && parseFloat(user?.Edit || 0) === 1;
  }, [user]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to search
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && assetCode.trim()) {
        e.preventDefault();
        handleSearch();
      }

      // Ctrl/Cmd + S to save (when editing)
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && showEditForm) {
        e.preventDefault();
        handleSaveAssetDetails();
      }

      // Ctrl/Cmd + P to send asset to database (when asset is loaded)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && asset) {
        e.preventDefault();
        handlePrintAsset();
      }

      // Escape to close edit form
      if (e.key === 'Escape' && showEditForm) {
        setShowEditForm(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [assetCode, showEditForm, asset]);

  // Reset form and state
  const resetForm = () => {
    setAssetCode('');
    setAsset(null);
    setEditedValues({
      objBin: '',
      objLot: '',
      objState: '',
      objSerialNo: '',
      selectedLocation: null,
      selectedStore: null,
      locationOrStore: 'location'
    });
    setShowEditForm(false);
    dispatch(resetFindAsset());
    dispatch(AssetInventoryLocationAction.resetUpdateAssetInquiryDetails());
  };

  // Handle asset search
  const handleSearch = async () => {
    if (!assetCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an asset code",
        variant: "destructive",
      });
      return;
    }

    console.log('🔍 [AssetInquiry] Starting asset search', {
      assetCode: assetCode.trim(),
      userCode: user?.USR_CODE
    });

    try {
      const result = await dispatch(findAsset({ assetCode: assetCode.trim() }));

      if (findAsset.fulfilled.match(result)) {
        console.log('✅ [AssetInquiry] Search successful', {
          assetCode: assetCode.trim(),
          returnedAsset: result.payload.asset
        });
        setAsset(result.payload.asset || null);
        setAssetCode(''); // Clear input after successful search
      } else if (findAsset.rejected.match(result)) {
        console.warn('⚠️ [AssetInquiry] Search failed', {
          assetCode: assetCode.trim(),
          error: (result.payload as any)?.error
        });
        setAsset(null);
        toast({
          title: "Search Failed",
          description: (result.payload as any)?.error || "Asset not found",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ [AssetInquiry] Search error', error);
      setAsset(null);
      toast({
        title: "Error",
        description: "An error occurred while searching for the asset",
        variant: "destructive",
      });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle save asset details
  const handleSaveAssetDetails = async () => {
    if (!asset) return;

    // Validation: at least one field must be filled
    const hasDataToSave = editedValues.objBin || editedValues.objLot ||
                         editedValues.objState || editedValues.objSerialNo ||
                         editedValues.selectedLocation || editedValues.selectedStore;

    if (!hasDataToSave) {
      toast({
        title: "Validation Error",
        description: "At least one field must be filled to save",
        variant: "destructive",
      });
      return;
    }

    // Validation: objState cannot be empty if being updated
    if (editedValues.objState && editedValues.objState.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Asset state cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const saveData = {
      assetCode: asset.OBJ_CODE,
      objBin: editedValues.objBin || null,
      objLot: editedValues.objLot || null,
      objState: editedValues.objState || null,
      objSerialNo: editedValues.objSerialNo || null,
      objLocation: editedValues.selectedLocation?.value || null,
      objLocationOrg: editedValues.selectedLocation?.org || null,
      objStore: editedValues.selectedStore?.value || null,
      objStoreOrg: editedValues.selectedStore?.org || null,
      userCode: user?.USR_CODE || ''
    };

    console.log('💾 [AssetInquiry] Saving asset details', saveData);

    try {
      const result = await dispatch(updateAssetInquiryDetails(saveData));

      if (updateAssetInquiryDetails.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Asset details saved successfully",
          variant: "default",
        });

        // Reset edited values
        setEditedValues({
          objBin: '',
          objLot: '',
          objState: '',
          objSerialNo: '',
          selectedLocation: null,
          selectedStore: null,
          locationOrStore: 'location'
        });
        setShowEditForm(false);

        // Refresh asset data
        await handleSearch();
      } else {
        toast({
          title: "Save Failed",
          description: (result.payload as any)?.error || "Failed to save asset details",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ [AssetInquiry] Save error', error);
      toast({
        title: "Error",
        description: "An error occurred while saving asset details",
        variant: "destructive",
      });
    }
  };

  // Handle send asset to database
  const handlePrintAsset = async () => {
    if (!asset) return;

    try {
      const printData = {
        assetCode: asset.OBJ_CODE,
        userCode: user?.USR_CODE || ''
      };

      console.log('🖨️ [AssetInquiry] Sending asset to database', printData);

      const result = await dispatch(updateAssetPrintDataInquiry(printData));

      if (updateAssetPrintDataInquiry.fulfilled.match(result)) {
        toast({
          title: "Print Success",
          description: "Asset print data sent to database successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Print Failed",
          description: (result.payload as any)?.error || "Failed to send asset print data to database",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ [AssetInquiry] Print error', error);
      toast({
        title: "Print Error",
        description: "An error occurred while processing the print request",
        variant: "destructive",
      });
    }
  };

  // Get status color based on asset state
  const getStatusColor = (tranType: string) => {
    switch (tranType) {
      case 'In Location':
        return 'bg-green-100 text-green-800';
      case 'In Store':
        return 'bg-blue-100 text-blue-800';
      case 'In Transite':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon based on asset state
  const getStatusIcon = (tranType: string) => {
    switch (tranType) {
      case 'In Location':
        return <MapPin className="w-4 h-4" />;
      case 'In Store':
        return <Building className="w-4 h-4" />;
      case 'In Transite':
        return <Package className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Asset Inquiry</h1>
        <p className="text-muted-foreground mt-1">
          Search and view detailed asset information
        </p>
      </div>

      {/* Search Section */}
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Asset Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter asset code... (Ctrl+Enter to search)"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-input border-border"
                disabled={findAssetLoading}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={findAssetLoading || !assetCode.trim()}
              className="min-w-[120px]"
            >
              {findAssetLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={findAssetLoading}
            >
              Clear
            </Button>
          </div>

          {/* Search Status Messages */}
          {findAssetIsDone === true && asset && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Asset found successfully
              </AlertDescription>
            </Alert>
          )}

          {findAssetIsDone === false && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {findAssetError || "Asset not found"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Asset Details Section */}
      {asset && (
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Asset Details
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(asset.OBJ_TRAN_TYPE)} flex items-center gap-1`}>
                  {getStatusIcon(asset.OBJ_TRAN_TYPE)}
                  {asset.OBJ_TRAN_TYPE}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintAsset}
                  disabled={!asset}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Asset Code</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{asset.OBJ_CODE}</p>
              </div>

              {asset.OBJ_PART && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Part Number</label>
                  <p className="text-sm">{asset.OBJ_PART}</p>
                </div>
              )}

              {asset.OBJ_DESC && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{asset.OBJ_DESC}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Location/Store Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location & Store Information</h3>

              {asset.OBJ_LOCATION && asset.LOC_DESC && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">In Location</p>
                    <p className="text-sm text-blue-700">{asset.LOC_DESC} [{asset.OBJ_LOCATION}]</p>
                  </div>
                </div>
              )}

              {asset.OBJ_STORE && asset.STR_DESC && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Building className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">In Store</p>
                    <p className="text-sm text-green-700">{asset.STR_DESC} [{asset.OBJ_STORE}]</p>
                  </div>
                </div>
              )}

              {asset.OBJ_TRAN_TYPE === 'In Transite' && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Package className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Asset Status</p>
                    <p className="text-sm text-yellow-700">الأصل في حالة نقل</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {asset.OBJ_TRAN_TYPE !== 'In Transite' && asset.OBJ_ORG && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Organization</label>
                  <p className="text-sm">{asset.OBJ_ORG}</p>
                </div>
              )}

              {asset.OBJ_TRAN_TYPE !== 'In Transite' && asset.OBJ_CLASS && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Asset Class</label>
                  <p className="text-sm">{asset.OBJ_CLASS}</p>
                </div>
              )}

              {asset.OBJ_MRC && asset.MRC_DESC && asset.OBJ_LOCATION && asset.LOC_DESC && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{asset.MRC_DESC} [{asset.OBJ_MRC}]</p>
                </div>
              )}

              {asset.OBJ_STORE && asset.STR_DESC && asset.STR_ORG && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Store Organization</label>
                  <p className="text-sm">{asset.STR_ORG}</p>
                </div>
              )}
            </div>

            {/* Edit Permission Notice & Form */}
            {hasEditPermission && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Edit Missing Details</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEditForm(!showEditForm)}
                  >
                    {showEditForm ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                    {showEditForm ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                {showEditForm && (
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4 space-y-4">
                      {/* Location/Store Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Location or Store</label>
                        <div className="flex gap-2">
                          <Button
                            variant={editedValues.locationOrStore === 'location' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEditedValues(prev => ({
                              ...prev,
                              locationOrStore: 'location',
                              selectedStore: null
                            }))}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Location
                          </Button>
                          <Button
                            variant={editedValues.locationOrStore === 'store' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEditedValues(prev => ({
                              ...prev,
                              locationOrStore: 'store',
                              selectedLocation: null
                            }))}
                          >
                            <Building className="w-4 h-4 mr-2" />
                            Store
                          </Button>
                        </div>

                        {/* Location Dropdown */}
                        {editedValues.locationOrStore === 'location' && (
                          <Select
                            value={editedValues.selectedLocation?.value || ''}
                            onValueChange={(value) => {
                              const location = user?.userLocations?.find((loc: any) => loc.LOC_CODE === value);
                              if (location) {
                                setEditedValues(prev => ({
                                  ...prev,
                                  selectedLocation: {
                                    value: location.LOC_CODE,
                                    org: location.LOC_ORG,
                                    desc: location.LOC_DESC
                                  }
                                }));
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose location..." />
                            </SelectTrigger>
                            <SelectContent>
                              {user?.userLocations?.map((location: any) => (
                                <SelectItem key={location.LOC_CODE} value={location.LOC_CODE}>
                                  {location.LOC_DESC} [{location.LOC_CODE}]
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {/* Store Dropdown */}
                        {editedValues.locationOrStore === 'store' && (
                          <Select
                            value={editedValues.selectedStore?.value || ''}
                            onValueChange={(value) => {
                              const store = user?.userStores?.find((str: any) => str.STR_CODE === value);
                              if (store) {
                                setEditedValues(prev => ({
                                  ...prev,
                                  selectedStore: {
                                    value: store.STR_CODE,
                                    org: store.STR_ORG,
                                    desc: store.STR_DESC
                                  }
                                }));
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose store..." />
                            </SelectTrigger>
                            <SelectContent>
                              {user?.userStores?.map((store: any) => (
                                <SelectItem key={store.STR_CODE} value={store.STR_CODE}>
                                  {store.STR_DESC} [{store.STR_CODE}]
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Editable Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* BIN - editable if missing or '*' */}
                        {(!asset.OBJ_BIN || asset.OBJ_BIN === '*') && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Bin Number</label>
                            <Input
                              value={editedValues.objBin}
                              onChange={(e) => setEditedValues(prev => ({ ...prev, objBin: e.target.value }))}
                              placeholder="Enter bin number"
                            />
                          </div>
                        )}

                        {/* LOT - editable if missing */}
                        {!asset.OBJ_LOT && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Lot Number</label>
                            <Input
                              value={editedValues.objLot}
                              onChange={(e) => setEditedValues(prev => ({ ...prev, objLot: e.target.value }))}
                              placeholder="Enter lot number"
                            />
                          </div>
                        )}

                        {/* STATE - editable if missing */}
                        {!asset.OBJ_STATE && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Asset State *</label>
                            <Input
                              value={editedValues.objState}
                              onChange={(e) => setEditedValues(prev => ({ ...prev, objState: e.target.value }))}
                              placeholder="Enter asset state"
                              required
                            />
                          </div>
                        )}

                        {/* SERIAL NUMBER - editable if missing */}
                        {!asset.OBJ_SERIALNO && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Serial Number</label>
                            <Input
                              value={editedValues.objSerialNo}
                              onChange={(e) => setEditedValues(prev => ({ ...prev, objSerialNo: e.target.value }))}
                              placeholder="Enter serial number"
                            />
                          </div>
                        )}
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowEditForm(false)}
                          disabled={updateAssetInquiryDetailsLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveAssetDetails}
                          disabled={updateAssetInquiryDetailsLoading}
                        >
                          {updateAssetInquiryDetailsLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {findAssetLoading && (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-[200px]" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!asset && !findAssetLoading && findAssetIsDone === null && (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Enter an asset code above to search for asset details</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
