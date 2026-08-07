import { SubscriptionPackageDTO } from './subscription-package.dto';

// DTO for detailed package response (includes all package features)
export class SubscriptionPackageDetailDTO extends SubscriptionPackageDTO {
    features: {
        jobPostings: {
            limit: number;
            featured: number;
            visibleDuration: number;
        };
        candidateSearch: {
            enabled: boolean;
            viewsPerMonth: number;
            downloadCV: boolean;
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
        this.features = {
            jobPostings: data.features?.jobPostings,
            candidateSearch: data.features?.candidateSearch,
            messaging: data.features?.messaging,
            support: data.features?.support,
            advertising: data.features?.advertising,
            extras: data.features?.extras
        };
    }
}
