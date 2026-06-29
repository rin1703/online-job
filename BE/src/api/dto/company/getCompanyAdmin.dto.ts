export class GetCompanyAdminDTO {
    _id: string;
    name: string;
    normalizedName: string;
    taxCode?: string;
    description?: string;
    website?: string;
    websiteDomain?: string;
    email?: string;
    phone?: string;
    logo?: string;
    industry?: any;
    employeeCount?: any;
    foundedYear?: number;
    verificationStatus?: string;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: any) {
        this._id = data._id;
        this.name = data.name;
        this.normalizedName = data.normalizedName;
        this.taxCode = data.taxCode;
        this.description = data.description;
        this.website = data.website;
        this.websiteDomain = data.websiteDomain;
        this.email = data.email;
        this.phone = data.phone;
        this.logo = data.logo;
        this.industry = data.industryId;
        this.employeeCount = data.employeeCount;
        this.foundedYear = data.foundedYear;
        this.verificationStatus = data.verificationStatus;
        this.isVerified = data.isVerified;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
