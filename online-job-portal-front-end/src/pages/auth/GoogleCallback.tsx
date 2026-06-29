import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/hooks/redux";
import { setCredentials } from "@/features/auth/api/auth.slice";
import { toast } from "sonner";
import { decodeUserFromToken } from "@/lib/jwt";
import type { AuthUser } from "@/features/auth/api/auth.type";

/**
 * GoogleCallback Page
 * Handles the OAuth callback from Google Sign-In
 * Extracts token from URL params, decodes user info, saves to Redux/localStorage, and redirects
 */
export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params
        const errorParam = searchParams.get("error");
        if (errorParam) {
          const errorMessages: Record<string, string> = {
            auth_failed: "Google authentication failed. Please try again.",
            server_error: "Server error occurred. Please try again later.",
            account_disabled: "Your account has been disabled. Please contact support.",
          };
          const errorMessage = errorMessages[errorParam] || "Authentication failed";
          setError(errorMessage);
          toast.error(errorMessage);
          setTimeout(() => navigate("/auth/sign-in"), 2000);
          return;
        }

        // Get token from URL params
        const token = searchParams.get("token");

        if (!token) {
          setError("No authentication token received");
          toast.error("Google authentication failed. No token received.");
          setTimeout(() => navigate("/auth/sign-in"), 2000);
          return;
        }

        console.log("[GoogleCallback] Token received from URL");

        // Decode user info from token
        const decodedUser = decodeUserFromToken(token);

        if (!decodedUser) {
          setError("Invalid authentication token");
          toast.error("Failed to process authentication token");
          setTimeout(() => navigate("/auth/sign-in"), 2000);
          return;
        }

        console.log("[GoogleCallback] User decoded from token:", {
          userId: decodedUser.userId,
          email: decodedUser.email,
          role: decodedUser.role,
        });

        // Convert to AuthUser format
        const user: AuthUser = {
          userId: decodedUser.userId,
          email: decodedUser.email,
          role: decodedUser.role,
          firstName: decodedUser.firstName,
          lastName: decodedUser.lastName,
        };

        // Save to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        console.log("[GoogleCallback] Credentials saved to localStorage");

        // Save to Redux
        dispatch(setCredentials({ token, user }));
        console.log("[GoogleCallback] Credentials saved to Redux");

        toast.success("Google Sign-In successful!");

        // Redirect based on role
        switch (user.role) {
          case "recruiter":
            console.log("[GoogleCallback] Redirecting to recruiter overview");
            navigate("/recruiter/overview");
            break;
          case "admin":
            console.log("[GoogleCallback] Redirecting to admin dashboard");
            navigate("/admin");
            break;
          case "job_seeker":
          default:
            console.log("[GoogleCallback] Redirecting to home");
            navigate("/");
            break;
        }
      } catch (error) {
        console.error("[GoogleCallback] Error processing callback:", error);
        setError("Failed to process Google authentication");
        toast.error("Failed to process Google authentication");
        setTimeout(() => navigate("/auth/sign-in"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-orange-50 to-white">
      <div className="text-center max-w-md px-4">
        {error ? (
          <>
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to sign in page...</p>
          </>
        ) : (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Completing Google Sign-In...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we authenticate you</p>
          </>
        )}
      </div>
    </div>
  );
}
