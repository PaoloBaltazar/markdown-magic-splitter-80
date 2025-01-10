import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const SuccessConfirmation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold">Email Successfully Confirmed!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to the login page in 5 seconds...
          </p>
          <Button onClick={() => navigate("/login")} className="w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    </Layout>
  );
};

export default SuccessConfirmation;