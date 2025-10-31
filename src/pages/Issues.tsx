import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Bug, Search, Plus, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { getItIssue, getIssueRequisitions, setError } from '@/redux/slices/issueSlice';
import { Issue, Requisition } from '@/redux/slices/issueSlice';
import { AppDispatch } from '@/redux/store';
import IssueCard from '@/components/IssueCard';
import IssueFilter from '@/components/IssueFilter';
import RequisitionCard from '@/components/RequisitionCard';

export default function Issues() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redux state
  const userState = useSelector((state: any) => state.user);
  const issueState = useSelector((state: any) => state.issue);

  // Local state
  const [activeTab, setActiveTab] = useState<'issues' | 'requisitions'>('issues');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<Requisition[]>([]);
  const [issueCode, setIssueCode] = useState('');
  const [requisitionCode, setRequisitionCode] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debouncing for search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch data on component mount and when user changes
  useEffect(() => {
    if (userState.user) {
      fetchData();
    }
  }, [userState.user]);

  // Update filtered issues when issues change
  useEffect(() => {
    if (issueState.issues) {
      setFilteredIssues(issueState.issues);
    }
  }, [issueState.issues]);

  // Update filtered requisitions when requisitions change
  useEffect(() => {
    if (issueState.requisitions) {
      setFilteredRequisitions(issueState.requisitions);
    }
  }, [issueState.requisitions]);

  const fetchData = async () => {
    if (!userState.user) return;

    // Check user permissions
    if (!userState.user.userLocationsIds?.length ||
        !userState.user.USR_CLASSES?.length ||
        !userState.user.userStoresIds?.length) {
      dispatch(setError({ error: 'Insufficient permissions to access issues' }));
      return;
    }

    setIsLoading(true);
    try {
      // Fetch issues
      await dispatch(getItIssue(userState.user)).unwrap();

      // Fetch requisitions for issue creation
      await dispatch(getIssueRequisitions({
        user: userState.user,
        // Add any additional params if needed
      })).unwrap();

      setActiveTab('issues');
      setSelectedFilter('all');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load issues',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
      toast({
        title: 'Refreshed',
        description: 'Issues data has been updated',
      });
    } catch (error) {
      // Error already handled in fetchData
    } finally {
      setRefreshing(false);
    }
  }, [userState.user]);

  const filterIssueCode = useCallback((code: string) => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debouncing
    const newTimeout = setTimeout(() => {
      if (code) {
        const filtered = issueState.issues?.filter(
          (issue: Issue) => issue.issue_created_requisition_code.toLowerCase().startsWith(code.toLowerCase())
        );
        setFilteredIssues(filtered);
      } else {
        setFilteredIssues(issueState.issues);
      }
    }, 300);

    setSearchTimeout(newTimeout);
  }, [issueState.issues, searchTimeout]);

  const filterRequisitionCode = useCallback((code: string) => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debouncing
    const newTimeout = setTimeout(() => {
      if (code) {
        const filtered = issueState.requisitions?.filter(
          (requisition: Requisition) => requisition.requisitioncode.toLowerCase().startsWith(code.toLowerCase())
        );
        setFilteredRequisitions(filtered);
      } else {
        setFilteredRequisitions(issueState.requisitions);
      }
    }, 300);

    setSearchTimeout(newTimeout);
  }, [issueState.requisitions, searchTimeout]);

  const handleIssueClick = (issue: Issue) => {
    navigate(`/issues/${issue.issue_code}`, { state: { issue } });
  };

  const handleRequisitionClick = (requisition: Requisition) => {
    navigate('/issues/create', { state: { requisition } });
  };

  const handleCreateIssue = () => {
    navigate('/issues/create');
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bug className="w-8 h-8 text-primary" />
            Issues
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage issue transactions and create new issues from approved requisitions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleCreateIssue}
            className="gradient-primary shadow-glow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Issue
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {issueState.error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <span className="font-medium">Error:</span>
              <span>{issueState.error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Issues vs Requisitions */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'issues' | 'requisitions')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Issues ({filteredIssues?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="requisitions" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Approved Requisitions ({filteredRequisitions?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {/* Issue Filter */}
          <IssueFilter
            issues={issueState.issues || []}
            selected={selectedFilter}
            setFilteredIssues={setFilteredIssues}
            setSelected={setSelectedFilter}
            setIssueCode={(code) => {
              setIssueCode(code);
              filterIssueCode(code);
            }}
          />

          {/* Issues List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading issues...</span>
            </div>
          ) : filteredIssues?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredIssues.map((issue, index) => (
                <IssueCard
                  key={issue.issue_code || `issue-${index}`}
                  issue={issue}
                  onViewDetails={handleIssueClick}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Bug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
              <p className="text-muted-foreground">
                {issueCode ? 'No issues match your search criteria.' : 'There are no issues to display.'}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Requisitions Tab */}
        <TabsContent value="requisitions" className="space-y-4">
          {/* Requisition Search */}
          <Card className="gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search requisitions by code..."
                  value={requisitionCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                    setRequisitionCode(value);
                    filterRequisitionCode(value);
                  }}
                  className="pl-10 bg-input border-border"
                  maxLength={10}
                />
              </div>
            </CardContent>
          </Card>

          {/* Requisitions List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading requisitions...</span>
            </div>
          ) : filteredRequisitions?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequisitions.map((requisition, index) => (
                <RequisitionCard
                  key={requisition.requisitioncode || `requisition-${index}`}
                  requisition={requisition}
                  onViewDetails={handleRequisitionClick}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Approved Requisitions</h3>
              <p className="text-muted-foreground">
                {requisitionCode ? 'No requisitions match your search.' : 'There are no approved requisitions available for issue creation.'}
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
