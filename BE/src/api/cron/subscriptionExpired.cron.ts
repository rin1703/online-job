import cron from "node-cron";
import { checkExpiredSubscriptions } from "../service/subscription.service";

export const runSubscriptionExpiredCron = () => {
  console.log("⏳ Cron Job Started: Check expired subscriptions");

  // chạy mỗi giờ
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await checkExpiredSubscriptions();
      if (result.modifiedCount && result.modifiedCount > 0) {
        console.log(`✔ Subscription expired update complete (${result.modifiedCount} records).`);
      }
    } catch (error) {
      console.error("❌ Error in subscription expired cron:", error);
    }
  });
};
