export class UpdateCompanyDTO {
    name?: string;
    taxCode?: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    logo?: string;
    verificationStatus?: string;
    industryId?: string;
    employeeCount?: string | number;
    foundedYear?: number;
    isVerified?: boolean;

    constructor(data: {
        name?: string;
        taxCode?: string;
        description?: string;
        website?: string;
        email?: string;
        phone?: string;
        logo?: string;
        verificationStatus?: string;
        industryId?: string;
        employeeCount?: string | number;
        foundedYear?: number;
        isVerified?: boolean;
    }) {
        // All fields are optional for update
        if (data.name !== undefined) {
            const trimmedName = data.name.trim();
            if (trimmedName === "") {
                throw new Error("Company name cannot be empty");
            }
            this.name = trimmedName;
        }

        if (data.taxCode !== undefined) {
            this.taxCode = data.taxCode.trim();
        }

        if (data.description !== undefined) {
            this.description = data.description.trim();
        }

        if (data.website !== undefined) {
            const trimmedWebsite = data.website.trim();
            if (trimmedWebsite && !this.isValidUrl(trimmedWebsite)) {
                throw new Error("Invalid website URL format");
            }
            this.website = trimmedWebsite;
        }

        if (data.email !== undefined) {
            const trimmedEmail = data.email.trim();
            if (trimmedEmail && !this.isValidEmail(trimmedEmail)) {
                throw new Error("Invalid email format");
            }
            this.email = trimmedEmail;
        }

        if (data.phone !== undefined) {
            this.phone = data.phone.trim();
        }

        if (data.logo !== undefined) {
            this.logo = data.logo.trim();
        }

        if (data.verificationStatus !== undefined) {
            const validStatuses = ["pending", "verified", "rejected", "no_tax_code"];
            if (!validStatuses.includes(data.verificationStatus)) {
                throw new Error(
                    `Invalid verification status. Must be one of: ${validStatuses.join(", ")}`
                );
            }
            this.verificationStatus = data.verificationStatus;
        }

        if (data.industryId !== undefined) {
            this.industryId = data.industryId;
        }

        if (data.employeeCount !== undefined) {
            this.employeeCount = data.employeeCount;
        }

        if (data.foundedYear !== undefined) {
            const currentYear = new Date().getFullYear();
            if (data.foundedYear < 1800 || data.foundedYear > currentYear) {
                throw new Error(`Founded year must be between 1800 and ${currentYear}`);
            }
            this.foundedYear = data.foundedYear;
        }

        if (data.isVerified !== undefined) {
            this.isVerified = data.isVerified;
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}
