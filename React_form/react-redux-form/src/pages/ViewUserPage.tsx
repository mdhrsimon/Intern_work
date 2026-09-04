import { Link, useParams } from "react-router-dom";
import { useGetUserByIdQuery } from "../api/userApi";
import UserInformation from "../components/UserInformation";
import EducationList from "../components/EducationList";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

const ViewUserPage = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserByIdQuery(id!, { skip: !id });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">User not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Could not load this user. They may have been deleted.
              </AlertDescription>
            </Alert>
            <Link to="/">
              <Button size="lg">Back to List</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              User Details
            </h1>
            <p className="mt-1 text-slate-500">
              Viewing submitted information
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" size="lg">
              Back to List
            </Button>
          </Link>
        </div>

        <Card className="shadow-sm">
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

export default ViewUserPage;