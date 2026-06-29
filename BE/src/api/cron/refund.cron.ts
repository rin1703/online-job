import cron from "node-cron";
import RefundRequestModel from "../models/refund.model";
import { adminProcessRefund } from "../service/refund.service";

const SYSTEM_ADMIN_ID = process.env.SYSTEM_ADMIN_ID;

export const runRefundAutoProcessCron = () => {
  console.log("⏳ Cron Job Started: Auto process refund requests");

  cron.schedule("*/2 * * * *", async () => {
    try {
      const pendingRefunds = await RefundRequestModel.find({
        status: "approved",
      });

      if (pendingRefunds.length === 0) {
        return;
      }

      for (const req of pendingRefunds) {
        try {
          await adminProcessRefund(SYSTEM_ADMIN_ID, req._id.toString());
        } catch (err: any) {
          console.error(
            `❌ Error while processing refund ${req._id}:`,
            err.message
          );
        }
      }
    } catch (error) {
      console.error("❌ Cron Error: Failed to scan refund requests:", error);
    }
  });
};
