export interface User {
  id: string;
  name: string;
  email: string;
  role: 'jobseeker' | 'recruiter';
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  avatar?: string;
  company?: string;
  location?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationUnit: string;
  postLimit: number;
  features: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface JobPost {
  id: string;
  title: string;
  company: string;
  recruiterId: string;
  recruiterName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  location: string;
  salary: string;
  type: 'full-time' | 'part-time' | 'contract';
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@email.com',
    role: 'jobseeker',
    status: 'active',
    joinDate: '2024-01-15',
    location: 'Hồ Chí Minh'
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    email: 'binh.tran@company.com',
    role: 'recruiter',
    status: 'active',
    joinDate: '2024-02-20',
    company: 'Tech Corp',
    location: 'Hà Nội'
  },
  {
    id: '3',
    name: 'Lê Minh Cường',
    email: 'cuong.le@email.com',
    role: 'jobseeker',
    status: 'pending',
    joinDate: '2024-10-01',
    location: 'Đà Nẵng'
  },
  {
    id: '4',
    name: 'Phạm Thu Hà',
    email: 'ha.pham@startup.vn',
    role: 'recruiter',
    status: 'active',
    joinDate: '2024-03-10',
    company: 'StartupVN',
    location: 'Hồ Chí Minh'
  }
];

export const mockJobPosts: JobPost[] = [
  {
    id: '1',
    title: 'Mobile App Developer',
    company: 'Xiaomi',
    recruiterId: '2',
    recruiterName: 'Trần Thị Bình',
    status: 'pending',
    submittedAt: '2024-11-01',
    location: 'Beijing',
    salary: '15-25k',
    type: 'full-time'
  },
  {
    id: '2',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    recruiterId: '2',
    recruiterName: 'Trần Thị Bình',
    status: 'approved',
    submittedAt: '2024-10-28',
    location: 'Hà Nội',
    salary: '20-30k',
    type: 'full-time'
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '4',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },{
    id: '5',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '6',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '7',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '7',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '8',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },{
    id: '9',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '10',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '11',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '12',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '13',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  },
  {
    id: '14',
    title: 'UI/UX Designer',
    company: 'StartupVN',
    recruiterId: '4',
    recruiterName: 'Phạm Thu Hà',
    status: 'pending',
    submittedAt: '2024-11-02',
    location: 'Hồ Chí Minh',
    salary: '12-18k',
    type: 'contract'
  }
];

export const mockStats = {
  totalUsers: 1247,
  totalJobSeekers: 892,
  totalRecruiters: 355,
  pendingPosts: 23,
  approvedPosts: 156,
  totalRevenue: 45600000,
  activePackages: 3,
  monthlyGrowth: 12.5
};