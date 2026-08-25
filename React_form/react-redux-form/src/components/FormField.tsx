import type { ReactNode } from "react";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

const FormField = ({
  label,
  error,
  children,
}: FormFieldProps) => {
  return (
    <Field>
      <FieldLabel className="text-base font-medium">
        {label}
      </FieldLabel>

      {children}

      {error && (
      <FieldError className="text-sm">
        {error}
      </FieldError>
    )}
    </Field>
  );
};

export default FormField;