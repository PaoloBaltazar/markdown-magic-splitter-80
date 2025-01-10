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
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { AdditionalInfoFields } from "./AdditionalInfoFields";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [cooldownTimer, setCooldownTimer] = useState<number>(0);
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
        const { data, error } = await supabase.auth.signInWithOtp({
          email: debouncedEmail,
          options: {
            shouldCreateUser: false,
          }
        });

        if (!error) {
          setEmailError("This email is already registered");
          form.setError("email", {
            type: "manual",
            message: "This email is already registered"
          });
        } else if (error.message.includes("Email not found")) {
          setEmailError(null);
          form.clearErrors("email");
        } else {
          console.error("Error checking email:", error);
        }
      } catch (error) {
        console.error("Error checking email:", error);
      }
    };

    checkEmail();
  }, [debouncedEmail, form]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTimer > 0) {
      const interval = setInterval(() => {
        setCooldownTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldownTimer]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      // Exit early if there's an email error or if we're in cooldown
      if (emailError || form.formState.errors.email || cooldownTimer > 0) {
        if (cooldownTimer > 0) {
          toast({
            title: "Please wait",
            description: `You can try again in ${cooldownTimer} seconds.`,
            variant: "destructive",
          });
        }
        return;
      }
  
      setLoading(true);
      setError(null);
  
      if (data.security_code !== "hrd712") {
        toast({
          title: "Invalid Security Code",
          description: "Please enter the correct security code to create an account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
  
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            username: data.username,
            contact_number: data.contact_number,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setEmailError("This email is already registered");
          form.setError("email", {
            type: "manual",
            message: "This email is already registered",
          });
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      if (signUpData.user) {
        toast({
          title: "Account Created Successfully",
          description: "Please check your email to verify your account.",
        });
        navigate("/login");
      }
    } catch (error: any) {
      if (error.message?.includes("over_email_send_rate_limit")) {
        setCooldownTimer(51); // Set 51-second cooldown as per the error message
        toast({
          title: "Rate limit exceeded",
          description: "For security purposes, please wait 51 seconds before trying again.",
          variant: "destructive",
        });
      } else {
        console.error("Signup error:", error);
        setError(error.message || "An error occurred during signup. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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

      {cooldownTimer > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Please wait {cooldownTimer} seconds before trying again
          </AlertDescription>
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
              disabled={loading || !!emailError || cooldownTimer > 0}
            >
              {loading ? "Creating account..." : cooldownTimer > 0 ? `Wait ${cooldownTimer}s` : "Create Account"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};