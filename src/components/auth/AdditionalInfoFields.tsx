import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn, useWatch } from "react-hook-form";
import { SignupFormValues } from "@/types/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<SignupFormValues>;
  loading: boolean;
}

export const AdditionalInfoFields = ({ form, loading }: AdditionalInfoFieldsProps) => {
  const securityCode = useWatch({
    control: form.control,
    name: "security_code",
  });

  const isValidCode = securityCode === "hrd712";
  const showValidation = securityCode && securityCode.length > 0;

  return (
    <>
      <FormField
        control={form.control}
        name="position"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position</FormLabel>
            <FormControl>
              <Input {...field} disabled={loading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="security_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Security Code</FormLabel>
            <FormControl>
              <Input {...field} type="text" disabled={loading} />
            </FormControl>
            {showValidation && (
              <Alert variant={isValidCode ? "default" : "destructive"} className="mt-2">
                <AlertDescription className="flex items-center gap-2">
                  {isValidCode ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Security code is correct
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Invalid security code. Please enter the correct code to proceed.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};