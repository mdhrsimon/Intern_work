import { useState } from "react";
import { Link } from "react-router-dom";

import {
  useGetUsersQuery,
  useClearUsersMutation,
} from "../api/userApi";

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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DisplayPage = () => {
  const [showAll, setShowAll] = useState(() => {
    return localStorage.getItem("showAll") === "true";
  });

  const {
    data: users = [],
    isLoading,
    isError,
  } = useGetUsersQuery();

  const [
    clearUsers,
    { isLoading: isClearing },
  ] = useClearUsersMutation();

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-4xl space-y-6">

          <Skeleton className="h-10 w-72" />

          <Card>
            <CardContent className="space-y-6 pt-8">

              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>

              <Skeleton className="h-16 w-full" />

              <Skeleton className="h-32 w-full" />

            </CardContent>
          </Card>

        </div>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">

        <Card className="w-full max-w-lg">

          <CardHeader>
            <CardTitle className="text-2xl">
              Failed to load users
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            <Alert variant="destructive">
              <AlertDescription className="text-base">
                Something went wrong while loading
                the submitted information.
              </AlertDescription>
            </Alert>

            <Link to="/">
              <Button size="lg">
                Go to Form
              </Button>
            </Link>

          </CardContent>

        </Card>

      </div>
    );
  }

  // No users
  if (users.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">

        <Card className="w-full max-w-lg">

          <CardHeader>
            <CardTitle className="text-2xl">
              No User Data Found
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            <p className="text-base text-muted-foreground">
              Please submit the form first to see
              your information here.
            </p>

            <Link to="/">
              <Button size="lg">
                Go to Form
              </Button>
            </Link>

          </CardContent>

        </Card>

      </div>
    );
  }

  const latestUser =
    users[users.length - 1];

  const handleSeeAll = () => {
    setShowAll(true);
    localStorage.setItem("showAll", "true");
  };

  const handleShowLatest = () => {
    setShowAll(false);
    localStorage.setItem("showAll", "false");
  };

  const handleClearAll = async () => {
    try {
      await clearUsers().unwrap();

      setShowAll(false);
      localStorage.setItem("showAll", "false");
    } catch (error) {
      console.error(
        "Error clearing users:",
        error
      );
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">

      <div className="mx-auto max-w-4xl space-y-7">

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Submitted Information
          </h1>

          <p className="mt-2 text-base text-muted-foreground">
            View the information submitted through
            the user form.
          </p>
        </div>

        {/* Latest User */}
        {!showAll && (
          <Card>

            <CardHeader className="border-b">
              <CardTitle className="text-2xl">
                Latest Submission
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-8">

              <UserInformation
                user={latestUser}
              />

              <EducationList
                education={latestUser.education}
              />

            </CardContent>

          </Card>
        )}

        {/* All Users */}
        {showAll && (
          <div className="space-y-6">

            {users.map((user, index) => (
              <Card key={index}>

                <CardHeader className="border-b">
                  <CardTitle className="text-xl">
                    Submission {index + 1}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-8">

                  <UserInformation
                    user={user}
                  />

                  <EducationList
                    education={user.education}
                  />

                </CardContent>

              </Card>
            ))}

          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">

          {/* See All / Show Latest */}
          <Button
            type="button"
            size="lg"
            onClick={() => {
              if (showAll) {
                handleShowLatest();
              } else {
                handleSeeAll();
              }
            }}
          >
            {showAll
              ? "Show Latest"
              : "See All"}
          </Button>

          {/* Clear All */}
          <AlertDialog>

            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                />
              }
            >
              Clear All
            </AlertDialogTrigger>

            <AlertDialogContent>

              <AlertDialogHeader>

                <AlertDialogTitle className="text-lg">
                  Clear all submissions?
                </AlertDialogTitle>

                <AlertDialogDescription className="text-base">
                  This will permanently remove all
                  submitted user information. This
                  action cannot be undone.
                </AlertDialogDescription>

              </AlertDialogHeader>

              <AlertDialogFooter>

                <AlertDialogCancel size="lg">
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  size="lg"
                  onClick={handleClearAll}
                  disabled={isClearing}
                >
                  {isClearing
                    ? "Clearing..."
                    : "Clear All"}
                </AlertDialogAction>

              </AlertDialogFooter>

            </AlertDialogContent>

          </AlertDialog>

          {/* Add Another */}
          <Link to="/">
            <Button size="lg">
              Add Another
            </Button>
          </Link>

        </div>

      </div>

    </div>
  );
};

export default DisplayPage;