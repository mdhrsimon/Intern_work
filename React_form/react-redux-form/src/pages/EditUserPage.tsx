import { Link, useParams } from "react-router-dom";
import { useGetUserByIdQuery } from "../api/userApi";
import UserForm from "../components/UserForm";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const EditUserPage = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserByIdQuery(id!, { skip: !id });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p>Loading student information...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-slate-600">Could not load student for editing.</p>
          <Link to="/students">
            <Button>Back to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="px-4 py-8 flex flex-col items-center">
        {/* Same form, prefilled + edit mode */}
        <UserForm initialUser={user} isEdit />
      </main>
    </div>
  );
};

export default EditUserPage;