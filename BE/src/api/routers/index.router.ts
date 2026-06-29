import { Express } from "express";
import express from "express";
import userRouter from "./user.route";
import profileRouter from "./profile.route";
import notificationRouter from "./notification.route";
import applicationRouter from "./application.route";
import jobListingRouter from "./jobListing.router";
import paymentRouter from "./payment.router";
import adminRouter from "./admin.routes";
import subscriptionRouter from "./subscription.route";
import walletRouter from "./wallet.router";
import subscriptionPackageRouter from "./subscriptionPackages.route";
import adminRecruiterRouter from "./adminRecruiter.route";
import { webhookController } from "../controller/payment.controller";
import jobRouter from "./jobsFavorite.route";
import downgradeRouter from "./downgrade.router";
import companyRouter from "./company.route";
import refundRouter from "./refund.router";
import conversationRouter from "./conversation.router";
import messageRouter from "./message.router";

export const mainv1Routes = (app: Express): void => {
  const version = "/api/v1";

  app.use(`${version}/user`, userRouter);
  app.use(`${version}/profile`, profileRouter);
  app.use(`${version}/notifications`, notificationRouter);
  app.use(`${version}/applications`, applicationRouter);
  app.use(`${version}/job`, jobRouter);
  app.use(`${version}/jobs`, jobListingRouter);
  app.use(`${version}/payment`, paymentRouter);
  app.use(`${version}/admin`, adminRouter);
  app.use(`${version}/subscription`, subscriptionRouter);
  app.use(`${version}/refunds`, refundRouter);
  app.use(`${version}/subscription-packages`, subscriptionPackageRouter);
  app.use(`${version}/wallet`, walletRouter);
  app.use(`${version}/jobs-favorite`, jobRouter);
  app.use(`${version}/admin/recruiters`, adminRecruiterRouter);
  app.use(`${version}/downgrade`, downgradeRouter);
  app.use(`${version}/companies`, companyRouter);
  app.use(`${version}/conversations`, conversationRouter);
  app.use(`${version}/messages`, messageRouter);
};

export const paymentWebhookRoutes = (app: Express) => {
  app.post(
    "/api/v1/payment/webhook",
    express.raw({ type: "*/*" }),
    webhookController
  );
};
