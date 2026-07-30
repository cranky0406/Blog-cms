import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

import showIcon from "../../assets/show.svg";
import hideIcon from "../../assets/hide.svg";

import API_BASE from "../../api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [remember, setRemember] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      if (remember) {
        localStorage.setItem("rememberAdmin", "true");
      }

      toast.success("Welcome back!");
      setTimeout(() => navigate("/admin"), 100);
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">

      <div className="absolute top-6 left-6">
        <Link to="/" className="text-blue-500 hover:text-blue-400 font-medium">
          ← Back to Website
        </Link>
      </div>

      <Card className={`w-full max-w-md shadow-2xl border-0 ${shake ? "shake" : ""}`}>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
          <CardDescription>Sign in to manage your blog</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-4">

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="you@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600 transition duration-200 active:scale-90"
              >
                <img
                  src={showPassword ? hideIcon : showIcon}
                  alt="toggle password"
                  className="w-5 h-5 opacity-60 dark:invert"
                />
              </button>
            </div>
            {capsLock && (
              <p className="text-orange-500 text-xs">⚠ Caps Lock is ON</p>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-blue-600"
              />
              Remember me
            </label>
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Signing in…" : "Login"}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
