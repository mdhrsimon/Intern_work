import { Link } from "react-router-dom";
import { useGetMySubmissionQuery } from "../api/userApi";
import UserInformation from "../components/UserInformation";
import EducationList from "../components/EducationList";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Loader2, ArrowLeft } from "lucide-react";

const MySubmissionPage = () => {
  const { data: user, isLoading, isError } = useGetMySubmissionQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p>Loading your submission...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Submission Found</h2>
          <p className="max-w-md text-slate-600 text-sm">
            You have not submitted your registration form yet. Complete your profile
            to record your details in the system.
          </p>
          <Link to="/form">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Fill Registration Form
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Submission</h1>
            <p className="text-sm text-slate-500 mt-1">Review your registered profile and education details.</p>
          </div>
          <Link to="/student">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
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

export default MySubmissionPage;