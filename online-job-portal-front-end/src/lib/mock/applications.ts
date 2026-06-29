import type { Application } from '@/features/recruiter/application.type';
import { ApplicationStatus } from '@/features/recruiter/application.type';

export const mockApplications: Application[] = [
  // Page 1 (Items 1-10)
  {
    _id: '1',
    jobSeekerId: {
      _id: 'js1',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      email: 'vana@example.com',
      phone: '0123456789',
      skills: ['React', 'Node.js', 'TypeScript'],
      experience: '3 năm kinh nghiệm làm việc với React và Node.js',
      education: 'Đại học Bách Khoa Hà Nội - Khoa CNTT',
      portfolio: 'https://github.com/vana'
    },
    postId: {
      _id: 'p1',
      title: 'Frontend Developer',
      position: 'Senior',
      company: 'VNG Corporation'
    },
    resume: 'https://example.com/cv1.pdf',
    coverLetter: 'Kính gửi Quý công ty,\n\nTôi là Nguyễn Văn A, có 3 năm kinh nghiệm làm Frontend Developer.',
    status: ApplicationStatus.PENDING,
    appliedDate: '2024-11-08T10:00:00Z',
    rating: 4
  },
  {
    _id: '2',
    jobSeekerId: {
      _id: 'js2',
      firstName: 'Trần',
      lastName: 'Thị B',
      email: 'thib@example.com',
      phone: '0987654321',
      skills: ['Vue.js', 'Angular', 'JavaScript', 'CSS'],
      experience: '2 năm kinh nghiệm với Vue.js và Angular',
      education: 'Đại học FPT',
      portfolio: 'https://thib-portfolio.com'
    },
    postId: {
      _id: 'p1',
      title: 'Frontend Developer',
      position: 'Middle',
      company: 'VNG Corporation'
    },
    resume: 'https://example.com/cv2.pdf',
    coverLetter: 'Tôi có kinh nghiệm tốt với Vue.js và Angular.',
    status: ApplicationStatus.REVIEWED,
    appliedDate: '2024-11-07T14:30:00Z'
  },
  {
    _id: '3',
    jobSeekerId: {
      _id: 'js3',
      firstName: 'Lê',
      lastName: 'Văn C',
      email: 'vanc@example.com',
      phone: '0912345678',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
      experience: '4 năm kinh nghiệm Backend với Java',
      education: 'ĐH Khoa học Tự nhiên - ĐHQG HCM'
    },
    postId: {
      _id: 'p2',
      title: 'Backend Developer',
      position: 'Senior',
      company: 'FPT Software'
    },
    resume: 'https://example.com/cv3.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-11-06T09:15:00Z',
    rating: 5
  },
  {
    _id: '4',
    jobSeekerId: {
      _id: 'js4',
      firstName: 'Phạm',
      lastName: 'Thị D',
      email: 'thid@example.com',
      phone: '0909123456',
      skills: ['Python', 'Django', 'Flask', 'PostgreSQL'],
      experience: '1 năm kinh nghiệm Python'
    },
    postId: {
      _id: 'p3',
      title: 'Python Developer',
      position: 'Junior',
      company: 'Tiki Corporation'
    },
    resume: 'https://example.com/cv4.pdf',
    status: ApplicationStatus.REJECTED,
    appliedDate: '2024-11-05T16:45:00Z',
    notes: 'Chưa đủ kinh nghiệm'
  },
  {
    _id: '5',
    jobSeekerId: {
      _id: 'js5',
      firstName: 'Hoàng',
      lastName: 'Văn E',
      email: 'vane@example.com',
      phone: '0911222333',
      skills: ['React Native', 'Flutter', 'Mobile'],
      experience: '3 năm Mobile Development',
      portfolio: 'https://hoangvane.dev'
    },
    postId: {
      _id: 'p4',
      title: 'Mobile Developer',
      position: 'Senior',
      company: 'Shopee Vietnam'
    },
    resume: 'https://example.com/cv5.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-11-04T11:00:00Z',
    rating: 5
  },
  {
    _id: '6',
    jobSeekerId: {
      _id: 'js6',
      firstName: 'Võ',
      lastName: 'Thị F',
      email: 'thif@example.com',
      phone: '0908765432',
      skills: ['UI/UX', 'Figma', 'Adobe XD'],
      experience: '2 năm UI/UX Design'
    },
    postId: {
      _id: 'p5',
      title: 'UI/UX Designer',
      position: 'Middle',
      company: 'VNG Corporation'
    },
    resume: 'https://example.com/cv6.pdf',
    status: ApplicationStatus.PENDING,
    appliedDate: '2024-11-03T08:30:00Z'
  },
  {
    _id: '7',
    jobSeekerId: {
      _id: 'js7',
      firstName: 'Đặng',
      lastName: 'Văn G',
      email: 'vang@example.com',
      phone: '0913456789',
      skills: ['DevOps', 'AWS', 'Kubernetes', 'CI/CD'],
      experience: '5 năm DevOps'
    },
    postId: {
      _id: 'p6',
      title: 'DevOps Engineer',
      position: 'Senior',
      company: 'FPT Software'
    },
    resume: 'https://example.com/cv7.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-11-02T15:20:00Z',
    rating: 4
  },
  {
    _id: '8',
    jobSeekerId: {
      _id: 'js8',
      firstName: 'Bùi',
      lastName: 'Thị H',
      email: 'thih@example.com',
      phone: '0914567890',
      skills: ['QA', 'Selenium', 'Testing', 'Jira'],
      experience: '2 năm QA Engineer'
    },
    postId: {
      _id: 'p7',
      title: 'QA Engineer',
      position: 'Middle',
      company: 'Tiki Corporation'
    },
    resume: 'https://example.com/cv8.pdf',
    status: ApplicationStatus.REVIEWED,
    appliedDate: '2024-11-01T12:00:00Z'
  },
  {
    _id: '9',
    jobSeekerId: {
      _id: 'js9',
      firstName: 'Ngô',
      lastName: 'Văn I',
      email: 'vani@example.com',
      phone: '0915678901',
      skills: ['Data Science', 'Python', 'Machine Learning'],
      experience: '3 năm Data Science'
    },
    postId: {
      _id: 'p8',
      title: 'Data Scientist',
      position: 'Senior',
      company: 'VinID'
    },
    resume: 'https://example.com/cv9.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-10-31T10:30:00Z',
    rating: 5
  },
  {
    _id: '10',
    jobSeekerId: {
      _id: 'js10',
      firstName: 'Trương',
      lastName: 'Thị K',
      email: 'thik@example.com',
      phone: '0916789012',
      skills: ['Product Manager', 'Agile', 'Scrum'],
      experience: '4 năm Product Management'
    },
    postId: {
      _id: 'p9',
      title: 'Product Manager',
      position: 'Senior',
      company: 'Grab Vietnam'
    },
    resume: 'https://example.com/cv10.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-10-30T09:00:00Z',
    rating: 5
  },

  // Page 2 (Items 11-20)
  {
    _id: '11',
    jobSeekerId: {
      _id: 'js11',
      firstName: 'Phan',
      lastName: 'Văn L',
      email: 'vanl@example.com',
      phone: '0917890123',
      skills: ['Fullstack', 'MERN', 'MongoDB', 'Express'],
      experience: '3 năm Fullstack Developer'
    },
    postId: {
      _id: 'p10',
      title: 'Fullstack Developer',
      position: 'Middle',
      company: 'Sendo'
    },
    resume: 'https://example.com/cv11.pdf',
    status: ApplicationStatus.PENDING,
    appliedDate: '2024-10-29T14:20:00Z'
  },
  {
    _id: '12',
    jobSeekerId: {
      _id: 'js12',
      firstName: 'Đinh',
      lastName: 'Thị M',
      email: 'thim@example.com',
      phone: '0918901234',
      skills: ['Content Writer', 'SEO', 'Marketing'],
      experience: '2 năm Content Marketing'
    },
    postId: {
      _id: 'p11',
      title: 'Content Marketing',
      position: 'Junior',
      company: 'Lazada'
    },
    resume: 'https://example.com/cv12.pdf',
    status: ApplicationStatus.REVIEWED,
    appliedDate: '2024-10-28T11:15:00Z'
  },
  {
    _id: '13',
    jobSeekerId: {
      _id: 'js13',
      firstName: 'Dương',
      lastName: 'Văn N',
      email: 'vann@example.com',
      phone: '0919012345',
      skills: ['Blockchain', 'Solidity', 'Smart Contracts'],
      experience: '2 năm Blockchain Developer'
    },
    postId: {
      _id: 'p12',
      title: 'Blockchain Developer',
      position: 'Middle',
      company: 'Sky Mavis'
    },
    resume: 'https://example.com/cv13.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-10-27T10:45:00Z',
    rating: 4
  },
  {
    _id: '14',
    jobSeekerId: {
      _id: 'js14',
      firstName: 'Lý',
      lastName: 'Thị O',
      email: 'thio@example.com',
      phone: '0920123456',
      skills: ['HR', 'Recruitment', 'Talent Acquisition'],
      experience: '3 năm HR Manager'
    },
    postId: {
      _id: 'p13',
      title: 'HR Manager',
      position: 'Senior',
      company: 'Techcombank'
    },
    resume: 'https://example.com/cv14.pdf',
    status: ApplicationStatus.REJECTED,
    appliedDate: '2024-10-26T15:30:00Z'
  },
  {
    _id: '15',
    jobSeekerId: {
      _id: 'js15',
      firstName: 'Mai',
      lastName: 'Văn P',
      email: 'vanp@example.com',
      phone: '0921234567',
      skills: ['Game Dev', 'Unity', 'C#', '3D'],
      experience: '4 năm Game Developer'
    },
    postId: {
      _id: 'p14',
      title: 'Game Developer',
      position: 'Senior',
      company: 'Garena'
    },
    resume: 'https://example.com/cv15.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-10-25T08:00:00Z',
    rating: 5
  },
  {
    _id: '16',
    jobSeekerId: {
      _id: 'js16',
      firstName: 'Hồ',
      lastName: 'Thị Q',
      email: 'thiq@example.com',
      phone: '0922345678',
      skills: ['Business Analyst', 'SQL', 'Tableau'],
      experience: '2 năm BA'
    },
    postId: {
      _id: 'p15',
      title: 'Business Analyst',
      position: 'Middle',
      company: 'Viettel'
    },
    resume: 'https://example.com/cv16.pdf',
    status: ApplicationStatus.PENDING,
    appliedDate: '2024-10-24T13:20:00Z'
  },
  {
    _id: '17',
    jobSeekerId: {
      _id: 'js17',
      firstName: 'Tô',
      lastName: 'Văn R',
      email: 'vanr@example.com',
      phone: '0923456789',
      skills: ['iOS', 'Swift', 'SwiftUI', 'Xcode'],
      experience: '3 năm iOS Developer'
    },
    postId: {
      _id: 'p16',
      title: 'iOS Developer',
      position: 'Senior',
      company: 'Momo'
    },
    resume: 'https://example.com/cv17.pdf',
    status: ApplicationStatus.REVIEWED,
    appliedDate: '2024-10-23T09:45:00Z'
  },
  {
    _id: '18',
    jobSeekerId: {
      _id: 'js18',
      firstName: 'Đỗ',
      lastName: 'Thị S',
      email: 'this@example.com',
      phone: '0924567890',
      skills: ['Android', 'Kotlin', 'Jetpack Compose'],
      experience: '3 năm Android Developer'
    },
    postId: {
      _id: 'p17',
      title: 'Android Developer',
      position: 'Senior',
      company: 'ZaloPay'
    },
    resume: 'https://example.com/cv18.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-10-22T11:00:00Z',
    rating: 4
  },
  {
    _id: '19',
    jobSeekerId: {
      _id: 'js19',
      firstName: 'Cao',
      lastName: 'Văn T',
      email: 'vant@example.com',
      phone: '0925678901',
      skills: ['Security', 'Penetration Testing', 'Network'],
      experience: '5 năm Security Engineer'
    },
    postId: {
      _id: 'p18',
      title: 'Security Engineer',
      position: 'Senior',
      company: 'VNG Corporation'
    },
    resume: 'https://example.com/cv19.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-10-21T14:15:00Z',
    rating: 5
  },
  {
    _id: '20',
    jobSeekerId: {
      _id: 'js20',
      firstName: 'Huỳnh',
      lastName: 'Thị U',
      email: 'thiu@example.com',
      phone: '0926789012',
      skills: ['Project Manager', 'PMP', 'Leadership'],
      experience: '6 năm PM'
    },
    postId: {
      _id: 'p19',
      title: 'Project Manager',
      position: 'Senior',
      company: 'FPT Software'
    },
    resume: 'https://example.com/cv20.pdf',
    status: ApplicationStatus.PENDING,
    appliedDate: '2024-10-20T10:30:00Z'
  },

  // Page 3 (Items 21-25)
  {
    _id: '21',
    jobSeekerId: {
      _id: 'js21',
      firstName: 'Lưu',
      lastName: 'Văn V',
      email: 'vanv@example.com',
      phone: '0927890123',
      skills: ['AI', 'TensorFlow', 'Deep Learning'],
      experience: '4 năm AI Engineer'
    },
    postId: {
      _id: 'p20',
      title: 'AI Engineer',
      position: 'Senior',
      company: 'VinAI'
    },
    resume: 'https://example.com/cv21.pdf',
    status: ApplicationStatus.REVIEWED,
    appliedDate: '2024-10-19T15:00:00Z',
    rating: 5
  },
  {
    _id: '22',
    jobSeekerId: {
      _id: 'js22',
      firstName: 'Tăng',
      lastName: 'Thị W',
      email: 'thiw@example.com',
      phone: '0928901234',
      skills: ['Sales', 'B2B', 'CRM'],
      experience: '3 năm Sales Manager'
    },
    postId: {
      _id: 'p21',
      title: 'Sales Manager',
      position: 'Middle',
      company: 'Salesforce Vietnam'
    },
    resume: 'https://example.com/cv22.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-10-18T12:30:00Z',
    rating: 4
  },
  {
    _id: '23',
    jobSeekerId: {
      _id: 'js23',
      firstName: 'Ông',
      lastName: 'Văn X',
      email: 'vanx@example.com',
      phone: '0929012345',
      skills: ['Cloud', 'Azure', 'GCP', 'Terraform'],
      experience: '4 năm Cloud Architect'
    },
    postId: {
      _id: 'p22',
      title: 'Cloud Architect',
      position: 'Senior',
      company: 'Microsoft Vietnam'
    },
    resume: 'https://example.com/cv23.pdf',
    status: ApplicationStatus.REJECTED,
    appliedDate: '2024-10-17T09:20:00Z'
  },
  {
    _id: '24',
    jobSeekerId: {
      _id: 'js24',
      firstName: 'Quách',
      lastName: 'Thị Y',
      email: 'thiy@example.com',
      phone: '0930123456',
      skills: ['Graphic Design', 'Photoshop', 'Illustrator'],
      experience: '2 năm Graphic Designer'
    },
    postId: {
      _id: 'p23',
      title: 'Graphic Designer',
      position: 'Junior',
      company: 'Canva Vietnam'
    },
    resume: 'https://example.com/cv24.pdf',
    status: ApplicationStatus.APPROVED,
    appliedDate: '2024-10-16T11:45:00Z',
    rating: 4
  },
  {
    _id: '25',
    jobSeekerId: {
      _id: 'js25',
      firstName: 'Ứng',
      lastName: 'Văn Z',
      email: 'vanz@example.com',
      phone: '0931234567',
      skills: ['SAP', 'ERP', 'Finance', 'Accounting'],
      experience: '5 năm SAP Consultant'
    },
    postId: {
      _id: 'p24',
      title: 'SAP Consultant',
      position: 'Senior',
      company: 'Deloitte Vietnam'
    },
    resume: 'https://example.com/cv25.pdf',
    status: ApplicationStatus.PENDING,
    appliedDate: '2024-10-15T08:15:00Z'
  }
];