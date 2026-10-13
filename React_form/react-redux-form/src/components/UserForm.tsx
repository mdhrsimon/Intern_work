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
import type { User } from "../types/user";

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

  const { data: mySubmission } = useGetMySubmissionQuery(undefined, {
    skip: !isStudent || !!initialUser,
  });

  const effectiveIsEdit = isEdit || (isStudent && !!mySubmission);

  const methods = useForm<User>({
  defaultValues: initialUser
    ? {
        ...initialUser,
        education: initialUser.education ?? [],
      }
    : {
        fullName: "",
        email: "",
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
        ...mySubmission,
        education: mySubmission.education ?? [],
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

  const onSubmit = async (data: User) => {
  setSubmitError(null);
  try {
    if (effectiveIsEdit) {
      if (isStudent) {
        await updateMySubmission(data).unwrap();
        navigate("/my-submission");
      } else if (initialUser?.id != null) {
        await updateUser({
          ...data,
          id: initialUser.id,
        }).unwrap();
        navigate("/students");
      }
    } else {
      await createUser(data).unwrap();

      if (isStudent) {
        navigate("/my-submission");
      } else {
        navigate("/students");
      }
    }   
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || "Error saving user information.";
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
    

              {/* Full Name + Email */}
              <div className="grid gap-6 md:grid-cols-2">

                <FormField
                  label="Full Name"
                  error={errors.fullName?.message}
                >
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    className="h-11 text-base bg-gray-50/50"
                    {...register("fullName", {
                      required: "Name is required",
                    })}
                  />
                </FormField>

                <FormField
                  label="Email"
                  error={errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    className="h-11 text-base bg-gray-50/50"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Enter a valid email",
                      },
                    })}
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