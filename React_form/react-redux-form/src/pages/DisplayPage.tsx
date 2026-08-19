import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { type User } from "../redux/actions";
import { getUsers, clearUsers } from "../api/userApi";

const DisplayPage = () => {
  // Users are loaded ONLY from the database
  const [displayUsers, setDisplayUsers] = useState<User[]>([]);

  // Remember whether the user selected "See All"
  const [showAll, setShowAll] = useState(() => {
    return localStorage.getItem("showAll") === "true";
  });

  // Fetch users from the database when the page loads
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await getUsers();

        // Store database users
        setDisplayUsers(response.data);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };

    loadUsers();
  }, []);

  // Only database users are displayed
  const usersToDisplay = displayUsers;

  // No users found
  if (usersToDisplay.length === 0) {
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

  // Last user from the database
  const latestUser = usersToDisplay[usersToDisplay.length - 1];

  // See All
  const handleSeeAll = async () => {
    try {
      // Fetch all users directly from the database
      const response = await getUsers();

      setDisplayUsers(response.data);
      setShowAll(true);

      // Remember that the user selected See All
      localStorage.setItem("showAll", "true");
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Show Latest
  const handleShowLatest = () => {
    setShowAll(false);

    // Remember that the user selected Show Latest
    localStorage.setItem("showAll", "false");
  };

  // Clear All
  const handleClearAll = async () => {
    try {
      // Clear users from the database
      await clearUsers();

      // Clear users from the page
      setDisplayUsers([]);

      // Return to latest mode
      setShowAll(false);

      localStorage.setItem("showAll", "false");
    } catch (error) {
      console.error("Error clearing users:", error);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-2xl">

        <h1 className="mb-6 text-2xl font-bold">
          Submitted Information
        </h1>

        {/* ========================= */}
        {/* LATEST USER */}
        {/* ========================= */}

        {!showAll && (
          <div className="rounded-lg border p-6">

            <div className="space-y-3 text-lg">
              <p>
                <strong>Name:</strong> {latestUser.fullName}
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
                {latestUser.education.map(
                  (education, index) => (
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
                  )
                )}
              </div>
            </div>

          </div>
        )}

        {/* ========================= */}
        {/* ALL USERS */}
        {/* ========================= */}

        {showAll && (
          <div className="space-y-6">

            {usersToDisplay.map((user, index) => (
              <div
                key={index}
                className="rounded-lg border p-6"
              >

                <h2 className="mb-4 text-lg font-bold">
                  Submission {index + 1}
                </h2>

                <div className="space-y-3">
                  <p>
                    <strong>Name:</strong>{" "}
                    {user.fullName}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {user.email}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {user.phone}
                  </p>

                  <p>
                    <strong>Date of Birth:</strong>{" "}
                    {user.dateOfBirth}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {user.address}
                  </p>

                  <p>
                    <strong>Gender:</strong>{" "}
                    {user.gender}
                  </p>
                </div>

                {/* Education */}
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

        {/* ========================= */}
        {/* BUTTONS */}
        {/* ========================= */}

        <div className="mt-6 flex gap-3">

          {/* See All / Show Latest */}
          <button
            type="button"
            onClick={() => {
              if (showAll) {
                handleShowLatest();
              } else {
                handleSeeAll();
              }
            }}
            className="w-full rounded-lg bg-[#2563EB] px-6 py-3 text-lg font-semibold text-white shadow-md shadow-[#2563EB]/30 transition hover:bg-[#1D4ED8] active:scale-[0.99] md:w-auto"
          >
            {showAll ? "Show Latest" : "See All"}
          </button>

          {/* Clear All */}
          <button
            type="button"
            onClick={handleClearAll}
            className="w-full rounded-lg border-2 border-[#2563EB] bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:bg-gray-200 active:scale-[0.99] md:w-auto"
          >
            Clear All
          </button>

          {/* Add Another */}
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