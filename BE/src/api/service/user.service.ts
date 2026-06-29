// @ts-nocheck
import User from "../models/user.model";
import { Profile } from "../models/profile.model";
import { RegisterUserDTO } from "../dto/user/registerUser.dto";
import { RegisterRecruiterDTO } from "../dto/recruiter/registerRecuiter.dto";
import { LoginUserDTO } from "../dto/user/loginUser.dto";
import Company from "../models/company.model";
import CompanyLocation from "../models/companyLocation.model";
import { UserRole } from "../models/enum/userRole.enum";
import { AccountStatus } from "../models/enum/accountStatus.enum";
import { ensureCompany } from "./company.service";
import { ensureCompanyLocation } from "./companyLocation.service";
import mongoose from "mongoose";
import {
  SECURITY_CONSTANTS,
  ERROR_MESSAGES,
  DEFAULT_VALUES,
} from "../../helper/constants.helper";
import { extractDomainFromUrl } from "../../helper/utils.helper";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
} from "../modules/auth";
import {
  validateEmailAvailability,
  validateUserAccount,
  checkAccountLockStatus,
  validatePasswordAndUpdateAttempts,
  findUserByEmail,
} from "../middleware/validation";
import { WalletModel } from "../models/wallet.model";
import { Manager } from "socket.io-client";

/**
 * Registers a new user in the system
 * Hashes password and creates user account
 * Automatically creates a basic profile for the user
 */
export const registerUser = async (
  registrationData: RegisterUserDTO
): Promise<any> => {
  try {
    await validateEmailAvailability((registrationData as any).email);

    const role = (registrationData as any).role || UserRole.JOB_SEEKER;

    const hashedPassword = await hashPassword((registrationData as any).password);

    const newUser = new User({
      email: (registrationData as any).email,
      password: hashedPassword,
      firstName: (registrationData as any).firstName,
      lastName: (registrationData as any).lastName,
      birthday: (registrationData as any).birthday,
      phone: (registrationData as any).phone,
      role,
      isActive: DEFAULT_VALUES.IS_ACTIVE,
      loginAttempts: DEFAULT_VALUES.INITIAL_LOGIN_ATTEMPTS,
    });

    const savedUser = await newUser.save();

    // Tự động tạo profile cho user mới
    await createDefaultProfile(savedUser);

    return savedUser;
  } catch (error) {
    throw error;
  }
};

/**
 * Registers a new recruiter with company information
 * Creates user account linked to company
 * Automatically creates a basic profile for the recruiter
 */
export const registerRecruiter = async (
  dto: RegisterRecruiterDTO
): Promise<any> => {
  // Validate email availability
  await validateEmailAvailability((dto as any).email);

  // Validate tax code uniqueness
  const existingCompany = await Company.findOne({ taxCode: dto.taxCode });
  if (existingCompany) {
    throw new Error("Mã số thuế đã được sử dụng bởi công ty khác");
  }

  const company = await ensureCompany(dto);
  let location;
  if (dto.location) {
   const locationResult = await ensureCompanyLocation({
      companyId: new (mongoose as any).Types.ObjectId(company._id.toString()),
      address: dto.location.address,
      district: dto.location.district,
      city: dto.location.city,
      isHeadquarters: true,
    });
    location = locationResult.doc;
  }

  const hashedPassword = await hashPassword((dto as any).password);

  const user = await User.create({
    email: (dto as any).email,
    password: hashedPassword,
    firstName: (dto as any).firstName,
    lastName: (dto as any).lastName,
    birthday: (dto as any).birthday,
    phone: (dto as any).phone,
    role: UserRole.RECRUITER,
    isActive: false,
    accountStatus: AccountStatus.PENDING, // Recruiter mặc định chờ duyệt
    companyId: company._id,
    managerId: location?._id,
    loginAttempts: DEFAULT_VALUES.INITIAL_LOGIN_ATTEMPTS,
  });

  // Tự động tạo profile cho recruiter mới
  await createDefaultProfile(user, company.name);
  await WalletModel.create({ recruiterId: user._id, balance: 0 });

  return user;
};

/**
 * Authenticates user credentials and generates JWT token
 * Implements account locking after multiple failed attempts
 */
export const loginUser = async (loginCredentials: LoginUserDTO) => {
  try {
    const user = await findUserByEmail((loginCredentials as any).email);

    validateUserAccount(user);

    await checkAccountLockStatus(user);

    await validatePasswordAndUpdateAttempts(user, (loginCredentials as any).password);

    const authToken = generateAuthToken(user);

    return { token: authToken };
  } catch (error) {
    throw error;
  }
};

/**
 * Finds user by email address
 */
async function findUserByEmail(email: string): Promise<InstanceType<typeof User>> {
  const user = await User.findOne({ email, isDeleted: { $ne: true } });

  if (!user) {
    throw new Error(ERROR_MESSAGES.INVALID_EMAIL_PASSWORD);
  }

  return user;
}

/**
 * Validates user account is active
 */
function validateUserAccount(user: InstanceType<typeof User>): void {
  // Check if user is deleted (soft delete)
  if (user.isDeleted) {
    throw new Error("Tài khoản này đã bị xóa");
  }

  if (!user.isActive) {
    throw new Error(ERROR_MESSAGES.ACCOUNT_DISABLED);
  }
}

/**
 * Checks if account is temporarily locked
 */
async function checkAccountLockStatus(user: any): Promise<void> {
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new Error(formatLockTimeMessage(user.lockUntil));
  }
}

/**
 * Validates password and manages login attempts
 * Locks account after maximum failed attempts
 */
async function validatePasswordAndUpdateAttempts(
  user: any,
  plainPassword: string
): Promise<void> {
  const isPasswordValid = await comparePassword(plainPassword, (user as any).password);

  if (!isPasswordValid) {
    await handleFailedLoginAttempt(user);
  }

  await resetLoginAttempts(user);
}

/**
 * Handles failed login attempt
 * Increments counter and locks account if needed
 */
async function handleFailedLoginAttempt(user: any): Promise<void> {
  (user as any).loginAttempts = ((user as any).loginAttempts || DEFAULT_VALUES.INITIAL_LOGIN_ATTEMPTS) + 1;

  const shouldLockAccount = (user as any).loginAttempts >= SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS;

  if (shouldLockAccount) {
    user.lockUntil = new Date(Date.now() + getLockTimeInMilliseconds());
    await user.save();
    throw new Error(formatMaxAttemptsExceededMessage());
  }

  await user.save();

  const remainingAttempts = SECURITY_CONSTANTS.MAX_LOGIN_ATTEMPTS - (user as any).loginAttempts;
  throw new Error(formatLoginAttemptsMessage(remainingAttempts));
}

/**
 * Resets login attempts after successful login
 */
async function resetLoginAttempts(user: any): Promise<void> {
  const needsReset = (user as any).loginAttempts > DEFAULT_VALUES.INITIAL_LOGIN_ATTEMPTS || user.lockUntil;

  if (needsReset) {
    (user as any).loginAttempts = DEFAULT_VALUES.INITIAL_LOGIN_ATTEMPTS;
    user.lockUntil = null;
    await user.save();
  }
}

/**
 * Creates a default profile for newly registered user
 * @param user - The newly created user document
 * @param companyName - Optional company name for recruiters
 */
async function createDefaultProfile(user: any, companyName?: string): Promise<void> {
  try {
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    const defaultProfile = {
      user: user._id,
      name: fullName,
      email: user.email,
      phone: user.phone,
      avatar: null,
      title: null,
      company: companyName || null,
      bio: null,
      location: null,
      expectedSalary: null,
      careerObjective: null,
      cv: null,
      socialLinks: [],
      jobSkills: {
        frontend: [],
        backend: [],
        devops: [],
        softSkills: [],
      },
      workExperiences: [],
      education: [],
      projects: [],
      certificates: [],
    };

    const createdProfile = await Profile.create(defaultProfile);

    // Save profileId reference back to user for quick lookups
    user.profileId = createdProfile._id;
    await user.save();
  } catch (error) {
    // Throw error so caller can handle it properly
    // This ensures user account creation is properly validated
    console.error("Error creating default profile:", error);
    throw new Error(`Profile creation failed for user ${user.email}: ${(error as any).message}`);
  }
}

/**
 * Generates JWT authentication token
 */
function generateAuthToken(user: any): string {
  return generateAccessToken({
    userId: user._id.toString(),
    email: (user as any).email,
    role: (user as any).role,
    firstName: (user as any).firstName,
    lastName: (user as any).lastName,
  });
}

/**
 * Gets user by ID with basic information
 */
export const getUserById = async (userId: string) => {
  return User.findById(userId)
    .select('firstName lastName email phone role companyId profileId isActive accountStatus')
    .lean();
};

/**
 * Gets recruiter profile including company information
 */
export const getRecruiterProfile = async (userId: string) => {
  const user = await User.findById(userId)
    .populate('companyId', 'name description website email phone logo industryId employeeCount foundedYear')
    .select('firstName lastName email phone role companyId profileId isActive accountStatus')
    .lean();

  if (!user) {
    return null;
  }

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      accountStatus: user.accountStatus,
    },
    company: user.companyId,
  };
};

export default {
  registerUser,
  registerRecruiter,
  loginUser,
  getUserById,
  getRecruiterProfile,
};
