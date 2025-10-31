import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Upload, Camera, X, Bug, Package, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { makeIssue, resetMakeIssue, Requisition } from '@/redux/slices/issueSlice';
import { AppDispatch } from '@/redux/store';

export default function CreateIssue() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Redux state
  const userState = useSelector((state: any) => state.user);
  const issueState = useSelector((state: any) => state.issue);

  // Local state
  const [issueDescription, setIssueDescription] = useState('');
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Initialize from navigation state (when coming from requisitions)
  useEffect(() => {
    if (location.state?.requisition) {
      const requisition = location.state.requisition;
      setSelectedRequisition(requisition);
      setIssueDescription(`إذن صرف : ${requisition.description || requisition.requisition_description || ''}`);
    }
  }, [location.state]);

  const handleFileUpload = (fileUrl: string, fileName: string) => {
    // For now, just store the file name - in a real implementation,
    // you'd handle the uploaded file URL
    const mockFile = new File([''], fileName, { type: 'image/jpeg' });
    setUploadedFiles([mockFile]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!issueDescription.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an issue description',
        variant: 'destructive',
      });
      return false;
    }

    if (!selectedRequisition) {
      toast({
        title: 'Validation Error',
        description: 'Please select a requisition',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Get client IP (in web app, we'll use a different approach)
      const ip = '127.0.0.1'; // Web apps don't have direct IP access like mobile

      const request = {
        user: userState.user,
        ip: ip,
        issue: {
          issueCode: '',
          issueDescription: issueDescription,
          transactionstatus_display: 'Unfinished',
          transactionrstatus: 'U',
          transactionstatus: 'U',
          organization: selectedRequisition?.FromStoreOrg,
          fromStoreOrg: selectedRequisition?.FromStoreOrg,
          toStoreOrg: selectedRequisition?.ToStoreOrg,
        },
        requisition: selectedRequisition,
        document: {
          issuecode: '',
          image_entity: 'issue',
          documentInforType: 'TRAN',
          path: uploadedFiles.length > 0 ? uploadedFiles[0].name : '',
          type: uploadedFiles.length > 0 ? uploadedFiles[0].type : 'image/jpeg',
          name: uploadedFiles.length > 0 ? uploadedFiles[0].name : 'photo.jpg',
        },
        other: {
          selectedImage: uploadedFiles.length > 0 ? uploadedFiles[0] : null,
        },
      };

      const result = await dispatch(makeIssue(request)).unwrap();

      toast({
        title: 'Success',
        description: `Issue created successfully with code: ${result.issueCode}`,
      });

      // Reset the form state
      dispatch(resetMakeIssue());

      // Navigate to the created issue details
      navigate(`/issues/${result.issueCode}`, {
        state: { nav: true },
        replace: true
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.error || 'Failed to create issue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancel = () => {
    navigate('/issues');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Issues
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bug className="w-8 h-8 text-primary" />
            Create Issue
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new issue transaction from an approved requisition
          </p>
        </div>
      </div>

      {/* Error Display */}
      {issueState.makeIssueError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <span className="font-medium">Error:</span>
              <span>{issueState.makeIssueError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Form */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-primary" />
              Issue Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Requisition Selection */}
            <div className="space-y-2">
              <Label htmlFor="requisition">Selected Requisition</Label>
              {selectedRequisition ? (
                <Card className="p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{selectedRequisition.requisitioncode}</span>
                    <Badge className="bg-status-completed text-success-foreground">
                      Approved
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedRequisition.description || selectedRequisition.requisition_description}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground font-medium">
                      From: {selectedRequisition.fromstore}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="px-3 py-1 rounded-md bg-primary text-primary-foreground font-medium">
                      To: {selectedRequisition.tostore}
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No requisition selected</p>
                  <p className="text-sm">Please go back and select a requisition from the Issues page</p>
                </div>
              )}
            </div>

            {/* Issue Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Issue Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter issue description..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Describe the purpose and details of this issue transaction
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setUploadedFiles(files);
                    }}
                    className="flex-1"
                  />
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Uploaded Files:</Label>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Requisition:</span>
                <span className="font-medium">
                  {selectedRequisition?.requisitioncode || 'None selected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">From Store:</span>
                <span className="font-medium">
                  {selectedRequisition?.fromstore || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">To Store:</span>
                <span className="font-medium">
                  {selectedRequisition?.tostore || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Attachments:</span>
                <span className="font-medium">
                  {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  className="flex-1 gradient-primary"
                  disabled={!selectedRequisition || !issueDescription.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Issue'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-primary" />
              Confirm Issue Creation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to create this issue? This action cannot be undone.
            </p>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Requisition:</span>
                <span>{selectedRequisition?.requisitioncode}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Description:</span>
                <span className="text-right max-w-[200px] truncate">
                  {issueDescription.substring(0, 50)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Attachments:</span>
                <span>{uploadedFiles.length}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Creating...' : 'Confirm & Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}