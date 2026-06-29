import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Icons } from "@/components/icons/icons";
import { Logo } from "@/components/icons/Logo";
import { baseUrl } from "@/config";
import { useSignUpMutation } from "@/redux/features/auth/authApi";
import { zodResolver } from "@hookform/resolvers/zod";

import { JobSeekerForm } from "./JobSeekerForm";
import { ProgressSteps } from "./ProgressSteps";
import { RecruiterForm } from "./RecruiterForm";
import { RoleBubble } from "./RoleBubble";
import { SignUpBackground } from "./SignUpBackground";
import {
  type JobSeekerFormData,
  jobSeekerSchema,
  type RecruiterFormData,
  recruiterSchema,
} from "../auth.schema";
import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";

export const SignUpForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"job_seeker" | "recruiter">("job_seeker");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [signUp, { isLoading }] = useSignUpMutation();

  const jobSeekerForm = useForm<JobSeekerFormData>({
    resolver: zodResolver(jobSeekerSchema),
    defaultValues: {
      role: "job_seeker",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      birthday: "",
      phone: "",
      acceptTerms: false,
    },
  });

  const recruiterForm = useForm<RecruiterFormData>({
    resolver: zodResolver(recruiterSchema),
    defaultValues: {
      role: "recruiter",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      birthday: "",
      phone: "",
      companyName: "",
      taxCode: "",
      companyWebsite: "",
      houseNumber: "",
      streetName: "",
      location: "",
      acceptTerms: false,
    },
  });

  const handleRoleChange = (role: "job_seeker" | "recruiter") => {
    setSelectedRole(role);
    setCurrentStep(1);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${baseUrl}/user/auth/google`;
  };

  const handleSubmit = async (data: JobSeekerFormData | RecruiterFormData) => {
    try {
      setError("");
      const response = await signUp(data).unwrap();

      if (response.success) {
        // Validate that profile was created on backend
        if (!response.userID && data.role === "job_seeker") {
          // For job seekers, profile creation should not fail
          // But warn if userId is missing from response
          console.warn("Profile validation: userId not returned in response");
          toast.warning("Note: Profile setup may need to be completed in your dashboard", {
            duration: 4000,
          });
        }

        if (data.role === "recruiter") {
          toast.success("Recruiter Registration Submitted!", {
            description:
              "Your account is pending admin approval. You will receive an activation email within 24 hours once approved.",
            duration: 6000,
          });
          navigate("/auth/sign-in", {
            state: {
              message:
                "Your recruiter account is pending admin approval. You will receive an activation email once approved.",
              type: "info",
            },
          });
        } else {
          toast.success("Registration Successful!", {
            description: "Your account has been created. You can now sign in.",
            duration: 4000,
          });
          navigate("/auth/sign-in", {
            state: {
              message: "Registration successful! Please sign in with your credentials.",
              type: "success",
            },
          });
        }
      } else {
        toast.error(response.message || "Registration failed");
        setError(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.errors?.join(", ") ||
        error?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <SignUpBackground>
      {/* Logo + Sign in + Globe - Desktop Bottom Left */}
      <div className="hidden lg:flex fixed left-6 bottom-6 items-center gap-8 z-50 text-lg">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        <Link to="/auth/sign-in" className="text-black font-medium hover:underline">
          Sign in
        </Link>
        <Icons.globe className="w-7 h-7 text-gray-800 hover:text-blue-600 cursor-pointer transition" />
      </div>

      {/* Main Container - Responsive & Zoom Safe */}
      <div className="min-h-screen flex items-center justify-center px-4 py-8 lg:py-12">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row bg-white shadow-2xl rounded-3xl overflow-hidden h-auto lg:h-[90vh] lg:max-h-[95vh]">
            {/* LEFT: Form Section - Scrollable on zoom */}
            <div className="w-full lg:w-[55%] flex flex-col bg-white">
              <div className="flex-1 overflow-y-auto px-6 py-10 lg:px-12 lg:py-12 scrollbar-hide scrollbar-hide::-webkit-scrollbar">
                <div className="max-w-lg mx-auto w-full space-y-8">
                  {/* Mobile Logo */}
                  <div className="lg:hidden text-center">
                    <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
                      <Logo />
                    </Link>
                  </div>

                  {/* Google Button */}
                  <ButtonLowercase
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50"
                    onClick={handleGoogleSignUp}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </ButtonLowercase>

                  <div className="text-center text-sm text-gray-500">Or with Email</div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Progress Steps */}
                  <ProgressSteps currentStep={currentStep} totalSteps={2} />

                  {/* Form Content */}
                  {selectedRole === "job_seeker" ? (
                    <JobSeekerForm
                      form={jobSeekerForm}
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                      currentStep={currentStep}
                      onStepChange={setCurrentStep}
                    />
                  ) : (
                    <RecruiterForm
                      form={recruiterForm}
                      onSubmit={handleSubmit}
                      isLoading={isLoading}
                      currentStep={currentStep}
                      onStepChange={setCurrentStep}
                    />
                  )}

                  {/* Mobile Sign In Link */}
                  <div className="lg:hidden text-center text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link
                      to="/auth/sign-in"
                      className="text-orange-500 font-medium hover:underline"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              </div>

              {/* Desktop Bottom Text */}
              <div className="hidden lg:block px-12 pb-8 text-right">
                <span className="text-xl text-orange-500 font-medium">Do you have an account?</span>
              </div>
            </div>

            {/* RIGHT: Orange Section - Desktop Only */}
            <div className="hidden lg:flex w-[45%] bg-[#F97A00] relative flex-col items-center justify-center gap-12">
              <RoleBubble selectedRole={selectedRole} onRoleChange={handleRoleChange} />
              <h2 className="text-5xl font-bold text-white">Sign Up</h2>
              <Link
                to="/auth/sign-in"
                className="absolute bottom-8 left-8 text-white text-xl font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Mobile Role Selector */}
          <div className="lg:hidden mt-6 flex gap-4 justify-center">
            {(["job_seeker", "recruiter"] as const).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all ${
                  selectedRole === role
                    ? "bg-[#F97A00] text-white shadow-lg"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {role === "job_seeker" ? "Job Seeker" : "Recruiter"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SignUpBackground>
  );
};
