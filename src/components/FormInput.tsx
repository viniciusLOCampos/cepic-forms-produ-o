import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  mask?: (value: string) => string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, mask, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        e.target.value = mask(e.target.value);
      }
      onChange?.(e);
    };

    return (
      <div className="space-y-2">
        <Label 
          htmlFor={props.id} 
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </Label>
        <Input
          ref={ref}
          {...props}
          onChange={handleChange}
          className={cn(
            "bg-white border-gray-300 text-gray-900 text-base",
            "focus:ring-2 focus:ring-primary focus:border-primary",
            "placeholder:text-gray-500",
            error && "border-destructive focus:border-destructive focus:ring-destructive",
            props.className
          )}
        />
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };