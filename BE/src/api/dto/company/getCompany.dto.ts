export class GetCompanyResponseDTO {
    _id: string;
    name: string;
    description?: string;
    website?: string;
    websiteDomain?: string;
    email?: string;
    phone?: string;
    logo?: string;
    industryId?: string;
    employeeCount?: any;
    foundedYear?: number;
    verificationStatus?: string;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: any) {
        this._id = data._id;
        this.name = data.name;
        this.description = data.description;
        this.website = data.website;
        this.websiteDomain = data.websiteDomain;
        this.email = data.email;
        this.phone = data.phone;
        this.logo = data.logo;
        this.industryId = data.industryId;
        this.employeeCount = data.employeeCount;
        this.foundedYear = data.foundedYear;
        this.verificationStatus = data.verificationStatus;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
