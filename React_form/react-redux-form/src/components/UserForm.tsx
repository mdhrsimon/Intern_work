import { useState, useEffect } from "react";
import {
  FormProvider,
  useForm,
  Controller,
} from "react-hook-form";

import { useNavigate } from "react-router-dom";

import FormField from "./FormField";
import EducationForm from "./EducationForm";
import { getRole } from "../lib/permissions";
import { ROLES } from "../constants/roles";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateMySubmissionMutation,
  useGetMySubmissionQuery,
} from "../api/userApi";
import type { User, CreateUserPayload } from "../types/user";
import { useAppSelector } from "../redux/hooks";
import { useMeQuery } from "../api/authApi";

import { Button } from "@/components/ui/button";

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import { Spinner } from "@/components/ui/spinner";

interface UserFormProps {
  initialUser?: User;
  isEdit?: boolean;
}

const UserForm = ({
  initialUser,
  isEdit = false,
}: UserFormProps) => {
 
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isStudent = getRole() === ROLES.STUDENT;

  const authUser = useAppSelector((state) => state.auth.user);
  const { data: meData } = useMeQuery();

  const { data: mySubmission } = useGetMySubmissionQuery(undefined, {
    skip: !isStudent || !!initialUser,
  });

  const effectiveIsEdit = isEdit || (isStudent && !!mySubmission);

  const displayFullName =
    initialUser?.fullName ||
    mySubmission?.fullName ||
    meData?.fullName ||
    authUser?.fullName ||
    "";

  const displayEmail =
    initialUser?.email ||
    mySubmission?.email ||
    meData?.email ||
    authUser?.email ||
    "";

  const methods = useForm<CreateUserPayload>({
    defaultValues: initialUser
      ? {
          phone: initialUser.phone ?? "",
          dateOfBirth: initialUser.dateOfBirth ?? "",
          address: initialUser.address ?? "",
          gender: initialUser.gender ?? "",
          education: initialUser.education ?? [],
        }
      : {
          phone: "",
          dateOfBirth: "",
          address: "",
          gender: "",
          education: [],
        },
  });

  useEffect(() => {
    if (isStudent && mySubmission && !initialUser) {
      methods.reset({
        phone: mySubmission.phone ?? "",
        dateOfBirth: mySubmission.dateOfBirth ?? "",
        address: mySubmission.address ?? "",
        gender: mySubmission.gender ?? "",
        education: mySubmission.education ?? [],
      });
    } else if (initialUser) {
      methods.reset({
        phone: initialUser.phone ?? "",
        dateOfBirth: initialUser.dateOfBirth ?? "",
        address: initialUser.address ?? "",
        gender: initialUser.gender ?? "",
        education: initialUser.education ?? [],
      });
    }
  }, [isStudent, mySubmission, initialUser, methods]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const [createUser, { isLoading: isCreating }] =
    useCreateUserMutation();

  const [updateUser, { isLoading: isUpdating }] =
    useUpdateUserMutation();

  const [updateMySubmission, { isLoading: isUpdatingMy }] =
    useUpdateMySubmissionMutation();

  const isLoading = isCreating || isUpdating || isUpdatingMy;

  const onSubmit = async (data: CreateUserPayload) => {
    setSubmitError(null);
    const payload: CreateUserPayload = {
      phone: data.phone.trim(),
      dateOfBirth: data.dateOfBirth.trim(),
      address: data.address.trim(),
      gender: data.gender,
      education: (data.education ?? []).map((e) => ({
        id: e.id,
        degree: e.degree.trim(),
        institute: e.institute.trim(),
        yearPassed: String(e.yearPassed).trim(),
      })),
    };

    try {
      if (effectiveIsEdit) {
        if (isStudent) {
          await updateMySubmission(payload).unwrap();
          navigate("/my-submission");
        } else if (initialUser?.id != null) {
          await updateUser({
            id: initialUser.id,
            ...payload,
          }).unwrap();
          navigate("/students");
        }
      } else {
        await createUser(payload).unwrap();

        if (isStudent) {
          navigate("/my-submission");
        } else {
          navigate("/students");
        }
      }   
    } catch (err: any) {
      const apiErrors = err?.data?.errors;
      const errorMessages: string[] = [];

      if (apiErrors && typeof apiErrors === "object") {
        for (const [rawKey, msgs] of Object.entries(apiErrors)) {
          const messages = Array.isArray(msgs) ? msgs : [String(msgs)];
          const firstMessage = messages[0];
          if (firstMessage) errorMessages.push(firstMessage);

          // Normalize field path for react-hook-form:
          // e.g., "Education[0].Degree" -> "education.0.degree"
          // "Phone" -> "phone"
          const eduMatch = rawKey.match(/^Education\[(\d+)\]\.(.+)$/i);
          if (eduMatch) {
            const index = eduMatch[1];
            const prop = eduMatch[2].charAt(0).toLowerCase() + eduMatch[2].slice(1);
            methods.setError(`education.${index}.${prop}` as any, {
              type: "server",
              message: firstMessage,
            });
          } else {
            const fieldPath = rawKey.charAt(0).toLowerCase() + rawKey.slice(1);
            methods.setError(fieldPath as any, {
              type: "server",
              message: firstMessage,
            });
          }
        }
      }

      const fallbackMsg = err?.data?.message || err?.data?.title || err?.message || "Error saving user information.";
      const msg = errorMessages.length > 0 ? errorMessages.join(" ") : fallbackMsg;
      setSubmitError(msg);
      console.error("Error saving user:", err);
    }
  };

  return (
    <FormProvider {...methods}>
      <Card className="mx-auto w-full max-w-3xl shadow-md border-0 bg-white">

        {/* Header */}
        <CardHeader className="text-center px-6 py-8 md:px-8">

          <CardTitle className="text-3xl font-bold tracking-tight">
            User Information
          </CardTitle>

          <CardDescription className="text-base mt-2">
            Please enter your personal information below.
          </CardDescription>

          {submitError && (
            <div className="mt-4">
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            </div>
          )}

        </CardHeader>

        <CardContent className="px-6 pb-8 md:px-8">

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="space-y-6">
    

              {/* Full Name + Email (Read-only, managed by account) */}
              <div className="grid gap-6 md:grid-cols-2">

                <FormField label="Full Name">
                  <Input
                    type="text"
                    value={displayFullName}
                    readOnly
                    disabled
                    placeholder="Name managed by account"
                    className="h-11 text-base bg-slate-100 text-slate-700 cursor-not-allowed border-slate-200 select-none"
                  />
                </FormField>

                <FormField label="Email">
                  <Input
                    type="email"
                    value={displayEmail}
                    readOnly
                    disabled
                    placeholder="Email managed by account"
                    className="h-11 text-base bg-slate-100 text-slate-700 cursor-not-allowed border-slate-200 select-none"
                  />
                </FormField>

              </div>

              {/* Phone + Date */}
              <div className="grid gap-6 md:grid-cols-2">

                <FormField
                  label="Phone"
                  error={errors.phone?.message}
                >
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="h-11 text-base bg-gray-50/50"
                    {...register("phone", {
                      required:
                        "Phone number is required",
                      minLength: {
                        value: 10,
                        message:
                          "Phone number must be at least 10 digits",
                      },
                    })}
                  />
                </FormField>

                <FormField
                  label="Date of Birth"
                  error={errors.dateOfBirth?.message}
                >
                  <Input
                    type="date"
                    className="h-11 text-base bg-gray-50/50"
                    {...register("dateOfBirth", {
                      required:
                        "Date of birth is required",
                    })}
                  />
                </FormField>

              </div>

              {/* Address */}
              <FormField
                label="Address"
                error={errors.address?.message}
              >
                <Textarea
                  placeholder="Enter your address"
                  className="min-h-16 resize-none text-base bg-gray-50/50"
                  {...register("address", {
                    required: "Address is required",
                  })}
                />
              </FormField>

              {/* Gender */}
              <FormField
                label="Gender"
                error={errors.gender?.message}
              >
                <Controller
                  name="gender"
                  control={control}
                  rules={{
                    required:
                      "Please select your gender",
                  }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-11 w-full text-base bg-gray-50/50">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>

                      <SelectContent alignItemWithTrigger={false} side="bottom" sideOffset={6} className="bg-white border shadow-lg z-50">
                        <SelectItem
                          value="Male"
                          className="text-base py-2"
                        >
                          Male
                        </SelectItem>

                        <SelectItem
                          value="Female"
                          className="text-base py-2"
                        >
                          Female
                        </SelectItem>

                        <SelectItem
                          value="Other"
                          className="text-base py-2"
                        >
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

            </div>

            {/* Education */}
            <div className="pt-4">
              <EducationForm />
            </div>

            {/* API Error */}
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription className="text-base">
                  {submitError}
                </AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <div className="flex justify-center pt-4">

              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="text-base px-8 py-6 w-full md:w-auto md:min-w-48"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>

            </div>

          </form>

        </CardContent>

      </Card>
    </FormProvider>
  );
};

export default UserForm;