// DTO for creating a new subscription package
export class CreateSubscriptionPackageDTO {
    name: string;
    type: 'basic' | 'standard' | 'premium' | 'enterprise';
    price: number;
    originalPrice?: number;
    duration: {
        value: number;
        unit: 'day' | 'month' | 'year';
    };
    features: {
        jobPostings: {
            limit: number;
            featured: number;
            visibleDuration: number;
        };
        candidateSearch?: {
            enabled: boolean;
            viewsPerMonth: number;
            downloadCV: boolean;
        };
        messaging?: {
            enabled: boolean;
            messagesPerMonth: number;
        };
        support: {
            priority: 'none' | 'standard' | 'priority' | 'dedicated';
            analytics: boolean;
            advancedReports: boolean;
        };
        advertising: {
            homepageBanner: boolean;
            emailCampaign: number;
            socialMediaPromotion: boolean;
        };
        extras?: Array<{
            name: string;
            description: string;
            enabled: boolean;
        }>;
    };
    badge?: string | null;
    description?: string;
    shortDescription?: string;
    displayOrder?: number;

    constructor(data: any) {
        this.name = data.name;
        this.type = data.type;
        this.price = data.price;
        this.originalPrice = data.originalPrice;
        this.duration = data.duration;
        this.features = data.features;
        this.badge = data.badge;
        this.description = data.description;
        this.shortDescription = data.shortDescription;
        this.displayOrder = data.displayOrder || 0;
    }
}
