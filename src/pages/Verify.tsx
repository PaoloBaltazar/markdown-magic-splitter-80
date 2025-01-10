import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Verify = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is already confirmed, redirect to main page
      if (session?.user.email_confirmed_at) {
        navigate("/");
        return;
      }

      // Handle email confirmation from URL
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      
      if (token_hash && type) {
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
      }
    };
    
    checkSession();
  }, [navigate, searchParams, toast]);

  const handleVerify = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email: (await supabase.auth.getSession()).data.session?.user?.email || "",
        token: code,
        type: "email",
      });

      if (error) throw error;

      navigate("/success-confirmation");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Card className="p-6 w-full max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
        <p className="text-center mb-6 text-gray-600 dark:text-gray-400">
          Please check your email for the verification link. You won't be able to log in until you verify your email.
        </p>
        
        <div className="space-y-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => setCode(value)}
            disabled={loading}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, i) => (
                  <InputOTPSlot key={i} {...slot} index={i} />
                ))}
              </InputOTPGroup>
            )}
          />

          <Button 
            onClick={handleVerify} 
            className="w-full" 
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </div>
      </Card>
    </Layout>
  );
};

export default Verify;