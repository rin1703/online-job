import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Search, Eye, Check, X, Clock, Building, MapPin, DollarSign, MoreHorizontal } from 'lucide-react';
import { type JobPost } from '@/data/mockAdminData';
import { useGetAdminJobsQuery, useUpdateJobApprovalStatusMutation } from '@/features/admin/api/admin.service';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function PostsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  // const [statusFilter, setStatusFilter] = useState('all');
  const [posts, setPosts] = useState<JobPost[]>([]);
  const { data: jobsData, isLoading } = useGetAdminJobsQuery();
  const [updateJobApprovalStatus] = useUpdateJobApprovalStatusMutation();
  useEffect(() => {
    if (!jobsData) return;

    // Backend may return either an array or an object with a `data` array.
    let sourceArray = jobsData as any;
    if (!Array.isArray(sourceArray)) {
      sourceArray = sourceArray?.data || sourceArray?.results || [];
    }
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) return;

    const mapJob = (item: any): JobPost => {
      // Normalize type
      const rawType = (item.jobType || item.type || '').toString().toLowerCase();
      let normalizedType = rawType;
      if (rawType.includes('full')) normalizedType = 'full-time';
      else if (rawType.includes('part')) normalizedType = 'part-time';
      else if (rawType.includes('contract')) normalizedType = 'contract';

      // Normalize status
      const rawStatus = (item.approvalStatus || item.status || '').toString().toLowerCase();
      let normalizedStatus = rawStatus;
      if (rawStatus === 'approved' || rawStatus === 'approve') normalizedStatus = 'approved';
      if (rawStatus === 'pending') normalizedStatus = 'pending';
      if (rawStatus === 'rejected') normalizedStatus = 'rejected';

      // Format salary
      const salaryMin = item.salaryMin ?? item.salary ?? null;
      const salaryMax = item.salaryMax ?? null;
      const salary = salaryMax ? `${salaryMin} - ${salaryMax}` : (salaryMin ?? 'N/A');

      return {
        id: item.id ?? item._id,
        title: item.title,
        company: item.companyName ?? item.company,
        recruiterName: item.recruiterName ?? item.recruiter,
        location: item.city ?? item.location,
        salary,
        type: normalizedType,
        submittedAt: item.createDate ?? item.submittedAt,
        status: normalizedStatus,
      } as unknown as JobPost;
    };

    const mapped = sourceArray.map(mapJob);
    setPosts(mapped);
    // Keep a console log for quick verification
    console.log('job data: ',jobsData);
  }, [jobsData]);
  const [selectedPost, setSelectedPost] = useState<JobPost | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageApproved, setCurrentPageApproved] = useState(1);
  const [currentPageRejected, setCurrentPageRejected] = useState(1);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.recruiterName.toLowerCase().includes(searchTerm.toLowerCase());
    // const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch; // && matchesStatus;
  });

  const pendingPosts = filteredPosts.filter(post => post.status === 'pending');
  const approvedPosts = filteredPosts.filter(post => post.status === 'approved');
  const rejectedPosts = filteredPosts.filter(post => post.status === 'rejected');

  // Pagination logic
  const getPaginatedData = (data: JobPost[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (dataLength: number) => {
    return Math.ceil(dataLength / ITEMS_PER_PAGE);
  };

  const handleApprove = async (postId: string) => {
    try {
      await updateJobApprovalStatus({
        jobId: postId,
        approvalStatus: 'approved',
      }).unwrap();
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, status: 'approved' as const } : post
      ));
      toast.success('Job post approved successfully');
    } catch (error: any) {
      console.error('Failed to approve job:', error);
      toast.error(`Failed to approve: ${error?.data?.message || 'Unknown error'}`);
    }
  };

  const handleReject = async (postId: string, reason: string) => {
    try {
      await updateJobApprovalStatus({
        jobId: postId,
        approvalStatus: 'rejected',
        rejectionReason: reason,
      }).unwrap();
      // Update local state optimistically
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, status: 'rejected' as const } : post
      ));
      setRejectionReason('');
      setIsRejectDialogOpen(false);
      toast.success('Job post rejected successfully');
    } catch (error: any) {
      console.error('Failed to reject job:', error);
      toast.error(`Failed to reject: ${error?.data?.message || 'Unknown error'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'Full-time';
      case 'part-time':
        return 'Part-time';
      case 'contract':
        return 'Contract';
      default:
        return type;
    }
  };

  const PaginationComponent = ({
    currentPage,
    totalPages,
    onPageChange
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    const renderPaginationItems = () => {
      const items = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
          items.push(
            <PaginationItem key={`page-${i}`}>
              <PaginationLink
                onClick={() => onPageChange(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      } else {
        // Show first page
        items.push(
          <PaginationItem key={`page-1`}>
            <PaginationLink
              onClick={() => onPageChange(1)}
              isActive={currentPage === 1}
              className="cursor-pointer"
            >
              1
            </PaginationLink>
          </PaginationItem>
        );

        // Show ellipsis if needed
        if (currentPage > 3) {
          items.push(
            <PaginationItem key="ellipsis1">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }

        // Show pages around current page
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          items.push(
            <PaginationItem key={`page-${i}`}>
              <PaginationLink
                onClick={() => onPageChange(i)}
                isActive={currentPage === i}
                className="cursor-pointer"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }

        // Show ellipsis if needed
        if (currentPage < totalPages - 2) {
          items.push(
            <PaginationItem key="ellipsis2">
              <PaginationEllipsis />
            </PaginationItem>
          );
        }

        // Show last page
        if (totalPages > 1) {
          items.push(
            <PaginationItem key={`page-${totalPages}`}>
              <PaginationLink
                onClick={() => onPageChange(totalPages)}
                isActive={currentPage === totalPages}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          );
        }
      }

      return items;
    };

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          {renderPaginationItems()}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const PostTable = ({
    posts,
    currentPage,
    onPageChange
  }: {
    posts: JobPost[];
    currentPage: number;
    onPageChange: (page: number) => void;
  }) => {
    // Show loading placeholder while fetching jobs
    if (isLoading && posts.length === 0) {
      return (
        <div className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      );
    }

    const paginatedPosts = getPaginatedData(posts, currentPage);
    const totalPages = getTotalPages(posts.length);

    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Recruiter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPosts.map((post) => (
              <TableRow key={`post-${post.id}`}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {post.location}
                      <span className="mx-2">•</span>
                      <DollarSign className="h-3 w-3 mr-1" />
                      {post.salary}
                      <span className="mx-2">•</span>
                      {getTypeLabel(post.type)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span>{post.company}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {post.recruiterName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{post.recruiterName}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(post.status)}</TableCell>
                <TableCell>{new Date(post.submittedAt).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <ButtonLowercase variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </ButtonLowercase>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedPost(post);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {post.status === 'pending' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleApprove(post.id)}
                            className="text-green-600"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPost(post);
                              setIsRejectDialogOpen(true);
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

        {/* Pagination and Results Info */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, posts.length)} of {posts.length} posts
          </div>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4 z-10" />
              <Input
                placeholder="Search by job title, company or recruiter..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Reset pagination when searching
                  setCurrentPage(1);
                  setCurrentPageApproved(1);
                  setCurrentPageRejected(1);
                }}
                className="pl-10 h-9"
              />
            </div>
            {/* <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              // Reset pagination when filtering
              setCurrentPage(1);
              setCurrentPageApproved(1);
              setCurrentPageRejected(1);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      {/* Posts Tables */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            <Clock className="mr-2 h-4 w-4" />
            Pending ({pendingPosts.length})
            {pendingPosts.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            <Check className="mr-2 h-4 w-4" />
            Approved ({approvedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <X className="mr-2 h-4 w-4" />
            Rejected ({rejectedPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Pending Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <PostTable
                posts={pendingPosts}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Approved Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <PostTable
                posts={approvedPosts}
                currentPage={currentPageApproved}
                onPageChange={setCurrentPageApproved}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Rejected Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <PostTable
                posts={rejectedPosts}
                currentPage={currentPageRejected}
                onPageChange={setCurrentPageRejected}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Post Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>
              View details and approve or reject the post
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Job Title</h4>
                  <p className="text-gray-600">{selectedPost.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Company</h4>
                  <p className="text-gray-600">{selectedPost.company}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Location</h4>
                  <p className="text-gray-600">{selectedPost.location}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Salary</h4>
                  <p className="text-gray-600">{selectedPost.salary}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Job Type</h4>
                  <p className="text-gray-600">{getTypeLabel(selectedPost.type)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  {getStatusBadge(selectedPost.status)}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recruiter</h4>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{selectedPost.recruiterName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{selectedPost.recruiterName}</span>
                </div>
              </div>

              {selectedPost.status === 'pending' && (
                <div className="flex space-x-2 pt-4">
                  <ButtonLowercase
                    onClick={() => {
                      handleApprove(selectedPost.id);
                      setIsDetailDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </ButtonLowercase>
                  <ButtonLowercase
                    variant="destructive"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      setIsRejectDialogOpen(true);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </ButtonLowercase>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this post
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <ButtonLowercase variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </ButtonLowercase>
            <ButtonLowercase
              variant="destructive"
              onClick={() => {
                if (selectedPost) {
                  handleReject(selectedPost.id, rejectionReason);
                }
              }}
              disabled={!rejectionReason.trim()}
            >
              <X className="mr-2 h-4 w-4" />
              Reject Post
            </ButtonLowercase>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}