import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface IPAccessGuardProps {
  children: React.ReactNode;
}

export const IPAccessGuard = ({ children }: IPAccessGuardProps) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateIP = async () => {
      try {
        const { data: validationData } = await supabase.functions.invoke<{ allowed: boolean }>('validate-ip');
        setIsAllowed(validationData?.allowed ?? false);
        
        // If IP is not allowed, redirect to unauthorized page
        if (!validationData?.allowed) {
          navigate("/unauthorized");
        }
      } catch (error) {
        console.error('Error validating IP:', error);
        setIsAllowed(false);
        navigate("/unauthorized");
      }
    };

    validateIP();
  }, [navigate]);

  // Show nothing while checking IP access
  if (isAllowed === null) {
    return null;
  }

  // If IP is allowed, render children
  return isAllowed ? <>{children}</> : null;
};