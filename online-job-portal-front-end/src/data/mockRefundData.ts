export interface RefundRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageName: string;
  amount: number;
  reason: string;
  type: 'unused' | 'system';
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  adminNote?: string;
}

export const mockRefundRequests: RefundRequest[] = [
  {
    id: 'REF-001',
    userId: 'user-001',
    userName: 'John Smith',
    userEmail: 'john.smith@email.com',
    packageName: 'Premium Package',
    amount: 299000,
    reason: 'Changed business plan, no longer need recruitment services',
    type: 'unused',
    status: 'pending',
    requestDate: '2024-12-01T10:30:00Z',
  },
  {
    id: 'REF-002',
    userId: 'user-002',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@company.com',
    packageName: 'Basic Package',
    amount: 99000,
    reason: 'System error during payment processing',
    type: 'system',
    status: 'approved',
    requestDate: '2024-11-30T14:15:00Z',
    processedDate: '2024-11-30T16:45:00Z',
    processedBy: 'Admin User',
    adminNote: 'Verified system error in payment logs',
  },
  {
    id: 'REF-003',
    userId: 'user-003',
    userName: 'Michael Brown',
    userEmail: 'mbrown@startup.io',
    packageName: 'Enterprise Package',
    amount: 599000,
    reason: 'Company shutdown due to funding issues',
    type: 'unused',
    status: 'rejected',
    requestDate: '2024-11-28T09:20:00Z',
    processedDate: '2024-11-29T11:30:00Z',
    processedBy: 'Admin User',
    adminNote: 'Package already used for 15 job postings',
  },
  {
    id: 'REF-004',
    userId: 'user-004',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@tech.com',
    packageName: 'Premium Package',
    amount: 299000,
    reason: 'Duplicate payment charged twice',
    type: 'system',
    status: 'pending',
    requestDate: '2024-12-02T08:45:00Z',
  },
  {
    id: 'REF-005',
    userId: 'user-005',
    userName: 'David Wilson',
    userEmail: 'd.wilson@corp.com',
    packageName: 'Basic Package',
    amount: 99000,
    reason: 'Service not meeting expectations',
    type: 'unused',
    status: 'pending',
    requestDate: '2024-12-01T16:20:00Z',
  },
  {
    id: 'REF-006',
    userId: 'user-006',
    userName: 'Lisa Anderson',
    userEmail: 'lisa.a@business.net',
    packageName: 'Premium Package',
    amount: 299000,
    reason: 'Platform downtime affecting service delivery',
    type: 'system',
    status: 'approved',
    requestDate: '2024-11-27T13:10:00Z',
    processedDate: '2024-11-28T10:15:00Z',
    processedBy: 'Admin User',
    adminNote: 'Confirmed 6-hour service outage',
  },
];