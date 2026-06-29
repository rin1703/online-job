import { runJobAutoHideCron } from "./jobAutoHidden.cron";
import { runSubscriptionExpiredCron } from "./subscriptionExpired.cron";
import { runRefundAutoProcessCron } from "./refund.cron";

export const runAllCrons = () => {
  runJobAutoHideCron();
  runSubscriptionExpiredCron();
  runRefundAutoProcessCron();
};
