// DTO for updating a subscription package
export class UpdateSubscriptionPackageDTO {
    name?: string;
    type?: 'basic' | 'standard' | 'premium' | 'enterprise';
    price?: number;
    originalPrice?: number;
    duration?: {
        value: number;
        unit: 'day' | 'month' | 'year';
    };
    features?: {
        jobPostings?: {
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
        support?: {
            priority: 'none' | 'standard' | 'priority' | 'dedicated';
            analytics: boolean;
            advancedReports: boolean;
        };
        advertising?: {
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
    isActive?: boolean;

    constructor(data: any) {
        if (data.name !== undefined) this.name = data.name;
        if (data.type !== undefined) this.type = data.type;
        if (data.price !== undefined) this.price = data.price;
        if (data.originalPrice !== undefined) this.originalPrice = data.originalPrice;
        if (data.duration !== undefined) this.duration = data.duration;
        if (data.features !== undefined) this.features = data.features;
        if (data.badge !== undefined) this.badge = data.badge;
        if (data.description !== undefined) this.description = data.description;
        if (data.shortDescription !== undefined) this.shortDescription = data.shortDescription;
        if (data.displayOrder !== undefined) this.displayOrder = data.displayOrder;
        if (data.isActive !== undefined) this.isActive = data.isActive;
    }
}
