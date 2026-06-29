export class RecruiterFilterDTO {
  keyword?: string;
  status?: "draft" | "active" | "hidden" | "closed";
  experienceLevel?: string;
  sortBy?: "createdAt" | "updatedAt" | "views";
  sortDirection?: "ASC" | "DESC";
  page: number;
  limit: number;

  constructor(query: any) {
    this.keyword = query.keyword || "";
    this.status = query.status as any;
    this.experienceLevel = query.experienceLevel;
    this.sortBy = (query.sortBy as any) || "createdAt";
    this.sortDirection = (query.sortDirection as any) || "DESC";
    this.page = query.page ? Number(query.page) : 1;
    this.limit = query.limit ? Number(query.limit) : 10;
  }
}
