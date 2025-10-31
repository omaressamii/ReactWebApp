import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { getItRequisition } from '@/redux/slices/requisitionSlice';
import RequisitionCard from '@/components/RequisitionCard';
import { Plus, Search, Loader2 } from 'lucide-react';

export default function Requisitions() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userState = useAppSelector((state) => state.user);
  const requisitionState = useAppSelector((state) => state.requisition);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Lazy loading state
  const [displayedRequisitions, setDisplayedRequisitions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Load 12 items at a time
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  // Load requisitions on mount
  useEffect(() => {
    if (userState.user) {
      dispatch(getItRequisition(userState.user));
    }
  }, [dispatch, userState.user]);

  // Update filtered requisitions when data changes or filters change
  const filteredRequisitions = Array.isArray(requisitionState.requisitions)
    ? requisitionState.requisitions.filter((req: any) => {
        const matchesSearch = req.requisition_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             req.requisition_description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.requisition_status_code === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  // Reset lazy loading when filters change
  useEffect(() => {
    setDisplayedRequisitions([]);
    setCurrentPage(1);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [searchTerm, statusFilter, requisitionState.requisitions]);

  // Load more items function
  const loadMoreItems = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate async loading (in real implementation, this would be an API call)
    setTimeout(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newItems = filteredRequisitions.slice(startIndex, endIndex);

      if (newItems.length > 0) {
        setDisplayedRequisitions(prev => [...prev, ...newItems]);
        setCurrentPage(prev => prev + 1);

        // Check if there are more items to load
        if (endIndex >= filteredRequisitions.length) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }

      setIsLoadingMore(false);
    }, 500); // Small delay to show loading state
  }, [currentPage, itemsPerPage, filteredRequisitions, isLoadingMore, hasMore]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loadMoreItems, hasMore, isLoadingMore]);

  // Initial load of first page
  useEffect(() => {
    if (filteredRequisitions.length > 0 && displayedRequisitions.length === 0) {
      loadMoreItems();
    }
  }, [filteredRequisitions, displayedRequisitions.length, loadMoreItems]);

  if (requisitionState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading requisitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Requisitions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your parts and materials requests
            {filteredRequisitions.length > 0 && (
              <span className="block text-sm mt-1">
                Showing {displayedRequisitions.length} of {filteredRequisitions.length} requisitions
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => navigate('/requisitions/create')} className="gap-2">
          <Plus className="w-4 h-4" />
          New Requisition
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by requisition code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="U">Unfinished</SelectItem>
                <SelectItem value="A">Approved</SelectItem>
                <SelectItem value="C">Cancelled</SelectItem>
                <SelectItem value="J">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requisitions List */}
      {displayedRequisitions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedRequisitions.map((requisition: any, index: number) => (
              <RequisitionCard
                key={`requisition-${requisition.requisition_code}-${index}`}
                requisition={requisition}
                onViewDetails={() => navigate(`/requisitions/${requisition.requisition_code}`)}
              />
            ))}
          </div>

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading more requisitions...</span>
            </div>
          )}

          {/* Intersection observer target */}
          {hasMore && !isLoadingMore && (
            <div ref={observerRef} className="h-10 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Scroll for more</span>
            </div>
          )}
        </>
      ) : requisitionState.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading requisitions...</span>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No requisitions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first requisition.'}
              </p>
              <Button onClick={() => navigate('/requisitions/create')}>
                Create Requisition
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {filteredRequisitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredRequisitions.filter((r: any) => r.requisition_status_code === 'U').length}
                </div>
                <div className="text-sm text-muted-foreground">Unfinished</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredRequisitions.filter((r: any) => r.requisition_status_code === 'A').length}
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredRequisitions.filter((r: any) => r.requisition_status_code === 'J').length}
                </div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {filteredRequisitions.filter((r: any) => r.requisition_status_code === 'C').length}
                </div>
                <div className="text-sm text-muted-foreground">Cancelled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
