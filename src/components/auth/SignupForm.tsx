import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/types/auth";
import { handleSignup, handleAuthError } from "@/utils/auth";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { AdditionalInfoFields } from "./AdditionalInfoFields";
import { supabase } from "@/lib/supabase";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Mail, XCircle } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDuplicateEmail, setShowDuplicateEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      birthdate: "",
      contact_number: "",
      address: "",
      gender: "other",
      security_code: "",
      position: "",
      full_name: "",
    },
    mode: "onChange",
  });

  const email = form.watch("email");
  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail || !form.formState.isValid) return;

      try {
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', debouncedEmail)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error checking email:", profileError);
          return;
        }

        if (existingProfile) {
          setEmailError("This email is already registered");
          form.setError("email", {
            type: "manual",
            message: "This email is already registered"
          });
          setShowDuplicateEmail(true);
        } else {
          setEmailError(null);
          form.clearErrors("email");
        }
      } catch (error) {
        console.error("Error checking email:", error);
      }
    };

    checkEmail();
  }, [debouncedEmail, form]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      // Exit early if there's an email error or the form state has an email error
      if (emailError || form.formState.errors.email) {
        setShowDuplicateEmail(true);
        return;
      }
  
      setLoading(true);
      setError(null);
  
      // Double-check for existing email before proceeding with signup
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", data.email)
        .maybeSingle();
  
      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error checking email:", profileError);
        setError("An error occurred while checking email availability.");
        setLoading(false);
        return;
      }
  
      if (existingProfile) {
        console.log("Email already exists in the database:", existingProfile);
        setEmailError("This email is already registered");
        setShowDuplicateEmail(true);
        form.setError("email", {
          type: "manual",
          message: "This email is already registered",
        });
        toast({
          title: "Email Already Registered",
          description: "This email address is already in use. Please use a different email.",
          variant: "destructive",
        });
        setLoading(false); // Ensure loading stops
        return; // Exit to prevent showing the confirmation modal
      }
  
      if (data.security_code !== "hrd712") {
        toast({
          title: "Invalid Security Code",
          description: "Please enter the correct security code to create an account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
  
      // Proceed with signup if no errors
      const result = await handleSignup(data);
      if (result.success) {
        setShowConfirmation(true);
      } else {
        if (result.error?.includes("already registered")) {
          setShowDuplicateEmail(true);
          setEmailError("This email is already registered");
          form.setError("email", {
            type: "manual",
            message: "This email is already registered",
          });
        } else {
          setError(result.error || "An error occurred during signup. Please try again.");
        }
      }
    } catch (error: any) {
      if (error.message?.includes("over_email_send_rate_limit")) {
        setError("For security purposes, please wait a minute before trying again.");
      } else if (error.message?.includes("already registered")) {
        setShowDuplicateEmail(true);
        setEmailError("This email is already registered");
        form.setError("email", {
          type: "manual",
          message: "This email is already registered",
        });
      } else {
        console.error("Signup error:", error);
        toast({
          title: "Error",
          description: error.message || "An error occurred during signup. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    window.location.href = "/login";
  };

  const handleDuplicateEmailClose = () => {
    setShowDuplicateEmail(false);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create an Account</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Fill in your details to get started
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 shadow-lg border-0 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <PersonalInfoFields form={form} loading={loading} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <ContactInfoFields form={form} loading={loading} />
                {emailError && (
                  <div className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {emailError}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <AdditionalInfoFields form={form} loading={loading} />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              disabled={loading || !!emailError}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </Card>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-center justify-center">
              <Mail className="h-6 w-6 text-green-500" />
              Account Created Successfully
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-4">
              <p>
                Your account has been created successfully! Please check your email to verify your account.
              </p>
              <div className="flex justify-center">
                <Mail className="h-12 w-12 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                A verification link has been sent to your email address. Click the link to activate your account.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={handleConfirmationClose}>
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDuplicateEmail} onOpenChange={setShowDuplicateEmail}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-center justify-center">
              <XCircle className="h-6 w-6 text-red-500" />
              Email Already Registered
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-4">
              <p>
                This email address is already registered in our system.
              </p>
              <p className="text-sm text-muted-foreground">
                Please use a different email address to create your account or try logging in if you already have an account.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={handleDuplicateEmailClose}>
              Try Another Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};