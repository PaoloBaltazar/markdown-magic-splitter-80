import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Your IP address is not authorized to access this application. Please contact your administrator for assistance.
        </p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default Unauthorized;