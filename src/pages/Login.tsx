import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SignupForm } from "@/components/auth/SignupForm";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSignup, setShowSignup] = useState(false);
  const [searchParams] = useSearchParams();
  const [emailConfirmationError, setEmailConfirmationError] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };

    checkSession();

    // Handle email confirmation from URL
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    
    if (token_hash && type) {
      const handleEmailConfirmation = async () => {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        });
        
        if (!error) {
          navigate("/success-confirmation");
        } else {
          toast({
            title: "Error",
            description: "Invalid or expired verification link",
            variant: "destructive",
          });
        }
      };
      
      handleEmailConfirmation();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          toast({
            title: "Success",
            description: "Successfully signed in",
          });
          navigate("/");
        } else if (event === "USER_UPDATED") {
          setEmailConfirmationError(false);
          setUnconfirmedEmail(null);
        } else if (event === "SIGNED_OUT") {
          setEmailConfirmationError(false);
          setUnconfirmedEmail(null);
        }
      }
    );

    // Listen for auth errors
    const handleAuthError = (e: CustomEvent<any>) => {
      if (e.detail?.error?.message === "Email not confirmed") {
        setEmailConfirmationError(true);
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        setUnconfirmedEmail(emailInput?.value || null);
      }
    };

    window.addEventListener('supabase.auth.error', handleAuthError as EventListener);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('supabase.auth.error', handleAuthError as EventListener);
    };
  }, [navigate, toast, searchParams]);

  const handleResendVerification = async () => {
    if (!unconfirmedEmail) return;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: unconfirmedEmail,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Verification email sent",
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {showSignup ? (
            <>
              <SignupForm />
              <p className="text-center mt-6 text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => setShowSignup(false)}
                  className="font-medium text-primary hover:text-primary/90 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Sign in to your account to continue
                </p>
              </div>

              {emailConfirmationError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex flex-col space-y-2">
                    <p>Please verify your email before signing in.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleResendVerification}
                      className="w-full mt-2"
                    >
                      Resend Verification Email
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-8">
                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: '#1E40AF',
                          brandAccent: '#1E40AF',
                        },
                      },
                    },
                    style: {
                      anchor: { display: 'none' },
                      message: { display: 'none' },
                    },
                    className: {
                      anchor: 'hidden',
                      button: 'w-full bg-primary hover:bg-primary/90 text-white',
                    },
                  }}
                  providers={[]}
                  localization={{
                    variables: {
                      sign_in: {
                        email_label: "Outlook Email",
                        email_input_placeholder: "your.email@outlook.com",
                      },
                    },
                  }}
                  view="sign_in"
                />
              </div>
              <p className="text-center mt-6 text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => setShowSignup(true)}
                  className="font-medium text-primary hover:text-primary/90 transition-colors"
                >
                  Sign up
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;