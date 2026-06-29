import cron from "node-cron";
import JobListingModel from "../models/jobListing.model";

export const runJobAutoHideCron = () => {
  console.log("⏳ Cron Job Started: Auto hide expired job listings");

  // chạy mỗi giờ
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();

      const expiredJobs = await JobListingModel.find({
        status: "active",
        approvalStatus: "approved",
        autoHideAt: { $lte: now },
      });

      if (expiredJobs.length === 0) return;

      await JobListingModel.updateMany(
        {
          status: "active",
          approvalStatus: "approved",
          autoHideAt: { $lte: now },
        },
        {
          $set: { status: "hidden" },
        }
      );

      console.log(`✔ Auto-hide complete (${expiredJobs.length} jobs).`);
    } catch (error) {
      console.error("❌ Error in job auto-hide cron:", error);
    }
  });
};
