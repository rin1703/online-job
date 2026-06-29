/**
 * DTO for filtering and searching job listings
 * Dành cho query params (GET /api/v1/job-listings)
 */

export class FilterJobDTO {
  // 🔍 Từ khóa tìm kiếm (áp dụng cho title, skills, company)
  keyword?: string;

  // 🔹 Lọc theo ngành nghề (Industry)
  industryIds?: string[];

  // 🔹 Lọc theo loại công việc (Full-time, Part-time, Internship, v.v.)
  jobTypeId?: string;

  // 🔹 Lọc theo địa điểm (City, LocationId)
  locationId?: string;
  locationIds?: string[]; // Multiple location IDs
  city?: string; // FE gửi 'location.city' hoặc 'city'

  // 🔹 Lọc theo cấp độ kinh nghiệm
  experienceLevel?: string; // e.g. "Entry", "Mid", "Senior"
  experienceLevels?: string[]; // Multiple experience levels

  // 🔹 Lọc theo mức lương tối thiểu và tối đa
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;

  // 🔹 Hình thức làm việc
  isRemote?: boolean;
  isHybrid?: boolean;

  // 🔹 Chỉ lấy job đang hoạt động
  status?: string; // e.g. "active"
  approvalStatus?: string; // default approved for job seekers

  // 🔹 Sắp xếp (newest, highestSalary, etc.)
  sortBy?: "newest" | "oldest" | "highestSalary" | "lowestSalary";

  // 🔹 Phân trang
  page?: number;
  limit?: number;

  constructor(query: any) {
    // 🔐 Keyword validation: max 200 chars, trim whitespace
    if (query.keyword) {
      const trimmed = String(query.keyword).trim();
      this.keyword = trimmed.length > 200 ? trimmed.substring(0, 200) : trimmed;
    } else {
      this.keyword = "";
    }

    // Industry IDs - ensure array format
    this.industryIds = query.industryId;

    this.jobTypeId = query.jobTypeId;
    this.locationId = query.locationId;

    // Location IDs - parse as array, handle comma-separated strings
    this.locationIds = query.locationIds
      ? typeof query.locationIds === 'string'
        ? query.locationIds.split(',').filter((id: string) => id.trim().length > 0)
        : Array.isArray(query.locationIds)
        ? query.locationIds.filter((id: string) => id && String(id).trim().length > 0)
        : undefined
      : undefined;

    this.city = query["location.city"] || query.city;
    this.experienceLevel = query.experienceLevel;

    // Experience Levels - parse as array, handle comma-separated strings
    this.experienceLevels = query.experienceLevels
      ? typeof query.experienceLevels === 'string'
        ? query.experienceLevels.split(',').filter((exp: string) => exp.trim().length > 0)
        : Array.isArray(query.experienceLevels)
        ? query.experienceLevels.filter((exp: string) => exp && String(exp).trim().length > 0)
        : undefined
      : undefined;

    // 💰 Salary validation: ensure positive numbers, min <= max
    const salaryMin = query.salaryMin ? Number(query.salaryMin) : undefined;
    const salaryMax = query.salaryMax ? Number(query.salaryMax) : undefined;

    // Validate salary min
    if (salaryMin !== undefined && !isNaN(salaryMin) && salaryMin >= 0) {
      this.salaryMin = salaryMin;
    }
    // Validate salary max
    if (salaryMax !== undefined && !isNaN(salaryMax) && salaryMax >= 0) {
      this.salaryMax = salaryMax;
    }
    // Ensure min <= max if both are provided
    if (this.salaryMin !== undefined && this.salaryMax !== undefined && this.salaryMin > this.salaryMax) {
      // Swap them
      [this.salaryMin, this.salaryMax] = [this.salaryMax, this.salaryMin];
    }

    this.salaryCurrency = query.salaryCurrency || "USD";
    this.isRemote = query.isRemote === "true" ? true : undefined;
    this.isHybrid = query.isHybrid === "true" ? true : undefined;
    this.status = query.status || "active";
    this.approvalStatus = query.approvalStatus || "approved";

    // 🔽 Sort validation: only allow valid sort options
    const validSorts = ["newest", "oldest", "highestSalary", "lowestSalary"];
    this.sortBy = validSorts.includes(query.sortBy) ? query.sortBy : "newest";

    // 📄 Pagination validation: ensure valid page and limit
    this.page = Math.max(1, query.page ? Number(query.page) : 1);
    this.limit = Math.min(100, Math.max(1, query.limit ? Number(query.limit) : 10)); // 1-100
  }
}
