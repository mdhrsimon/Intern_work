import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useFieldArray,
  useFormContext,
} from "react-hook-form";

import type { User } from "../types/user";
import FormField from "./FormField";

const EducationForm = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<User>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/20 p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold text-gray-800">
          Education
        </label>

        <Button
          type="button"
          onClick={() =>
            append({
              degree: "",
              institute: "",
              yearPassed: "",
            })
          }
          size="sm"
          className="h-10 text-base"
        >
          + Add Education
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative rounded-lg border bg-muted/20 p-5"
          >
            {/* Remove button */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => remove(index)}
              className="absolute right-3 top-3 h-8 w-8 p-0 text-xl text-muted-foreground hover:text-foreground"
              aria-label="Remove education"
            >
              &times;
            </Button>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Degree */}
              <FormField
                label="Degree"
                error={
                  errors.education?.[index]?.degree?.message
                }
              >
                <Input
                  type="text"
                  placeholder="Degree / Certificate"
                  className="h-11 text-base bg-background"
                  {...register(
                    `education.${index}.degree`,
                    {
                      required: "Degree is required",
                    }
                  )}
                />
              </FormField>

              {/* Institute */}
              <FormField
                label="Institute"
                error={
                  errors.education?.[index]?.institute?.message
                }
              >
                <Input
                  type="text"
                  placeholder="Institute / School"
                  className="h-11 text-base bg-background"
                  {...register(
                    `education.${index}.institute`,
                    {
                      required: "Institute is required",
                    }
                  )}
                />
              </FormField>

              {/* Year */}
              <FormField
                label="Year Passed"
                error={
                  errors.education?.[index]?.yearPassed?.message
                }
              >
                <Input
                  type="number"
                  placeholder="Year Passed"
                  className="h-11 text-base bg-background"
                  {...register(
                    `education.${index}.yearPassed`,
                    {
                      required: "Year passed is required",
                    }
                  )}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationForm;