import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Must be a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  birthdate: z.string().min(1, "Birthdate is required"),
  contact_number: z.string().min(10, "Contact number must be at least 10 characters"),
  address: z.string().min(3, "Address must be at least 3 characters"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  security_code: z.string().min(1, "Security code is required"),
  position: z.string().min(3, "Position must be at least 3 characters"),
  full_name: z.string().min(3, "Full name must be at least 3 characters"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;