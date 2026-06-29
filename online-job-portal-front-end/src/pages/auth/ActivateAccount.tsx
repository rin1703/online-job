import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Btn';

type ActivationStatus = 'loading' | 'success' | 'error';

interface ActivationResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    email: string;
    accountStatus: string;
  };
}

export default function ActivateAccount() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ActivationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const activateAccount = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid activation token');
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await fetch(
          `${apiUrl}/api/v1/admin/recruiters/activate/${token}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data: ActivationResponse = await response.json();

        if (data.success) {
          setStatus('success');
          toast.success('Account activated successfully!', {
            description: 'You can now sign in with your credentials.',
          });

          // Redirect to sign-in page after 3 seconds
          setTimeout(() => {
            navigate('/auth/sign-in', {
              state: { message: 'Your account has been activated. Please sign in.' }
            });
          }, 3000);
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Activation failed. Please try again.');
          toast.error(data.message || 'Activation failed');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('An error occurred while activating your account. Please contact support.');
        toast.error('Activation failed', {
          description: 'Please contact support for assistance.',
        });
      }
    };

    activateAccount();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Account Activation</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Activating your recruiter account...'}
            {status === 'success' && 'Activation successful!'}
            {status === 'error' && 'Activation failed'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Please wait while we activate your account...
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take a few moments.
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600" />
              <div className="text-center space-y-2">
                <p className="font-semibold text-green-700">
                  Your account has been activated!
                </p>
                <p className="text-sm text-muted-foreground">
                  You can now sign in and start posting jobs.
                </p>
                <p className="text-xs text-muted-foreground">
                  Redirecting to sign in page in 3 seconds...
                </p>
              </div>
              <Button
                onClick={() => navigate('/auth/sign-in')}
                className="w-full"
              >
                Go to Sign In
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-600" />
              <div className="text-center space-y-2">
                <p className="font-semibold text-red-700">
                  Activation Failed
                </p>
                <p className="text-sm text-muted-foreground">
                  {errorMessage}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                  <p className="text-xs text-red-800">
                    <strong>Common issues:</strong>
                  </p>
                  <ul className="text-xs text-red-700 list-disc list-inside mt-1 space-y-1">
                    <li>The activation link has expired (valid for 30 minutes)</li>
                    <li>The link has already been used</li>
                    <li>The token is invalid or corrupted</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth/sign-in')}
                  className="flex-1"
                >
                  Back to Sign In
                </Button>
                <Button
                  onClick={() => window.location.href = 'mailto:support@jobportal.com'}
                  className="flex-1"
                >
                  Contact Support
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
