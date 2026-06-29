export class CreateCompanyDTO {
    name: string;
    taxCode?: string;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
    logo?: string;
    industryId?: string;
    employeeCount?: string | number;
    foundedYear?: number;

    constructor(data: {
        name: string;
        taxCode?: string;
        description?: string;
        website?: string;
        email?: string;
        phone?: string;
        logo?: string;
        industryId?: string;
        employeeCount?: string | number;
        foundedYear?: number;
    }) {
        // Required fields
        if (!data.name || data.name.trim() === "") {
            throw new Error("Company name is required");
        }
        this.name = data.name.trim();

        // Optional fields
        this.taxCode = data.taxCode?.trim();
        this.description = data.description?.trim();
        this.website = data.website?.trim();
        this.email = data.email?.trim();
        this.phone = data.phone?.trim();
        this.logo = data.logo?.trim();
        this.industryId = data.industryId;
        this.employeeCount = data.employeeCount;
        this.foundedYear = data.foundedYear;

        // Validate email format if provided
        if (this.email && !this.isValidEmail(this.email)) {
            throw new Error("Invalid email format");
        }

        // Validate website format if provided
        if (this.website && !this.isValidUrl(this.website)) {
            throw new Error("Invalid website URL format");
        }

        // Validate founded year if provided
        if (this.foundedYear) {
            const currentYear = new Date().getFullYear();
            if (this.foundedYear < 1800 || this.foundedYear > currentYear) {
                throw new Error(`Founded year must be between 1800 and ${currentYear}`);
            }
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
