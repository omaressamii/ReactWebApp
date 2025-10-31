import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useToast } from '@/hooks/use-toast';
import {
  GetOneRequisition,
  getRequisitionParts,
  addRequisitionPart,
  updateRequisitionPart,
  deleteRequisitionPart,
  updateRequisition,
  resetMakeRequisition,
  DeleteRequisitionPartRequest
} from '@/redux/slices/requisitionSlice';
import { getParts, resetPart } from '@/redux/slices/searchSlice';
import {
  FileText,
  Package,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';

interface RequisitionPart {
  id: string;
  part_code: string;
  part_description: string;
  quantity_requested: number;
  quantity_issued?: number;
  status: string;
}

export default function RequisitionDetails() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userState = useAppSelector((state) => state.user);
  const requisitionState = useAppSelector((state) => state.requisition);
  const searchState = useAppSelector((state) => state.search);
  const { toast } = useToast();

  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<RequisitionPart | null>(null);
  const [partSearch, setPartSearch] = useState('');
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [partResults, setPartResults] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<string | null>(null);

  const requisition = requisitionState.selectedRequisition;
  const parts = requisitionState.requisitionParts;

  // Load requisition details on mount
  useEffect(() => {
    if (id) {
      dispatch(GetOneRequisition({
        user: userState.user,
        requisition: { requisition_code: id }
      }));
      dispatch(getRequisitionParts({ requisition: { requisition_code: id } as any }));
    }

    return () => {
      // No reset function available, so we'll just clear on unmount
    };
  }, [id, dispatch, userState.user]);

  // Update part search results
  useEffect(() => {
    setPartResults(searchState.parts ? [...searchState.parts] : []);
  }, [searchState.parts]);

  // Handle updateRequisition success/failure messages
  useEffect(() => {
    if (requisitionState.updateRequisitionIsDone === true) {
      toast({
        title: "Success",
        description: "Requisition status updated successfully",
        variant: "default",
      });
      // Reset the state and reload requisition details
      dispatch(resetMakeRequisition());
      if (id) {
        dispatch(GetOneRequisition({
          user: userState.user,
          requisition: { requisition_code: id }
        }));
      }
    } else if (requisitionState.updateRequisitionIsDone === false && requisitionState.updateRequisitionError) {
      toast({
        title: "Error",
        description: requisitionState.updateRequisitionError,
        variant: "destructive",
      });
    }
  }, [requisitionState.updateRequisitionIsDone, requisitionState.updateRequisitionError, toast, dispatch, id, userState.user]);

  // Handle part search
  const handlePartSearch = (value: string) => {
    setPartSearch(value);
    if (value.trim() && requisition) {
      dispatch(getParts({
        search: { value: value.trim(), fromStore: requisition.requisition_created_fromStoreId }
      }));
    } else {
      setPartResults([]);
    }
  };

  // Handle add part
  const handleAddPart = () => {
    if (!selectedPart || !quantity.trim()) {
      setErrors({ general: 'Please select a part and enter quantity' });
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setErrors({ quantity: 'Quantity must be a positive number' });
      return;
    }

    if (qty > selectedPart.BIS_QTY) {
      setErrors({ quantity: `Quantity cannot exceed available stock (${selectedPart.BIS_QTY})` });
      return;
    }

    const partData = {
      part: {
        requisitioncode: id,
        part: selectedPart.PAR_CODE,
        description: selectedPart.PAR_DESC,
        quantity: qty,
        organization: selectedPart.PAR_ORG,
        fromstore: requisition?.requisition_created_fromStoreId,
      } as any,
      user: userState.user,
    };

    dispatch(addRequisitionPart(partData));
    setShowAddPartDialog(false);
    resetPartForm();
  };

  // Handle update part
  const handleUpdatePart = () => {
    if (!editingPart || !quantity.trim()) {
      setErrors({ general: 'Please enter quantity' });
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setErrors({ quantity: 'Quantity must be a positive number' });
      return;
    }

    // Check if quantity exceeds available stock
    const availableStock = (editingPart as any).STO_QTY || (editingPart as any).BIS_QTY || 0;
    if (qty > availableStock) {
      setErrors({ quantity: `Quantity cannot exceed available stock (${availableStock})` });
      return;
    }

    // Format the part data as expected by the backend (matching InFor database fields)
    const updateData = {
      RQL_REQ: (editingPart as any).RQL_REQ,
      RQL_REQLINE: (editingPart as any).RQL_REQLINE,
      RQL_QTY: qty,
    };

    dispatch(updateRequisitionPart({ part: updateData as any }));
    setEditingPart(null);
    resetPartForm();
  };

  // Handle delete part
  const handleDeletePart = (partLine: string) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      // Find the part object to delete
      const partToDelete = parts?.find((p: any) => p.RQL_REQLINE === partLine);
      if (partToDelete) {
        // Format the part data as expected by the backend (matching Expo app)
        const deleteRequest: DeleteRequisitionPartRequest = {
          requisitionCode: partToDelete.RQL_REQ,
          partLine: partToDelete.RQL_REQLINE,
          partOrganization: partToDelete.RQL_PART_ORG,
        };

        dispatch(deleteRequisitionPart({
          part: deleteRequest,
          user: userState.user
        }));
      }
    }
  };

  // Handle status update - show confirmation dialog
  const handleStatusUpdate = (newStatus: string) => {
    setPendingStatusUpdate(newStatus);
    setShowStatusConfirmDialog(true);
  };

  // Confirm and execute status update
  const confirmStatusUpdate = () => {
    if (!pendingStatusUpdate || !id || !requisition) {
      return;
    }

    // Create sendRequisition object exactly like Expo app does
    const statusDescriptions: { [key: string]: string } = {
      'U': 'Unfinished',
      'P': 'Pending Approval',
      'A': 'Approved',
      'R': 'Rejected'
    };

    const sendRequisition = {
      requisition_code: requisition.requisition_code,
      requisition_description: requisition.requisition_description || '',
      recordid: "",
      // new status
      requisition_status_code: pendingStatusUpdate,
      requisition_status_desc: statusDescriptions[pendingStatusUpdate] || 'Unknown',
      // old status
      requisition_status_code_old: requisition.requisition_status_code,
      requisition_status_desc_old: requisition.requisition_status_desc || statusDescriptions[requisition.requisition_status_code] || 'Unknown',

      requisition_created_fromStoreId: requisition.requisition_created_fromStoreId,
      requisition_created_toStoreId: requisition.requisition_created_toStoreId,
      requisition_created_requistedById: requisition.requisition_created_requistedById,
      requisition_created_byId: requisition.requisition_created_byId,
      requisition_created_date: requisition.requisition_created_date,

      requisition_created_toOrganization: requisition.requisition_created_toOrganization,
      requisitionstatus_display: requisition.requisition_status_desc || statusDescriptions[requisition.requisition_status_code] || 'Unknown',
      requisition_reject_reason: pendingStatusUpdate === "R" ? "Rejected from web app" : "",
      user: userState.user,
    };

    dispatch(updateRequisition({
      requisition: sendRequisition,
      user: userState.user,
      ip: 'web-client-ip'
    }));

    setShowStatusConfirmDialog(false);
    setPendingStatusUpdate(null);
  };

  // Handle quantity input with validation
  const handleQuantityChange = (value: string, maxStock?: number) => {
    setQuantity(value);

    // Clear previous quantity errors
    if (errors.quantity) {
      setErrors(prev => ({ ...prev, quantity: undefined }));
    }

    // Real-time validation
    if (value.trim()) {
      const qty = parseFloat(value);
      if (isNaN(qty) || qty <= 0) {
        setErrors(prev => ({ ...prev, quantity: 'Quantity must be a positive number' }));
      } else if (maxStock !== undefined && qty > maxStock) {
        setErrors(prev => ({ ...prev, quantity: `Quantity cannot exceed available stock (${maxStock})` }));
      }
    }
  };

  // Reset part form
  const resetPartForm = () => {
    setPartSearch('');
    setSelectedPart(null);
    setQuantity('');
    setErrors({});
    dispatch(resetPart());
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'unfinished': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user can edit
  const canEdit = () => {
    if (!requisition || !userState.user) return false;

    // Creator can edit if status is unfinished
    if (requisition.requisition_created_byId === userState.user.USR_CODE &&
        requisition.requisition_status_code === 'U') {
      return true;
    }

    // IT users can edit any requisition
    return userState.user.role === 'IT';
  };

  if (requisitionState.getRequisitionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading requisition details...</p>
        </div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Requisition not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Requisition {requisition.requisition_code}</h1>
          <p className="text-muted-foreground mt-1">{requisition.requisition_description}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/requisitions')}>
            Back to Requisitions
          </Button>
          {canEdit() && (
            <Select onValueChange={handleStatusUpdate} defaultValue={requisition.requisition_status_code}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="U">Unfinished</SelectItem>
                <SelectItem value="P">Pending</SelectItem>
                <SelectItem value="A">Approved</SelectItem>
                <SelectItem value="R">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <Badge className={getStatusColor(requisition.requisition_status_desc)}>
          {requisition.requisition_status_desc}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          Created: {new Date(requisition.requisition_created_date || '').toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requisition Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Requisition Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <p className="text-sm text-muted-foreground">{requisition.requisition_created_byName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Requested By</Label>
                  <p className="text-sm text-muted-foreground">{requisition.requisition_created_requistedByDesc}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">From Store</Label>
                  <p className="text-sm text-muted-foreground">
                    {requisition.requisition_created_fromStoreDesc} ({requisition.requisition_created_fromStoreId})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">To Store</Label>
                  <p className="text-sm text-muted-foreground">
                    {requisition.requisition_created_toStoreDesc} ({requisition.requisition_created_toStoreId})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Organization</Label>
                  <p className="text-sm text-muted-foreground">{requisition.requisition_created_toOrganization}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User Group</Label>
                  <p className="text-sm text-muted-foreground">{requisition.requisition_created_byId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parts List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Parts ({parts?.length || 0})
                </CardTitle>
                {canEdit() && (
                  <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Part
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Part to Requisition</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="partSearch">Search Part</Label>
                          <Input
                            id="partSearch"
                            placeholder="Search by part code or description..."
                            value={partSearch}
                            onChange={(e) => handlePartSearch(e.target.value)}
                          />
                        </div>

                        {partResults.length > 0 && (
                          <div className="space-y-2">
                            <Label>Search Results</Label>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {partResults.map((part) => (
                                <div
                                  key={part.PAR_CODE}
                                  className={`p-2 rounded cursor-pointer hover:bg-muted ${
                                    selectedPart?.PAR_CODE === part.PAR_CODE ? 'bg-primary/10 border border-primary' : ''
                                  }`}
                                  onClick={() => setSelectedPart(part)}
                                >
                                  <div className="font-medium">{part.PAR_CODE}</div>
                                  <div className="text-sm text-muted-foreground">{part.PAR_DESC}</div>
                                  <div className="text-xs text-muted-foreground">Available: {part.BIS_QTY}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedPart && (
                          <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="font-medium">Selected: {selectedPart.PAR_DESC}</div>
                              <div className="text-sm text-muted-foreground">Code: {selectedPart.PAR_CODE}</div>
                              <Badge variant="outline" className="mt-1">
                                Available: {selectedPart.BIS_QTY}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantity</Label>
                              <Input
                                id="quantity"
                                type="number"
                                placeholder="Enter quantity"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(e.target.value, selectedPart?.BIS_QTY)}
                                min="1"
                                max={selectedPart?.BIS_QTY}
                              />
                              {errors.quantity && (
                                <p className="text-sm text-destructive">{errors.quantity}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {errors.general && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errors.general}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-3 justify-end">
                          <Button variant="outline" onClick={() => {
                            setShowAddPartDialog(false);
                            resetPartForm();
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddPart} disabled={!selectedPart || !quantity.trim()}>
                            Add Part
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {parts && parts.length > 0 ? (
                <div className="space-y-3">
                  {parts.map((part: any) => (
                    <div key={part.RQL_REQLINE} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{part.PAR_DESC || part.RQL_PART}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {part.RQL_PART} | Requested: {part.RQL_QTY}
                          {part.STO_QTY && ` | In Stock: ${part.STO_QTY}`}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {part.RQL_STATUS}
                        </Badge>
                      </div>
                      {canEdit() && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingPart(part);
                              setQuantity(part.RQL_QTY?.toString() || '0');
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePart(part.RQL_REQLINE)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No parts added to this requisition yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Created</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(requisition.requisition_created_date || '').toLocaleString()}
                    </div>
                  </div>
                </div>
                {/* Add more status history items as available */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Part Dialog */}
      {editingPart && (
        <Dialog open={!!editingPart} onOpenChange={() => setEditingPart(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Part Quantity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{editingPart.part_description}</div>
                <div className="text-sm text-muted-foreground">Code: {editingPart.part_code}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editQuantity">Quantity</Label>
                <Input
                  id="editQuantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value, (editingPart as any)?.STO_QTY || (editingPart as any)?.BIS_QTY)}
                  min="1"
                  max={(editingPart as any)?.STO_QTY || (editingPart as any)?.BIS_QTY}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity}</p>
                )}
              </div>

              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => {
                  setEditingPart(null);
                  resetPartForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePart}>
                  Update Part
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Update Confirmation Dialog */}
      <AlertDialog open={showStatusConfirmDialog} onOpenChange={setShowStatusConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the requisition status to{' '}
              <span className="font-semibold">
                {pendingStatusUpdate === 'U' ? 'Unfinished' :
                 pendingStatusUpdate === 'P' ? 'Pending Approval' :
                 pendingStatusUpdate === 'A' ? 'Approved' :
                 pendingStatusUpdate === 'R' ? 'Rejected' : 'Unknown'}
              </span>
              ?
              {pendingStatusUpdate === 'R' && (
                <span className="block mt-2 text-red-600">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowStatusConfirmDialog(false);
              setPendingStatusUpdate(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusUpdate}
              disabled={requisitionState.updateRequisitionLoading}
              className={pendingStatusUpdate === 'R' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {requisitionState.updateRequisitionLoading ? 'Updating...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
