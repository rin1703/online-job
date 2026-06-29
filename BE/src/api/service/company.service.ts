// @ts-nocheck
import Company from "../models/company.model";
import User from "../models/user.model";
import IndustryModel from "../models/industry.model";
import { RegisterRecruiterDTO } from "../dto/recruiter/registerRecuiter.dto";
import { normalizeCompanyName, normalizeDomain } from "../../helper/utils.helper";
import { GetCompanyResponseDTO } from "../dto/company/getCompany.dto";
import { GetCompanyAdminDTO } from "../dto/company/getCompanyAdmin.dto";
import { GetCompanyDetailRecruiterDTO } from "../dto/company/getCompanyDetailRecruiter.dto";

/**
 * Ensure Company tồn tại (idempotent, không dùng transaction)
 * Option 3 — Cho phép tạo Company không có website, thêm verificationStatus
 */
export async function ensureCompany(
  dto: RegisterRecruiterDTO,
  websiteDomainInput?: string
): Promise<any> {
  const trimmedName = (dto.companyName ?? "").trim();
  if (!trimmedName) throw new Error("companyName is required");

  // 1) Chuẩn hoá name & domain
  const normalizedName = normalizeCompanyName(trimmedName);
  const websiteRaw = (dto.companyWebsite ?? "").trim();
  const websiteDomain = normalizeDomain(websiteRaw || websiteDomainInput || "");

  // 2) Tìm theo taxCode trước (ổn định nhất), fallback normalizedName
  let company =
    (dto.taxCode && (await Company.findOne({ taxCode: dto.taxCode }))) ||
    (websiteDomain && (await Company.findOne({ websiteDomain }))) ||
    (await Company.findOne({ normalizedName }));

  // 3) Chưa có -> upsert (idempotent, tránh race)
  if (!company) {
    try {
      // Phân loại trạng thái xác minh ban đầu
      const verificationStatus = dto.taxCode
        ? "pending" // có taxCode, có thể xác minh
        : "no_tax_code"; // không có taxCode, cần kiểm chứng thủ công

      company = await Company.findOneAndUpdate(
        dto.taxCode
          ? { $or: [{ taxCode: dto.taxCode }, { normalizedName }] }
          : websiteDomain
            ? { $or: [{ websiteDomain }, { normalizedName }] }
            : { normalizedName },
        {
          $setOnInsert: {
            name: trimmedName,
            normalizedName,
            isVerified: false,
            verificationStatus,
          },
          // Luôn set taxCode và website info
          $set: {
            ...(dto.taxCode && { taxCode: dto.taxCode }),
            ...(websiteRaw && { website: websiteRaw }),
            ...(websiteDomain && { websiteDomain }),
          },
        },
        { new: true, upsert: true }
      );
    } catch (e: any) {
      // Có thể đụng unique index do race -> reread
      if (e?.code === 11000) {
        company =
          (dto.taxCode && (await Company.findOne({ taxCode: dto.taxCode }))) ||
          (websiteDomain && (await Company.findOne({ websiteDomain }))) ||
          (await Company.findOne({ normalizedName }));
      } else {
        throw e;
      }
    }
  }

  if (!company?._id) throw new Error("Failed to resolve companyId");
  return company;
}

/**
 * Get all companies with optional pagination
 */
export async function getAllCompanies(
  page: number = 1,
  limit: number = 10
): Promise<any> {
  const skip = (page - 1) * limit;
  const companies = await Company.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Company.countDocuments();

  const companiesDTO = companies.map(
    (company) => new GetCompanyResponseDTO(company)
  );

  return {
    companies: companiesDTO,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get company by ID
 */
export async function getCompanyById(id: string): Promise<any> {
  const company = await Company.findById(id);
  if (!company) {
    throw new Error("Company not found");
  }
  return new GetCompanyResponseDTO(company);
}

/**
 * Get company by User ID
 */
export async function getCompanyByUserId(userId: string): Promise<any> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.companyId) {
    throw new Error("User does not belong to any company");
  }

  const company = await Company.findById(user.companyId);
  if (!company) {
    throw new Error("Company not found");
  }

  return new GetCompanyResponseDTO(company);
}

/**
 * Create a new company
 */
export async function createCompany(data: any): Promise<any> {
  const trimmedName = (data.name ?? "").trim();
  if (!trimmedName) throw new Error("Company name is required");

  const normalizedName = normalizeCompanyName(trimmedName);
  const websiteDomain = data.website
    ? normalizeDomain(data.website)
    : undefined;

  const companyData: any = {
    name: trimmedName,
    normalizedName,
    ...(data.taxCode && { taxCode: data.taxCode }),
    ...(data.description && { description: data.description }),
    ...(data.website && { website: data.website }),
    ...(websiteDomain && { websiteDomain }),
    ...(data.email && { email: data.email }),
    ...(data.phone && { phone: data.phone }),
    ...(data.logo && { logo: data.logo }),
    ...(data.industryId && { industryId: data.industryId }),
    ...(data.employeeCount && { employeeCount: data.employeeCount }),
    ...(data.foundedYear && { foundedYear: data.foundedYear }),
    verificationStatus: data.taxCode ? "pending" : "no_tax_code",
    isVerified: false,
  };

  const company = new Company(companyData);
  await company.save();
  return company;
}

/**
 * Update company by ID
 */
export async function updateCompany(id: string, data: any): Promise<any> {
  const updateData: any = {};

  if (data.name) {
    const trimmedName = data.name.trim();
    updateData.name = trimmedName;
    updateData.normalizedName = normalizeCompanyName(trimmedName);
  }

  if (data.website) {
    updateData.website = data.website;
    updateData.websiteDomain = normalizeDomain(data.website);
  }

  // Update other fields if provided
  const allowedFields = [
    "taxCode",
    "description",
    "email",
    "phone",
    "logo",
    "verificationStatus",
    "industryId",
    "employeeCount",
    "foundedYear",
    "isVerified",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const company = await Company.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!company) {
    throw new Error("Company not found");
  }

  return company;
}

/**
 * Delete company by ID
 */
export async function deleteCompany(id: string): Promise<any> {
  const company = await Company.findByIdAndDelete(id);
  if (!company) {
    throw new Error("Company not found");
  }
  return { message: "Company deleted successfully", company };
}

/**
 * Get all companies for Admin (includes internal fields)
 */
export async function getAllCompaniesAdmin(
  page: number = 1,
  limit: number = 10
): Promise<any> {
  const skip = (page - 1) * limit;
  const companies = await Company.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Company.countDocuments();

  const companiesDTO = companies.map(
    (company) => new GetCompanyAdminDTO(company)
  );

  return {
    companies: companiesDTO,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get company detail for Recruiter (includes internal fields)
 */
export async function getCompanyDetailRecruiter(id: string): Promise<any> {
  const company = await Company.findById(id);
  if (!company) {
    throw new Error("Company not found");
  }
  return new GetCompanyDetailRecruiterDTO(company);
}

/**
 * Get company detail for Recruiter by User ID (includes internal fields)
 */
export async function getCompanyDetailRecruiterByUserId(userId: string): Promise<any> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.companyId) {
    throw new Error("User does not belong to any company");
  }

  const company = await Company.findById(user.companyId).populate(
    "industryId",
    "name description"
  );
  if (!company) {
    throw new Error("Company not found");
  }

  return new GetCompanyDetailRecruiterDTO(company);
}

/**
 * Get company detail for Admin by ID (includes internal fields)
 */
export async function getCompanyDetailAdmin(id: string): Promise<any> {
  const company = await Company.findById(id).populate(
    "industryId",
    "name description"
  );
  if (!company) {
    throw new Error("Company not found");
  }
  return new GetCompanyAdminDTO(company);
}

/**
 * Filter companies by employeeCount, foundedYear, name, industry
 * Supports sorting: asc (A-Z) or desc (Z-A) by name
 */
export async function filterCompanies(filters: any): Promise<any> {
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  // Determine sort order early (needed for both aggregation and regular find)
  let sortOrder = 1; // default: A-Z (asc)
  if (filters.sort === "desc" || filters.sort === "z-a") {
    sortOrder = -1; // Z-A (desc)
  }

  // Build query object
  const query: any = {};

  // Filter by name (case-insensitive partial match)
  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  // Filter by employeeCount (only accept predefined values: medium, large, verylarge)
  // Handle both formats: DB stores like "Medium (100–999)" and FE sends like "Medium", "Large", "Very Large"
  if (filters.employeeCount) {
    const normalizedCount = String(filters.employeeCount).toLowerCase().trim();

    // Map FE input to possible DB formats
    const employeeCountMap: Record<string, string[]> = {
      "medium": ["medium", "medium (100–999)", "medium (100-999)"],
      "large": ["large", "large (1,000–4,999)", "large (1000-4999)"],
      "verylarge": ["verylarge", "very large", "very large (5,000+)", "very large (5000+)"],
    };

    // Find the matching pattern
    let found = false;
    for (const [key, patterns] of Object.entries(employeeCountMap)) {
      if (patterns.some(p => p.toLowerCase() === normalizedCount)) {
        // Use regex to match any format starting with this category
        const startPattern = key === "verylarge" ? "very large" : key;
        query.employeeCount = { $regex: `^${startPattern}`, $options: "i" };
        found = true;
        break;
      }
    }

    // Invalid employeeCount is silently ignored (not included in query)
  }

  // Filter by foundedYear (range: from-to)
  if (filters.foundedYearFrom || filters.foundedYearTo) {
    query.foundedYear = {};
    if (filters.foundedYearFrom) {
      query.foundedYear.$gte = parseInt(filters.foundedYearFrom);
    }
    if (filters.foundedYearTo) {
      query.foundedYear.$lte = parseInt(filters.foundedYearTo);
    }
  }

  if (filters.industry) {
    // Use aggregation to match industry name via lookup
    const industryRegex = { $regex: filters.industry, $options: "i" };

    const companies = await Company.aggregate([
      {
        $lookup: {
          from: "industries", // collection name for Industry model
          localField: "industryId",
          foreignField: "_id",
          as: "industryData",
        },
      },
      {
        $match: {
          $or: [
            { "industryData.name": industryRegex },
            { ...query }, // include other filters
          ],
        },
      },
      { $sort: { name: sortOrder } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await Company.aggregate([
      {
        $lookup: {
          from: "industries",
          localField: "industryId",
          foreignField: "_id",
          as: "industryData",
        },
      },
      {
        $match: {
          $or: [{ "industryData.name": industryRegex }, { ...query }],
        },
      },
      { $count: "count" },
    ]);

    return {
      companies,
      pagination: {
        page,
        limit,
        total: total[0]?.count || 0,
        totalPages: Math.ceil((total[0]?.count || 0) / limit),
      },
    };
  }

  const companies = await Company.find(query)
    .populate("industryId", "name description")
    .sort({ name: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await Company.countDocuments(query);

  return {
    companies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get all industries. Auto-seeds default industries if the collection is empty.
 */
export async function getIndustriesService(): Promise<any[]> {
  let industries = await IndustryModel.find().sort({ name: 1 });
  if (industries.length === 0) {
    const defaultIndustries = [
      { name: "Information Technology", description: "Software development, hardware, IT services, and networking." },
      { name: "Finance & Banking", description: "Banking, investment, insurance, and financial services." },
      { name: "Healthcare & Medical", description: "Hospitals, clinics, medical devices, and healthcare services." },
      { name: "Education & Training", description: "Schools, universities, online learning, and training programs." },
      { name: "Marketing & Advertising", description: "Public relations, digital marketing, advertising agencies, and branding." },
      { name: "E-commerce & Retail", description: "Online platforms, retail chains, supermarket networks, and wholesale." },
      { name: "Construction & Real Estate", description: "Civil construction, architecture, interior design, and real estate services." },
      { name: "Manufacturing & Production", description: "Industrial goods, consumer manufacturing, factory operations, and raw materials." },
      { name: "Tourism & Hospitality", description: "Hotels, resorts, travel agencies, tour operators, and event hosting." },
      { name: "Food & Beverage", description: "Restaurants, cafes, food processing, F&B supplies, and beverage production." },
      { name: "Human Resources", description: "Recruitment services, headhunting, HR outsourcing, and training." },
      { name: "Logistics & Supply Chain", description: "Freight forwarding, warehousing, distribution, shipping, and supply chain management." },
    ];
    await IndustryModel.insertMany(defaultIndustries);
    industries = await IndustryModel.find().sort({ name: 1 });
  }
  return industries;
}

