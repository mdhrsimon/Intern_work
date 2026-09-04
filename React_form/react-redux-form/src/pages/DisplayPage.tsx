import { useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  useGetUsersInfiniteQuery,
  useClearUsersMutation,
  useDeleteUserMutation,
} from "../api/userApi";
import type { User } from "../types/user";
import { loadAuth, clearAuth } from "../lib/authStorage";
import { canDelete, canEdit } from "../lib/permissions";

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
  const navigate = useNavigate();
  const auth = loadAuth();
  const roleCanEdit = canEdit();
  const roleCanDelete = canDelete();

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetUsersInfiniteQuery();

  const [clearUsers, { isLoading: isClearing }] =
    useClearUsersMutation();
  const [deleteUser, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  const users: User[] =
    data?.pages.flatMap((page) => page.items) ?? [];

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry?.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleClearAll = async () => {
    try {
      await clearUsers().unwrap();
    } catch (error) {
      console.error("Error clearing users:", error);
    }
  };

  const handleDelete = async (id: number | string | undefined) => {
    if (id === undefined) return;
    try {
      await deleteUser(id).unwrap();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Failed to load users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Something went wrong while loading submissions. You may need
                to log in as Staff or Admin.
              </AlertDescription>
            </Alert>
            <div className="flex flex-wrap gap-2">
              <Link to="/login">
                <Button size="lg">Login</Button>
              </Link>
              <Link to="/form">
                <Button size="lg" variant="outline">
                  Go to Form
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Submitted Users
            </h1>
            <p className="mt-1.5 text-base text-slate-500">
              {users.length === 0
                ? "No submissions yet."
                : `${users.length} loaded`}
              {auth
                ? ` · ${auth.email} (${auth.role})`
                : " · Not logged in"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {auth ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button type="button" variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button type="button" variant="outline" size="lg">
                    Register
                  </Button>
                </Link>
              </>
            )}

            <Link to="/form">
              <Button size="lg" className="shadow-sm">
                Add Another
              </Button>
            </Link>

            {/* Clear all — Admin only */}
            {roleCanDelete && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      disabled={users.length === 0 || isClearing}
                    />
                  }
                >
                  Clear All
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Clear all submissions?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes every submitted user. This
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      disabled={isClearing}
                    >
                      {isClearing ? "Clearing..." : "Clear All"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Empty */}
        {users.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-slate-500">
                No users have submitted the form yet.
              </p>
              <Link to="/form">
                <Button size="lg">Add First User</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* List: name, email, actions */}
        {users.length > 0 && (
          <div className="space-y-3">
            {users.map((user, index) => (
              <Card
                key={user.id ?? `user-${index}`}
                className="overflow-hidden border-slate-200/80 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-lg font-semibold text-slate-900">
                      {user.fullName || "Unnamed"}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {user.email || "No email"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      to={
                        user.id != null ? `/users/${user.id}` : "#"
                      }
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={user.id == null}
                      >
                        View
                      </Button>
                    </Link>

                    {roleCanEdit && (
                      <Link
                        to={
                          user.id != null
                            ? `/users/${user.id}/edit`
                            : "#"
                        }
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={user.id == null}
                        >
                          Edit
                        </Button>
                      </Link>
                    )}

                    {roleCanDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={
                                user.id === undefined || isDeleting
                              }
                            />
                          }
                        >
                          Delete
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete this user?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove{" "}
                              <strong>
                                {user.fullName || "this user"}
                              </strong>
                              . This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div ref={loadMoreRef} className="flex justify-center py-6">
          {isFetchingNextPage && (
            <p className="text-sm text-slate-500">Loading more...</p>
          )}
          {!hasNextPage && users.length > 0 && (
            <p className="text-sm text-slate-500">End of list</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayPage;