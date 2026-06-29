import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Eye,
  Check,
  X,
  Clock,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useGetListAdminRefundsQuery, useUpdateRefundStatusMutation } from '@/features/admin/api/admin.service';
import type { AdminRefundRequest } from '@/features/admin/api/admin.type';

const ITEMS_PER_PAGE = 10;

export default function RefundManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRefund, setSelectedRefund] = useState<AdminRefundRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');
  const [adminNote, setAdminNote] = useState('');

  // API queries and mutations
  const { data: refundsData, isLoading } = useGetListAdminRefundsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
  const [updateRefundStatus, { isLoading: isUpdating }] = useUpdateRefundStatusMutation();

  // Client-side search filtering
  const filteredRefunds = (refundsData?.data || []).filter((refund) => {
    const matchesSearch =
      refund.recruiter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.recruiter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleProcessRefund = async () => {
    if (!selectedRefund) return;

    try {
      await updateRefundStatus({
        refundId: selectedRefund.id,
        action: processAction,
        notes: adminNote || undefined,
      }).unwrap();
      setAdminNote('');
      setIsProcessDialogOpen(false);
      alert(`Refund ${processAction === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error: unknown) {
      console.error('Failed to update refund status:', error);
      alert('Failed to update refund status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'unused':
        return <Badge variant="outline">Unused</Badge>;
      case 'system':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            System
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const totalPages = refundsData?.pagination?.totalPages || 1;
  const totalItems = refundsData?.pagination?.totalItems || 0;

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by recruiter name, email, reason, or refund ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refund List with Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(value) => {
          setStatusFilter(value as 'pending' | 'approved' | 'rejected' | 'all');
          setCurrentPage(1);
        }}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">
            All
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle className="mr-2 h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="mr-2 h-4 w-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter}>
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredRefunds.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  No refund requests found
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recruiter</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRefunds.map((refund) => (
                        <TableRow key={refund.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {refund.recruiter.name
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{refund.recruiter.name}</div>
                                <div className="text-sm text-gray-500">{refund.recruiter.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{refund.package}</TableCell>
                          <TableCell>{formatCurrency(refund.amount)}</TableCell>
                          <TableCell>{getTypeBadge(refund.refundType)}</TableCell>
                          <TableCell>{getStatusBadge(refund.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedRefund(refund);
                                    setIsDetailDialogOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {refund.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRefund(refund);
                                        setProcessAction('approve');
                                        setIsProcessDialogOpen(true);
                                      }}
                                      className="text-green-600"
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedRefund(refund);
                                        setProcessAction('reject');
                                        setIsProcessDialogOpen(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t p-4">
                      <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                        {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} refund requests
                      </div>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded ${
                                  currentPage === page
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                {page}
                              </button>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              className={
                                currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Refund Request Details</DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-600">Recruiter Name</Label>
                <p className="font-medium">{selectedRefund.recruiter.name}</p>
              </div>
              <div>
                <Label className="text-gray-600">Recruiter Email</Label>
                <p className="font-medium">{selectedRefund.recruiter.email}</p>
              </div>
              <div>
                <Label className="text-gray-600">Package</Label>
                <p className="font-medium">{selectedRefund.package}</p>
              </div>
              <div>
                <Label className="text-gray-600">Amount</Label>
                <p className="font-medium">{formatCurrency(selectedRefund.amount)}</p>
              </div>
              <div>
                <Label className="text-gray-600">Refund Type</Label>
                <p className="font-medium">{getTypeBadge(selectedRefund.refundType)}</p>
              </div>
              <div>
                <Label className="text-gray-600">Status</Label>
                <p className="font-medium">{getStatusBadge(selectedRefund.status)}</p>
              </div>
              <div>
                <Label className="text-gray-600">Reason</Label>
                <p className="font-medium">{selectedRefund.reason}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {processAction === 'approve' ? 'Approve Refund' : 'Reject Refund'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                {selectedRefund?.recruiter.name} - {formatCurrency(selectedRefund?.amount || 0)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes for this decision..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsProcessDialogOpen(false);
                setAdminNote('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessRefund}
              disabled={isUpdating}
              className={processAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {processAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
