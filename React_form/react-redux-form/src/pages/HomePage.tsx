import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { homePathForRole } from "../lib/permissions";
import { useAuthSession } from "../lib/useAuthSession";

const HomePage = () => {
  const { loggedIn, role, isChecking } = useAuthSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="w-full border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Student Management System
          </span>
          <nav className="flex items-center gap-3">
            {isChecking ? null : loggedIn ? (
              <Link to={homePathForRole(role)}>
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg">Register</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6 text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Manage Students with Clarity
                </h1>
                <p className="text-lg text-slate-600 sm:text-xl max-w-xl mx-auto lg:mx-0">
                  A simple, role-based system for registering students,
                  reviewing submissions, and managing staff and courses —
                  built for schools and training programs.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                  {isChecking ? (
                    <p className="text-slate-500">Checking sign-in…</p>
                  ) : loggedIn ? (
                    <Link to={homePathForRole(role)}>
                      <Button size="lg" className="h-12 px-8 text-base">
                        Open Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button size="lg" className="h-12 px-8 text-base">
                          Login to Continue
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button
                          variant="outline"
                          size="lg"
                          className="h-12 px-8 text-base"
                        >
                          Create Account
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">For Students</CardTitle>
                    <CardDescription>
                      Submit your profile and track your registration status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Secure form access after login. View your own submission anytime.
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">For Staff</CardTitle>
                    <CardDescription>
                      Review student submissions and manage records.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Browse students, update details, and keep courses organized.
                  </CardContent>
                </Card>

                <Card className="shadow-sm sm:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">For Admins</CardTitle>
                    <CardDescription>
                      Full control over users, staff, and system data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">
                    Manage staff accounts, courses, and overall student records from one place.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t bg-white py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
            Student Management System — secure, role-based access for registration and records.
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;