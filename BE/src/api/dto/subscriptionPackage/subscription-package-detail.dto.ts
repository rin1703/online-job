import { SubscriptionPackageDTO } from './subscription-package.dto';

// DTO for detailed package response (includes all features except candidateSearch)
export class SubscriptionPackageDetailDTO extends SubscriptionPackageDTO {
    features: {
        jobPostings: {
            limit: number;
            featured: number;
            visibleDuration: number;
        };
        messaging: {
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

    constructor(data: any) {
        super(data);
        // Only include features without candidateSearch
        this.features = {
            jobPostings: data.features?.jobPostings,
            messaging: data.features?.messaging,
            support: data.features?.support,
            advertising: data.features?.advertising,
            extras: data.features?.extras
        };
    }
}
