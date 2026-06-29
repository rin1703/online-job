import { SubscriptionPackageDTO } from './subscription-package.dto';

// DTO for subscription package with purchase status
export class SubscriptionPackageWithStatusDTO extends SubscriptionPackageDTO {
    buyed: boolean;

    constructor(data: any, buyed: boolean = false) {
        super(data);
        this.buyed = buyed;
    }
}
