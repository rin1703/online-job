import { Route, Routes } from "react-router";

// Admin
import AdminLayout from "@/components/layouts/admin/AdminLayout";
import AppLayout from "@/components/layouts/app/app-layout";
import AuthLayout from "@/components/layouts/auth/AuthLayout";
import NotificationsManagement from "@/pages/admin/NotificationsManagement";
import UsersManagement from "@/pages/admin/UsersManagement";

// Auth pages
import GoogleCallback from "@/pages/auth/GoogleCallback";
import SignInPage from "@/pages/auth/SignIn";
import SignUpPage from "@/pages/auth/SignUp";
import ActivateAccount from "@/pages/auth/ActivateAccount";

// Common pages
import NotFound from "@/pages/home/NotFound";
import LandingPage from "@/pages/landing-page";
import CompanyPage from "./pages/companies/index.tsx";

// Job Seeker pages
import ApplyJobPage from "@/pages/job-seeker/job-apply";
import JobDetail from "@/pages/job-seeker/job-detail";
import Jobs from "@/pages/job-seeker/jobs";
import ProfilePage from "@/pages/job-seeker/profile";
import JobSeekerSettingsPage from "@/pages/job-seeker/settings";
import SecuritySettingsPage from "@/pages/job-seeker/settings/security";
import JobSeekerApplicationsPage from "@/pages/job-seeker/applications";
import JobSeekerApplicationDetailPage from "@/pages/job-seeker/applications/ApplicationDetail";
import FavoriteJobsPage from "@/pages/job-seeker/favotites";
import JobSeekerInterviewsPage from "@/pages/job-seeker/interviews/index";
import InterviewDetailPage from "@/pages/job-seeker/interviews/InterviewDetail";
import MyReports from "@/features/job-seeker/components/reports/MyReports";

import NotificationsPage from "@/pages/notifications";
import JobSeekerNotification from "@/pages/job-seeker/notifications";

// Job-Seeker pages
import JobSeekerLayout from "./components/layouts/job-seeker/JobSeekerLayout";
import SettingLayout from "./components/layouts/job-seeker/SettingLayout";

// Recruiter pages
import RecruiterLayout from "./components/layouts/recruiter/RecruiterLayout";
import OverviewPage from "./pages/recruiter/overview";
import PackageManagementPage from "./pages/recruiter/packages";
import JobManagementPage from "./pages/recruiter/jobs";
import SettingsPage from "./pages/recruiter/settings";
import ApplicationsPage from "./pages/recruiter/applications";
import ApplicationDetailPage from "./pages/recruiter/applications/ApplicationDetail.tsx";
import JobListingForApplications from "./pages/recruiter/applications/JobListingForApplications"; // ✅ New
import RecruiterInterviewsPage from "./pages/recruiter/interviews";
import RecruiterInterviewDetailPage from "./pages/recruiter/interviews/InterviewDetail.tsx";
import RecruiterCompany from "./features/recruiter/components/company/index.tsx";

// Auth helpers
import { PrivateRoute } from "./components/PrivateRoute";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import ForgotPassword from "./features/auth/components/ForgotPassWord";
// Chat (frontend-only)
import ChatPage from "./features/chat/ChatPage";
import PublicProfilePage from "@/pages/public-profile";
import PaymentSuccess from "@/pages/payment/PaymentSuccess.tsx";
import PaymentFailure from "@/pages/payment/PaymentFailure.tsx";

//Company
import CompanyDetailPage from "./pages/companies/CompanyDetailPage.tsx";

function Router() {
  return (
    <Routes>
      {/* Public routes - Landing pages */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/companies" element={<CompanyPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
      </Route>

      {/* Auth routes with AuthLayout */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="sign-in" element={<SignInPage />} />
        <Route path="forgot" element={<ForgotPassword />} />
        <Route path="callback" element={<GoogleCallback />} />
        <Route path="activate/:token" element={<ActivateAccount />} />
      </Route>

      {/* Sign up riêng ngoài AuthLayout */}
      <Route path="/auth/sign-up" element={<SignUpPage />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="users" element={<UsersManagement />} />
        <Route path="notifications" element={<NotificationsManagement />} />
      </Route>

      {/* Public Job Routes - Anyone can view */}
      <Route element={<AppLayout />}>
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/job/:id" element={<JobDetail />} />
      </Route>

      {/* Protected routes - General authenticated users */}
      <Route element={<PrivateRoute />}>
        {/* Job Apply - Requires authentication */}
        <Route element={<AppLayout />}>
          <Route path="/job/:jobId/apply" element={<ApplyJobPage />} />
          {/* Chat (FE-only) - accessible to authenticated users */}
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Route>

      {/* Job Seeker only routes */}
      <Route element={<RoleBasedRoute allowedRoles={["job_seeker"]} />}>
        <Route path="" element={<JobSeekerLayout />}>
          {/* Các trang job-seeker dùng AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/job-seeker/applications" element={<JobSeekerApplicationsPage />} />
            <Route
              path="/job-seeker/applications/:id"
              element={<JobSeekerApplicationDetailPage />}
            />
            <Route path="/job-seeker/interviews" element={<JobSeekerInterviewsPage />} />
            <Route path="/job-seeker/interviews/:id" element={<InterviewDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<JobSeekerNotification />} />
            {/* ⭐ Favorites page cho Job Seeker */}
            <Route path="/job-seeker/favorites" element={<FavoriteJobsPage />} />
            {/* ⭐ Reports page cho Job Seeker */}
            <Route path="/job-seeker/my-reports" element={<MyReports />} />
          </Route>

          {/* Settings của Job Seeker */}
          <Route path="/job-seeker/settings" element={<SettingLayout />}>
            <Route index element={<JobSeekerSettingsPage />} />
            <Route path="security" element={<SecuritySettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Recruiter only routes */}
      <Route element={<RoleBasedRoute allowedRoles={["recruiter"]} />}>
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route path="overview" index element={<OverviewPage />} />
          <Route path="jobs" element={<JobManagementPage />} />
          <Route path="packages" element={<PackageManagementPage />} />
          {/* ✅ New: Job Listing → Applications flow */}
          <Route path="applications" element={<JobListingForApplications />} />
          <Route path="applications/jobs/:jobId" element={<ApplicationsPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route path="interviews" element={<RecruiterInterviewsPage />} />
          <Route path="interviews/:id" element={<RecruiterInterviewDetailPage />} />
          <Route path="setting" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="companies" element={<RecruiterCompany />} />
        </Route>
      </Route>

      {/* Public Profile Route */}
      <Route element={<AppLayout />}>
        <Route path="/profile/:id" element={<PublicProfilePage />} />
      </Route>

      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failure" element={<PaymentFailure />} />

      {/* 404 - Not found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Router;
