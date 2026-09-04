import { Link } from "react-router-dom";
import { useGetMySubmissionQuery } from "../api/userApi";
import UserInformation from "../components/UserInformation";
import EducationList from "../components/EducationList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MySubmissionPage = () => {
  const { data: user, isLoading, isError } = useGetMySubmissionQuery();

  if (isLoading) {
    return <p className="p-10">Loading your submission...</p>;
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-600">You have not submitted the form yet.</p>
        <Link to="/form">
          <Button size="lg">Fill the form</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold">My Submission</h1>
          <Link to="/form">
            <Button variant="outline">Back to form</Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-2xl">
              {user.fullName || "Unnamed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <UserInformation user={user} />
            <EducationList education={user.education ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MySubmissionPage;