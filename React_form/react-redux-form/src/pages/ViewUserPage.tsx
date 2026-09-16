import { Link, useParams } from "react-router-dom";
import { useGetUserByIdQuery } from "../api/userApi";
import UserInformation from "../components/UserInformation";
import EducationList from "../components/EducationList";
import Navbar from "../components/Navbar";

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
import { ArrowLeft } from "lucide-react";

const ViewUserPage = () => {
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
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Student Not Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  Could not find this student profile. It may have been deleted.
                </AlertDescription>
              </Alert>
              <Link to="/students">
                <Button size="lg">Back to Student Directory</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Student Details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Viewing registered admission details &amp; academic history
            </p>
          </div>
          <Link to="/students">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </Button>
          </Link>
        </div>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {user.fullName || "Student Record"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <UserInformation user={user} />
            <EducationList education={user.education ?? []} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ViewUserPage;