import { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { SignupFormValues } from "@/types/auth";

export const checkExistingEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error("An error occurred while checking email availability.");
  }

  return data;
};

export const handleSignup = async (data: SignupFormValues): Promise<{ success: boolean; error?: string }> => {
  try {
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
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (signUpError) {
      return { success: false, error: signUpError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || "An error occurred during signup" 
    };
  }
};

export const handleAuthError = (error: AuthError) => {
  if (error.message?.toLowerCase().includes("user already registered")) {
    return "This email is already registered. Please use a different email or try logging in.";
  }
  
  switch (error.message) {
    case "Invalid email or password":
      return "Invalid email or password format.";
    case "Email rate limit exceeded":
      return "Too many signup attempts. Please try again later.";
    default:
      return error.message || "An error occurred during signup.";
  }
};