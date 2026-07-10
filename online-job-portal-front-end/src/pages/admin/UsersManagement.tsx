import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonLowercase } from '@/components/ui/button-lowercase.tsx';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/admin/select-custom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MoreHorizontal, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  useGetUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useSendEmailMutation,
  useGetUserActivitiesQuery,
  useGetRecruitersQuery,
  useGetPendingRecruitersQuery,
  useApproveRecruiterMutation,
  useRejectRecruiterMutation,
  useResendRecruiterActivationMutation,
  type GetUsersParams,
  type User,
  type Recruiter,
} from '@/redux/features/admin/adminApi';
import { BanUserModal } from '@/components/admin/BanUserModal';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';
import { RestoreUserModal } from '@/components/admin/RestoreUserModal';
import { UnbanUserModal } from '@/components/admin/UnbanUserModal';
import { SendEmailModal } from '@/components/admin/SendEmailModal';
import { ApproveRecruiterModal } from '@/components/admin/ApproveRecruiterModal';
import { RejectRecruiterModal } from '@/components/admin/RejectRecruiterModal';

const ROLE_LABELS: Record<string, string> = {
  job_seeker: 'Job Seeker',
  recruiter: 'Recruiter',
  admin: 'Admin',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  locked: 'Locked (Banned)',
  pending: 'Pending Approval',
  suspended: 'Suspended',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  locked: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-orange-100 text-orange-800',
};

const RECRUITER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const UserActivitiesTimeline = ({ userId }: { userId: string }) => {
  const { data: response, isLoading, isError } = useGetUserActivitiesQuery(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        <span className="ml-2 text-sm text-gray-500">Đang tải lịch sử hoạt động...</span>
      </div>
    );
  }

  if (isError || !response?.success) {
    return (
      <div className="text-center py-6 text-sm text-red-500">
        Không thể tải lịch sử hoạt động.
      </div>
    );
  }

  const activities = response.data || [];

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">
        Không có lịch sử hoạt động nào được ghi nhận.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l border-gray-200 space-y-6 max-h-[300px] overflow-y-auto mt-2">
      {activities.map((act: any) => {
        let iconBg = "bg-blue-100 text-blue-600";
        if (act.type === "application") {
          iconBg = "bg-green-100 text-green-600";
        } else if (act.type === "interview") {
          iconBg = "bg-purple-100 text-purple-600";
        } else if (act.type === "payment") {
          iconBg = "bg-yellow-100 text-yellow-600";
        } else if (act.type === "job_post") {
          iconBg = "bg-blue-100 text-blue-600";
        }

        const displayStatus = act.status ? act.status.toUpperCase() : "N/A";

        return (
          <div key={act.id} className="relative">
            <span className={`absolute -left-[37px] top-1 flex h-6 w-6 items-center justify-center rounded-full ${iconBg} ring-8 ring-white text-xs font-bold`}>
              {act.type === "application" && "A"}
              {act.type === "interview" && "I"}
              {act.type === "payment" && "P"}
              {act.type === "job_post" && "J"}
            </span>

            <div>
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-sm text-gray-900">{act.title}</h4>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-800 uppercase">
                  {displayStatus}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{act.subtitle}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(act.date).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function UsersManagement() {
  // ============ States ============
  const [jobSeekerPage, setJobSeekerPage] = useState(1);
  const [recruiterPage, setRecruiterPage] = useState(1);
  const [pendingRecruiterPage, setPendingRecruiterPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [jobSeekerSearchTerm, setJobSeekerSearchTerm] = useState('');
  const [recruiterSearchTerm, setRecruiterSearchTerm] = useState('');
  const [pendingRecruiterSearchTerm, setPendingRecruiterSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState<Recruiter | null>(null);
  const [modalMode, setModalMode] = useState<
    'detail' | 'ban' | 'unban' | 'delete' | 'restore' | 'email' | 'approve' | 'reject' | null
  >(null);
  const [activeTab, setActiveTab] = useState<'job-seekers' | 'recruiters' | 'pending-recruiters'>('job-seekers');

  // ============ Queries & Mutations ============
  const jobSeekerQueryParams: GetUsersParams = {
    page: jobSeekerPage,
    limit,
    role: 'job_seeker',
    ...(jobSeekerSearchTerm && { search: jobSeekerSearchTerm }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data: jobSeekersData, isLoading: isJobSeekerLoading, isError: isJobSeekerError, error: jobSeekerError } = useGetUsersQuery(jobSeekerQueryParams);

  const { data: recruitersData, isLoading: isRecruiterLoading } = useGetRecruitersQuery({
    page: recruiterPage,
    limit,
  });

  const { data: pendingRecruitersData, isLoading: isPendingLoadingLoading } = useGetPendingRecruitersQuery({
    page: pendingRecruiterPage,
    limit,
  });

  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [restoreUser, { isLoading: isRestoring }] = useRestoreUserMutation();
  const [sendEmail, { isLoading: isSendingEmail }] = useSendEmailMutation();
  const [approveRecruiter, { isLoading: isApproving }] = useApproveRecruiterMutation();
  const [rejectRecruiter, { isLoading: isRejecting }] = useRejectRecruiterMutation();
  const [resendActivation, { isLoading: isResending }] = useResendRecruiterActivationMutation();

  // ============ Derived Data ============
  const jobSeekers = jobSeekersData?.data || [];
  const jobSeekerPagination = jobSeekersData?.pagination;
  const jobSeekerTotalPages = jobSeekerPagination?.totalPages || 1;

  const recruiters = recruitersData?.data || [];
  const recruiterPagination = recruitersData?.pagination;
  const recruiterTotalPages = recruiterPagination?.totalPages || 1;

  const pendingRecruiterPagination = pendingRecruitersData?.pagination;
  // const pendingRecruiterTotalPages = pendingRecruiterPagination?.totalPages || 1; // Used in RecruiterTable

  // ============ Handlers ============
  const handleBanUser = async (userId: string, duration: string, reason: string) => {
    try {
      await banUser({ userId, duration, reason }).unwrap();
      toast.success('User đã bị ban thành công');
      setModalMode(null);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId).unwrap();
      toast.success('Ban đã được gỡ thành công');
      setModalMode(null);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi gỡ ban');
    }
  };

  const handleDeleteUser = async (userId: string, reason?: string) => {
    try {
      await deleteUser({ userId, reason }).unwrap();
      toast.success('User đã bị xóa (soft delete) thành công');
      setModalMode(null);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi xóa user');
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      await restoreUser(userId).unwrap();
      toast.success('User đã được khôi phục thành công');
      setModalMode(null);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi khôi phục user');
    }
  };

  const handleSendEmail = async (userId: string, subject: string, body: string) => {
    try {
      await sendEmail({ userId, subject, body }).unwrap();
      toast.success('Email đã được gửi thành công');
      setModalMode(null);
      setSelectedUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi gửi email');
    }
  };

  // ============ Recruiter Handlers ============
  const handleApproveRecruiter = async (recruiterId: string) => {
    try {
      await approveRecruiter(recruiterId).unwrap();
      toast.success('Recruiter đã được duyệt. Email kích hoạt đã được gửi.');
      setModalMode(null);
      setSelectedRecruiter(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi duyệt recruiter');
    }
  };

  const handleRejectRecruiter = async (recruiterId: string, reason: string) => {
    try {
      await rejectRecruiter({ recruiterId, rejectionReason: reason }).unwrap();
      toast.success('Recruiter đã bị từ chối.');
      setModalMode(null);
      setSelectedRecruiter(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi từ chối recruiter');
    }
  };

  const handleResendActivation = async (recruiterId: string) => {
    try {
      await resendActivation(recruiterId).unwrap();
      toast.success('Email kích hoạt đã được gửi lại.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lỗi khi gửi lại email');
    }
  };

  // ============ UI Helpers ============
  const getStatusBadge = (user: User) => {
    const { isActive, isLocked } = user.status;
    let status = 'active';

    if (isLocked) {
      status = 'locked';
    } else if (!isActive) {
      status = 'inactive';
    }

    return <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>;
  };

  const getUserAvatar = (user: User) => {
    if (!user.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getRecruiterInitials = (recruiter: Recruiter) => {
    if (!recruiter.fullName) return 'R';
    return recruiter.fullName
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  };

  // ============ Component: User Table ============
  const UserTable = ({
    users,
    isLoading,
    isError,
    error,
    pagination,
    totalPages,
    onPageChange,
    currentPage
  }: {
    users: User[]
    isLoading: boolean
    isError: boolean
    error: any
    pagination: any
    totalPages: number
    onPageChange: (page: number) => void
    currentPage: number
  }) => (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span>Loading users...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{(error as any)?.data?.message || 'Error loading users'}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24">
                <div className="flex items-center justify-center text-gray-500">
                  No users found
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {getUserAvatar(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      {user.companyId && (
                        <div className="text-sm text-gray-500">Company</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{user.phone || 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm">{user.email}</TableCell>
                <TableCell className="text-sm">{ROLE_LABELS[user.role]}</TableCell>
                <TableCell>{getStatusBadge(user)}</TableCell>
                <TableCell className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell className="text-sm">
                  {user.statistics.lastActivity
                    ? new Date(user.statistics.lastActivity).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <ButtonLowercase variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </ButtonLowercase>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setModalMode('detail');
                        }}
                      >
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setModalMode('email');
                        }}
                      >
                        Send Email
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Ban Actions */}
                      {!user.status.isLocked ? (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedUser(user);
                            setModalMode('ban');
                          }}
                        >
                          Ban User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() => {
                            setSelectedUser(user);
                            setModalMode('unban');
                          }}
                        >
                          Unban User
                        </DropdownMenuItem>
                      )}

                      {/* Delete/Restore Actions */}
                      {!user.isActive ? (
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() => {
                            setSelectedUser(user);
                            setModalMode('restore');
                          }}
                        >
                          Restore User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedUser(user);
                            setModalMode('delete');
                          }}
                        >
                          Delete User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {totalPages} (Total: {pagination.total})
          </div>
          <div className="flex gap-2">
            <ButtonLowercase
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </ButtonLowercase>
            <ButtonLowercase
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </ButtonLowercase>
          </div>
        </div>
      )}
    </>
  );

  // ============ Component: Active Recruiter Table ============
  const ActiveRecruiterTable = ({
    recruiters,
    isLoading,
    pagination,
    totalPages,
    onPageChange,
    currentPage
  }: {
    recruiters: Recruiter[]
    isLoading: boolean
    pagination: any
    totalPages: number
    onPageChange: (page: number) => void
    currentPage: number
  }) => (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recruiter</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span>Loading recruiters...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : recruiters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24">
                <div className="flex items-center justify-center text-gray-500">
                  No recruiters found
                </div>
              </TableCell>
            </TableRow>
          ) : (
            recruiters.map(recruiter => (
              <TableRow key={recruiter._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {getRecruiterInitials(recruiter)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{recruiter.fullName || 'Unknown'}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{recruiter.phone || 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm">{recruiter.email || 'N/A'}</TableCell>
                <TableCell className="text-sm">{recruiter.companyName || 'N/A'}</TableCell>
                <TableCell><Badge className={RECRUITER_STATUS_COLORS[recruiter.accountStatus]}>{recruiter.accountStatus}</Badge></TableCell>
                <TableCell className="text-sm">{new Date(recruiter.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell className="text-sm">{new Date(recruiter.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <ButtonLowercase variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </ButtonLowercase>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedRecruiter(recruiter);
                          setModalMode('detail');
                        }}
                      >
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser({
                            ...recruiter,
                            role: 'recruiter' as any,
                            isActive: recruiter.accountStatus === 'active',
                            loginAttempts: 0,
                            lockUntil: null,
                            companyId: null,
                            createdAt: recruiter.createdAt,
                            updatedAt: recruiter.updatedAt,
                            statistics: { lastActivity: null },
                            status: {
                              isActive: recruiter.accountStatus === 'active',
                              isLocked: false,
                              isInactive: recruiter.accountStatus !== 'active',
                              lastLogin: null,
                            },
                          } as any);
                          setModalMode('email');
                        }}
                      >
                        Send Email
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {recruiter.accountStatus !== 'rejected' && (
                        <DropdownMenuItem
                          className="text-orange-600"
                          onClick={() => {
                            setSelectedUser({
                              ...recruiter,
                              role: 'recruiter' as any,
                              isActive: recruiter.accountStatus === 'active',
                              loginAttempts: 0,
                              lockUntil: null,
                              companyId: null,
                              createdAt: recruiter.createdAt,
                              updatedAt: recruiter.updatedAt,
                              statistics: { lastActivity: null },
                              status: {
                                isActive: recruiter.accountStatus === 'active',
                                isLocked: false,
                                isInactive: recruiter.accountStatus !== 'active',
                                lastLogin: null,
                              },
                            } as any);
                            setModalMode('ban');
                          }}
                        >
                          Ban User
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setSelectedUser({
                            ...recruiter,
                            role: 'recruiter' as any,
                            isActive: recruiter.accountStatus === 'active',
                            loginAttempts: 0,
                            lockUntil: null,
                            companyId: null,
                            createdAt: recruiter.createdAt,
                            updatedAt: recruiter.updatedAt,
                            statistics: { lastActivity: null },
                            status: {
                              isActive: recruiter.accountStatus === 'active',
                              isLocked: false,
                              isInactive: recruiter.accountStatus !== 'active',
                              lastLogin: null,
                            },
                          } as any);
                          setModalMode('delete');
                        }}
                      >
                        Delete User
                      </DropdownMenuItem>

                      {/* Status-based Actions */}
                      {recruiter.accountStatus === 'pending' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => {
                              setSelectedRecruiter(recruiter);
                              setModalMode('approve');
                            }}
                          >
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedRecruiter(recruiter);
                              setModalMode('reject');
                            }}
                          >
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}

                      {recruiter.accountStatus === 'approved' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleResendActivation(recruiter._id)}
                            disabled={isResending}
                          >
                            {isResending ? 'Sending...' : 'Resend Activation Email'}
                          </DropdownMenuItem>
                        </>
                      )}

                      {recruiter.accountStatus === 'rejected' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => {
                              setSelectedRecruiter(recruiter);
                              setModalMode('approve');
                            }}
                          >
                            Approve
                          </DropdownMenuItem>
                        </>
                      )}

                      {recruiter.accountStatus === 'active' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled className="text-green-600">
                            Active
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {totalPages} (Total: {pagination.total})
          </div>
          <div className="flex gap-2">
            <ButtonLowercase
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </ButtonLowercase>
            <ButtonLowercase
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </ButtonLowercase>
          </div>
        </div>
      )}
    </>
  );

  // ============ Component: Pending Recruiter Table ============
  const RecruiterTable = () => {
    const pendingRecruiters = pendingRecruitersData?.data || [];
    const recruiterPagination = pendingRecruitersData?.pagination;
    const recruiterTotalPages = recruiterPagination?.totalPages || 1;

    const filteredRecruiters = useMemo(() => {
      if (!recruiterSearchTerm) return pendingRecruiters;
      const lowerSearch = recruiterSearchTerm.toLowerCase();
      return pendingRecruiters.filter(r =>
        (r.fullName?.toLowerCase().includes(lowerSearch) || false) ||
        (r.email?.toLowerCase().includes(lowerSearch) || false) ||
        (r.companyName?.toLowerCase().includes(lowerSearch) || false)
      );
    }, [pendingRecruiters, recruiterSearchTerm]);

    const getRecruiterInitials = (recruiter: Recruiter) => {
      if (!recruiter.fullName) return 'R';
      return recruiter.fullName
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase();
    };

    const getRecruiterStatusBadge = (status: string) => {
      const statusLabel = {
        pending: 'Pending',
        approved: 'Approved',
        active: 'Active',
        rejected: 'Rejected',
      };
      return (
        <Badge className={RECRUITER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}>
          {statusLabel[status as keyof typeof statusLabel] || status}
        </Badge>
      );
    };

    return (
      <>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or company..."
              value={recruiterSearchTerm}
              onChange={e => {
                setRecruiterSearchTerm(e.target.value);
                setRecruiterPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recruiter</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPendingLoadingLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span>Loading recruiters...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRecruiters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24">
                  <div className="flex items-center justify-center text-gray-500">
                    No pending recruiters
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecruiters.map(recruiter => (
                <TableRow key={recruiter._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {getRecruiterInitials(recruiter)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{recruiter.fullName || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{recruiter.phone || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{recruiter.phone || 'N/A'}</TableCell>
                  <TableCell className="font-mono text-sm">{recruiter.email || 'N/A'}</TableCell>
                  <TableCell className="text-sm">{recruiter.companyName || 'N/A'}</TableCell>
                  <TableCell>{getRecruiterStatusBadge(recruiter.accountStatus)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(recruiter.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(recruiter.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <ButtonLowercase variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </ButtonLowercase>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRecruiter(recruiter);
                            setModalMode('detail');
                          }}
                        >
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Status-based Actions */}
                        {recruiter.accountStatus === 'pending' && (
                          <>
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => {
                                setSelectedRecruiter(recruiter);
                                setModalMode('approve');
                              }}
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedRecruiter(recruiter);
                                setModalMode('reject');
                              }}
                            >
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}

                        {recruiter.accountStatus === 'approved' && (
                          <DropdownMenuItem
                            onClick={() => handleResendActivation(recruiter._id)}
                            disabled={isResending}
                          >
                            {isResending ? 'Sending...' : 'Resend Activation Email'}
                          </DropdownMenuItem>
                        )}

                        {recruiter.accountStatus === 'rejected' && (
                          <DropdownMenuItem disabled className="text-red-600">
                            Rejected
                          </DropdownMenuItem>
                        )}

                        {recruiter.accountStatus === 'active' && (
                          <DropdownMenuItem disabled className="text-green-600">
                            Active
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {recruiterPagination && recruiterTotalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-4">
            <div className="text-sm text-gray-600">
              Page {recruiterPagination.page} of {recruiterTotalPages} (Total: {recruiterPagination.total})
            </div>
            <div className="flex gap-2">
              <ButtonLowercase
                variant="outline"
                size="sm"
                onClick={() => setRecruiterPage(p => Math.max(1, p - 1))}
                disabled={recruiterPage === 1 || isPendingLoadingLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </ButtonLowercase>
              <ButtonLowercase
                variant="outline"
                size="sm"
                onClick={() => setRecruiterPage(p => Math.min(recruiterTotalPages, p + 1))}
                disabled={recruiterPage === recruiterTotalPages || isPendingLoadingLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </ButtonLowercase>
            </div>
          </div>
        )}
      </>
    );
  };

  // ============ Main Render ============
  return (
    <div className="space-y-6">
      {/* Filters - Dynamic based on active tab */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              {activeTab === 'job-seekers' && (
                <Input
                  placeholder="Search job seekers by name or email..."
                  value={jobSeekerSearchTerm}
                  onChange={e => {
                    setJobSeekerSearchTerm(e.target.value);
                    setJobSeekerPage(1);
                  }}
                  className="pl-10"
                />
              )}
              {activeTab === 'recruiters' && (
                <Input
                  placeholder="Search recruiters by name or email..."
                  value={recruiterSearchTerm}
                  onChange={e => {
                    setRecruiterSearchTerm(e.target.value);
                    setRecruiterPage(1);
                  }}
                  className="pl-10"
                />
              )}
              {activeTab === 'pending-recruiters' && (
                <Input
                  placeholder="Search pending recruiters by name or email..."
                  value={pendingRecruiterSearchTerm}
                  onChange={e => {
                    setPendingRecruiterSearchTerm(e.target.value);
                    setPendingRecruiterPage(1);
                  }}
                  className="pl-10"
                />
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {activeTab === 'job-seekers' && (
                <div className="flex-1">
                  <Select
                    value={statusFilter || 'all'}
                    onValueChange={v => {
                      setStatusFilter(v === 'all' ? '' : v);
                      setJobSeekerPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Select value={String(limit)} onValueChange={v => setLimit(Number(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Tables */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="job-seekers">
            Job Seekers ({jobSeekerPagination?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="recruiters">
            Recruiters ({recruiterPagination?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="pending-recruiters">
            Pending Recruiters ({pendingRecruiterPagination?.total || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="job-seekers">
          <Card>
            <CardHeader>
              <CardTitle>Job Seekers</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable
                users={jobSeekers}
                isLoading={isJobSeekerLoading}
                isError={isJobSeekerError}
                error={jobSeekerError}
                pagination={jobSeekerPagination}
                totalPages={jobSeekerTotalPages}
                onPageChange={setJobSeekerPage}
                currentPage={jobSeekerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiters">
          <Card>
            <CardHeader>
              <CardTitle>Active Recruiters</CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveRecruiterTable
                recruiters={recruiters}
                isLoading={isRecruiterLoading}
                pagination={recruiterPagination}
                totalPages={recruiterTotalPages}
                onPageChange={setRecruiterPage}
                currentPage={recruiterPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending-recruiters">
          <Card>
            <CardHeader>
              <CardTitle>Pending Recruiters (Awaiting Approval)</CardTitle>
            </CardHeader>
            <CardContent>
              <RecruiterTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}

      {/* Detail Modal */}
      <Dialog open={modalMode === 'detail'} onOpenChange={(open) => {
        if (!open) {
          setModalMode(null);
          setSelectedUser(null);
          setSelectedRecruiter(null);
        }
      }}>
        <DialogContent className="max-w-md">
          {(selectedUser || selectedRecruiter) && (
            <>
              <DialogHeader>
                <DialogTitle>Chi tiết người dùng</DialogTitle>
                <DialogDescription>
                  {selectedUser?.fullName || selectedRecruiter?.fullName || 'N/A'}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                  <TabsTrigger value="activities">Hoạt động</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="mt-4 space-y-3 text-sm">
                  {selectedUser && (
                    <>
                      <p><b>Họ và tên:</b> {selectedUser.fullName}</p>
                      <p><b>Email:</b> {selectedUser.email}</p>
                      <p><b>Số điện thoại:</b> {selectedUser.phone || 'N/A'}</p>
                      <p><b>Vai trò:</b> {ROLE_LABELS[selectedUser.role]}</p>
                      <p><b>Trạng thái:</b> {getStatusBadge(selectedUser)}</p>
                      <p><b>Ngày tham gia:</b> {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</p>
                      {selectedUser.statistics.totalApplications !== undefined && (
                        <p><b>Số lượt ứng tuyển:</b> {selectedUser.statistics.totalApplications}</p>
                      )}
                      {selectedUser.statistics.totalJobPosts !== undefined && (
                        <p><b>Số tin tuyển dụng:</b> {selectedUser.statistics.totalJobPosts}</p>
                      )}
                    </>
                  )}
                  {selectedRecruiter && !selectedUser && (
                    <>
                      <p><b>Họ và tên nhà tuyển dụng:</b> {selectedRecruiter.fullName}</p>
                      <p><b>Email:</b> {selectedRecruiter.email}</p>
                      <p><b>Số điện thoại:</b> {selectedRecruiter.phone || 'N/A'}</p>
                      <p><b>Tên công ty:</b> {selectedRecruiter.companyName || 'N/A'}</p>
                      <p><b>Trạng thái tài khoản:</b> {selectedRecruiter.accountStatus}</p>
                      <p><b>Ngày đăng ký:</b> {new Date(selectedRecruiter.createdAt).toLocaleDateString('vi-VN')}</p>
                      {selectedRecruiter.rejectionReason && (
                        <p className="text-red-500"><b>Lý do từ chối:</b> {selectedRecruiter.rejectionReason}</p>
                      )}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="activities" className="mt-4">
                  <UserActivitiesTimeline userId={selectedUser?._id || selectedRecruiter?._id || ''} />
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-4">
                <ButtonLowercase onClick={() => {
                  setModalMode(null);
                  setSelectedUser(null);
                  setSelectedRecruiter(null);
                }}>
                  Đóng
                </ButtonLowercase>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban Modal */}
      <BanUserModal
        open={modalMode === 'ban'}
        user={selectedUser}
        isLoading={isBanning}
        onBan={handleBanUser}
        onClose={() => setModalMode(null)}
      />

      {/* Unban Modal */}
      <UnbanUserModal
        open={modalMode === 'unban'}
        user={selectedUser}
        isLoading={isUnbanning}
        onUnban={handleUnbanUser}
        onClose={() => setModalMode(null)}
      />

      {/* Delete Modal */}
      <DeleteUserModal
        open={modalMode === 'delete'}
        user={selectedUser}
        isLoading={isDeleting}
        onDelete={handleDeleteUser}
        onClose={() => setModalMode(null)}
      />

      {/* Restore Modal */}
      <RestoreUserModal
        open={modalMode === 'restore'}
        user={selectedUser}
        isLoading={isRestoring}
        onRestore={handleRestoreUser}
        onClose={() => setModalMode(null)}
      />

      {/* Email Modal */}
      <SendEmailModal
        open={modalMode === 'email'}
        user={selectedUser}
        isLoading={isSendingEmail}
        onSendEmail={handleSendEmail}
        onClose={() => setModalMode(null)}
      />


      {/* Approve Recruiter Modal */}
      <ApproveRecruiterModal
        open={modalMode === 'approve'}
        recruiter={selectedRecruiter}
        isLoading={isApproving}
        onApprove={handleApproveRecruiter}
        onClose={() => setModalMode(null)}
      />

      {/* Reject Recruiter Modal */}
      <RejectRecruiterModal
        open={modalMode === 'reject'}
        recruiter={selectedRecruiter}
        isLoading={isRejecting}
        onReject={handleRejectRecruiter}
        onClose={() => setModalMode(null)}
      />
    </div>
  );
}
