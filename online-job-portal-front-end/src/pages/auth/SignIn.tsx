import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Info, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { baseUrl } from "@/config";
import SignInForm from "@/features/auth/components/SignInForm";

export default function SignInPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = location.state as { message?: string; type?: 'info' | 'success' } | null;

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${baseUrl}/user/auth/google`;
  };

  // Handle error from URL query parameters (Google OAuth redirect)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = '';

      // Decode error message if it's URL encoded
      const decodedError = decodeURIComponent(error);

      // Map common errors to user-friendly messages
      if (decodedError.includes('account_disabled') || decodedError.includes('inactive')) {
        errorMessage = 'Your account has not been activated yet. Recruiters need admin approval before signing in. Please check your email for the activation link.';
      } else if (decodedError.includes('auth_failed')) {
        errorMessage = 'Google authentication failed. Please try again.';
      } else if (decodedError.includes('server_error')) {
        errorMessage = 'An error occurred on the server. Please try again later.';
      } else {
        // Use the decoded error message directly
        errorMessage = decodedError;
      }

      toast.error('Sign In Failed', {
        description: errorMessage,
        duration: 8000,
      });

      // Clear error from URL
      searchParams.delete('error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Clear state after displaying message
  useEffect(() => {
    if (state?.message) {
      // Clear the state after component mounts
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Registration Success/Info/Error Messages */}
      {state?.message && (
        <div
          className={`mb-4 p-4 rounded-lg border flex items-start gap-3 ${
            state.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : state.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}
        >
          {state.type === 'info' ? (
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : state.type === 'error' ? (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{state.message}</p>
          </div>
        </div>
      )}

      <Card className="bg-white backdrop-blur-sm shadow-2xl border-0 gap-3">
        <CardHeader className="text-center gap-1">
          <h1 className="text-3xl font-bold text-orange-600">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <SignInForm />

          <div className="text-center text-gray-500">Or continue with</div>

          {/* Google Sign In */}
          <ButtonLowercase
            variant="outline"
            className="w-full h-12 border-gray-200 hover:bg-gray-50"
            onClick={handleGoogleLogin}
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
            Login with Google
          </ButtonLowercase>

          {/* Links */}
          <div className="text-center space-y-2">
            <Link to="/auth/forgot" className="block text-orange-600 hover:underline font-medium">
              Forgot password?
            </Link>
            <p className="text-gray-600">
              Don&#39;t have an account?{" "}
              <Link to="/auth/sign-up" className="text-orange-600 hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
