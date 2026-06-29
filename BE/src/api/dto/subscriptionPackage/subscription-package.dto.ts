// DTO for GET  - only basic information
export class SubscriptionPackageDTO {
    _id: string;
    name: string;

    type: 'basic' | 'standard' | 'premium' | 'enterprise';
    price: number;
    originalPrice?: number;
    duration: {
        value: number;
        unit: 'day' | 'month' | 'year';
    };
    badge?: string | null;
    description?: string;
    shortDescription?: string;
    displayOrder: number;
    isActive: boolean;
    features: {
        jobPostings: {
            limit: number;
            featured: number;
            visibleDuration: number;
        };
    };

    constructor(data: any) {
        this._id = data._id;
        this.name = data.name;

        this.type = data.type;
        this.price = data.price;
        this.originalPrice = data.originalPrice;
        this.duration = data.duration;
        this.badge = data.badge;
        this.description = data.description;
        this.shortDescription = data.shortDescription;
        this.displayOrder = data.displayOrder;
        this.isActive = data.isActive;
        this.features = {
            jobPostings: data.features?.jobPostings
        };
    }
}
