import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useLoginMutation } from "../api/authApi";
import { saveAuth } from "../lib/authStorage";
import {
  getRole,
  homePathForRole,
  isLoggedIn,
} from "../lib/permissions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();

  // Already logged in → go to role home
  useEffect(() => {
    if (isLoggedIn()) {
      navigate(homePathForRole(getRole()), { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      saveAuth({
        token: res.token,
        email: res.email,
        role: res.role,
      });
      navigate(
        homePathForRole(
          res.role as "User" | "Staff" | "Admin"
        )
      );
    } catch {
      // error flag from RTK shows message below
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm text-red-600">
                Invalid email or password
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            No account?{" "}
            <Link to="/register" className="text-blue-600 underline">
              Register
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            Admin: admin@reactform.local / Admin@123
            <br />
            Staff: staff@reactform.local / Staff@123
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;