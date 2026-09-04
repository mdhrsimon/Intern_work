import { Link, useParams } from "react-router-dom";
import { useGetUserByIdQuery } from "../api/userApi";
import UserForm from "../components/UserForm";
import { Button } from "@/components/ui/button";

const EditUserPage = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserByIdQuery(id!, { skip: !id });

  if (isLoading) {
    return <p className="p-10">Loading user...</p>;
  }

  if (isError || !user) {
    return (
      <div className="p-10 space-y-4">
        <p>Could not load user for editing.</p>
        <Link to="/">
          <Button>Back to List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 flex flex-col items-center">
      <div className="mb-6 w-full max-w-3xl">
        <Link to="/">
          <Button variant="outline" size="lg">
            Back to List
          </Button>
        </Link>
      </div>

      {/* Same form, prefilled + edit mode */}
      <UserForm initialUser={user} isEdit />
    </div>
  );
};

export default EditUserPage;