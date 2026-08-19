import { useForm, useFieldArray } from "react-hook-form";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/actions";
import { useNavigate } from "react-router-dom";
import { createUser } from "../api/userApi"; // NEW

interface Education {
  degree: string;
  institute: string;
  yearPassed: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  education: Education[];
}

const UserForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      gender: "",
      education: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  // UPDATED: submit function
  const onSubmit = async (data: FormData) => {
    try {
      // Send form data to ASP.NET Core API
      await createUser(data);

      // Keep your existing Redux functionality
      dispatch(setUser(data));

      // Go to display page
      navigate("/display");
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl rounded-lg border border-gray-300 bg-white p-6 shadow-sm md:p-10">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Full Name */}
        <div>
          <label className="mb-2 block text-lg font-medium">
            Full Name
          </label>

          <input
            type="text"
            {...register("fullName", {
              required: "Name is required",
            })}
            className="w-full rounded border px-4 py-3 text-lg"
          />

          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-lg font-medium">
            Email
          </label>

          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email",
              },
            })}
            className="w-full rounded border px-4 py-3 text-lg"
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="mb-2 block text-lg font-medium">
            Phone
          </label>

          <input
            type="tel"
            {...register("phone", {
              required: "Phone number is required",
              minLength: {
                value: 10,
                message: "Phone number must be at least 10 digits",
              },
            })}
            className="w-full rounded border px-4 py-3 text-lg"
          />

          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="mb-2 block text-lg font-medium">
            Date of Birth
          </label>

          <input
            type="date"
            {...register("dateOfBirth", {
              required: "Date of birth is required",
            })}
            className="w-full rounded border px-4 py-3 text-lg"
          />

          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-500">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="mb-2 block text-lg font-medium">
            Address
          </label>

          <input
            type="text"
            {...register("address", {
              required: "Address is required",
            })}
            className="w-full rounded border px-4 py-3 text-base"
          />

          {errors.address && (
            <p className="mt-1 text-sm text-red-500">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="mb-2 block text-lg font-medium">
            Gender
          </label>

          <select
            {...register("gender", {
              required: "Please select your gender",
            })}
            className="w-full rounded border px-4 py-3 text-base"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {errors.gender && (
            <p className="mt-1 text-sm text-red-500">
              {errors.gender.message}
            </p>
          )}
        </div>

        {/* Education */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-lg font-medium">
              Education
            </label>

            <button
              type="button"
              onClick={() =>
                append({
                  degree: "",
                  institute: "",
                  yearPassed: "",
                })
              }
              className="w-full rounded-lg bg-[#2563EB] px-6 py-3 text-m font-semibold text-white shadow-md shadow-[#2563EB]/30 transition hover:bg-[#1D4ED8] active:scale-[0.99] md:w-auto"
            >
              + Add Education
            </button>
          </div>

          <div className="space-y-4">

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative rounded border border-gray-300 bg-gray-50 p-5"
              >

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute right-3 top-3 text-2xl leading-none text-black-500 hover:text-gray-500"
                  aria-label="Remove education"
                >
                  ×
                </button>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  {/* Degree */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Degree
                    </label>

                    <input
                      type="text"
                      {...register(`education.${index}.degree`, {
                        required: "Degree is required",
                      })}
                      className="w-full rounded border bg-white px-4 py-3"
                    />

                    {errors.education?.[index]?.degree && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.education[index]?.degree?.message}
                      </p>
                    )}
                  </div>

                  {/* Institute */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Institute
                    </label>

                    <input
                      type="text"
                      {...register(`education.${index}.institute`, {
                        required: "Institute is required",
                      })}
                      className="w-full rounded border bg-white px-4 py-3"
                    />

                    {errors.education?.[index]?.institute && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.education[index]?.institute?.message}
                      </p>
                    )}
                  </div>

                  {/* Year Passed */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Year Passed
                    </label>

                    <input
                      type="number"
                      {...register(`education.${index}.yearPassed`, {
                        required: "Year passed is required",
                      })}
                      className="w-full rounded border bg-white px-4 py-3"
                    />

                    {errors.education?.[index]?.yearPassed && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.education[index]?.yearPassed?.message}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-lg bg-[#2563EB] px-6 py-3 text-lg font-semibold text-white shadow-md shadow-[#2563EB]/30 transition hover:bg-[#1D4ED8] active:scale-[0.99] md:w-auto"
        >
          Submit
        </button>

      </form>
    </div>
  );
};

export default UserForm;