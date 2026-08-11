import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

interface User {
  name: string;
  email: string;
  education: string;
  dateOfBirth: string;
}

interface RootState {
  user: User | null;
}

const DisplayPage = () => {
  const user = useSelector((state: RootState) => state.user);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="mb-4">No user data found.</p>

          <Link
            to="/"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Go to Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">
          Submitted Information
        </h1>

        <div className="space-y-3">
          <p>
            <strong>Name:</strong> {user.name}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Education:</strong> {user.education}
          </p>

          <p>
            <strong>Date of Birth:</strong> {user.dateOfBirth}
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 inline-block rounded bg-black px-4 py-2 text-white"
        >
          Back to Form
        </Link>
      </div>
    </div>
  );
};

export default DisplayPage;