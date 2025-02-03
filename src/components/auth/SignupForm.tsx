import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "@/types/auth";
import { handleAuthError } from "@/utils/auth";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { AdditionalInfoFields } from "./AdditionalInfoFields";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

export const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check security code
      if (data.security_code !== "hrd712") {
        toast({
          title: "Invalid Security Code",
          description: "Please enter the correct security code to create an account.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if email exists using Edge Function
      const { data: checkEmailResponse, error: checkEmailError } = await supabase.functions.invoke('check-email', {
        body: { email: data.email },
        method: 'POST',
      });

      if (checkEmailError) {
        throw new Error('Failed to check email availability');
      }

      if (checkEmailResponse?.exists) {
        toast({
          title: "Email Already Registered",
          description: "This email address is already registered. Please use a different email or try logging in.",
          variant: "destructive",
        });
        form.setError("email", {
          type: "manual",
          message: "This email is already registered"
        });
        setLoading(false);
        return;
      }

      // If we get here, the email is unique, proceed with signup
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            contact_number: data.contact_number,
            position: data.position,
            full_name: data.full_name,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // If we get here, the signup was successful
      navigate("/success-confirmation");
      
    } catch (error: any) {
      const errorMessage = error.message || handleAuthError(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setError(errorMessage);
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
          <AlertDescription>{error}</AlertDescription>
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
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <AdditionalInfoFields form={form} loading={loading} />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};