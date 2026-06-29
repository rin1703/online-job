// Mock user data
const users = [
  {
    id: 1,
    email: "admin@jobportal.com",
    password: "admin123",
    role: "admin",
    firstName: "System",
    lastName: "Administrator",
    phone: "+1234567890",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    email: "recruiter@techcorp.com",
    password: "employer123",
    role: "recruiter",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1234567891",
    companyId: 1,
    isActive: true,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:00:00Z"
  },
  {
    id: 3,
    email: "recruiter@innovate.com",
    password: "employer123",
    role: "recruiter",
    firstName: "Michael",
    lastName: "Chen",
    phone: "+1234567892",
    companyId: 2,
    isActive: true,
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-20T09:00:00Z"
  },
  {
    id: 4,
    email: "john.doe@email.com",
    password: "john123",
    role: "job_seeker",
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567893",
    isActive: true,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z"
  }
];

// Auth service mock
export const authService = {
  // Register a new user
  register: async (userData: any) => {
    // Check if email already exists
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      ...userData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, we would save to database
    users.push(newUser);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
  
  // Login user
  login: async (email: string, password: string) => {
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: `mock-jwt-token-${user.id}-${Date.now()}`
    };
  }
};
