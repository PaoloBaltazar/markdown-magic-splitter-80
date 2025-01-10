import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SignupFormValues } from "@/types/auth";

interface ContactInfoFieldsProps {
  form: UseFormReturn<SignupFormValues>;
  loading: boolean;
}

export const ContactInfoFields = ({ form, loading }: ContactInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="birthdate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Birthdate</FormLabel>
            <FormControl>
              <Input {...field} type="date" disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contact_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Number</FormLabel>
            <FormControl>
              <Input {...field} type="tel" disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};