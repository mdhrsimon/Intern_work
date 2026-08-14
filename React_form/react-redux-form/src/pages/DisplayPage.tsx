import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { clearUsers, type User } from "../redux/actions";

interface RootState {
  users: User[];
}

const DisplayPage = () => {
  const users = useSelector((state: RootState) => state.users);
  const dispatch = useDispatch();

  const [showAll, setShowAll] = useState(false);

  if (users.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-lg rounded-lg border p-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            No User Data Found
          </h1>

          <p className="mb-6 text-gray-800">
            Please submit the form first.
          </p>

          <Link
            to="/"
            className="w-full rounded-lg border-2 border-[#1D4ED8] bg-white px-6 py-3 text-lg font-semibold text-black shadow-sm transition hover:bg-gray-200 active:scale-[0.99] md:w-auto"
          >
            Go to Form
          </Link>
        </div>
      </div>
    );
  }

  const latestUser = users[users.length - 1];

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">

        <h1 className="mb-6 text-2xl font-bold">
          Submitted Information
        </h1>

        {/* Latest User */}
        {!showAll && (
          <div className="rounded-lg border p-6">

            <div className="space-y-3 text-lg">
              <p>
                <strong>Name:</strong> {latestUser.name}
              </p>

              <p>
                <strong>Email:</strong> {latestUser.email}
              </p>

              <p>
                <strong>Phone:</strong> {latestUser.phone}
              </p>

              <p>
                <strong>Date of Birth:</strong>{" "}
                {latestUser.dateOfBirth}
              </p>

              <p>
                <strong>Address:</strong> {latestUser.address}
              </p>

              <p>
                <strong>Gender:</strong> {latestUser.gender}
              </p>
            </div>

            {/* Education */}
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold">
                Education
              </h2>

              <div className="space-y-3">
                {latestUser.education.map((education, index) => (
                  <div
                    key={index}
                    className="rounded border p-4"
                  >
                    <p>
                      <strong>Degree:</strong>{" "}
                      {education.degree}
                    </p>

                    <p>
                      <strong>Institute:</strong>{" "}
                      {education.institute}
                    </p>

                    <p>
                      <strong>Year Passed:</strong>{" "}
                      {education.yearPassed}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Users */}
        {showAll && (
          <div className="space-y-6">
            {users.map((user, index) => (
              <div
                key={index}
                className="rounded-lg border p-6"
              >
                <h2 className="mb-4 text-lg font-bold">
                  Submission {index + 1}
                </h2>

                <div className="space-y-3">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>

                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>

                  <p>
                    <strong>Phone:</strong> {user.phone}
                  </p>

                  <p>
                    <strong>Date of Birth:</strong>{" "}
                    {user.dateOfBirth}
                  </p>

                  <p>
                    <strong>Address:</strong> {user.address}
                  </p>

                  <p>
                    <strong>Gender:</strong> {user.gender}
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="mb-3 font-semibold">
                    Education
                  </h3>

                  <div className="space-y-3">
                    {user.education.map(
                      (education, educationIndex) => (
                        <div
                          key={educationIndex}
                          className="rounded border p-4"
                        >
                          <p>
                            <strong>Degree:</strong>{" "}
                            {education.degree}
                          </p>

                          <p>
                            <strong>Institute:</strong>{" "}
                            {education.institute}
                          </p>

                          <p>
                            <strong>Year Passed:</strong>{" "}
                            {education.yearPassed}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="w-full rounded-lg bg-[#2563EB] px-6 py-3 text-lg font-semibold text-white shadow-md shadow-[#2563EB]/30 transition hover:bg-[#1D4ED8] active:scale-[0.99] md:w-auto"
          >
            {showAll ? "Show Latest" : "See All"}
          </button>

          <button
            type="button"
            onClick={() => dispatch(clearUsers())}
            className="w-full rounded-lg border-2 border-[#2563EB] bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:bg-gray-200  active:scale-[0.99] md:w-auto"
          >
            Clear All
          </button>

          <Link
            to="/"
            className="w-full rounded-lg bg-[#2563EB] px-6 py-3 text-lg font-semibold text-white shadow-md shadow-[#2563EB]/30 transition hover:bg-[#1D4ED8] active:scale-[0.99] md:w-auto"
          >
            Add Another
          </Link>

        </div>

      </div>
    </div>
  );
};

export default DisplayPage;