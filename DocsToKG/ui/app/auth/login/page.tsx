"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Database } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [role, setRole] = useState<'admin' | 'member' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    // Basic validation
    const newErrors: string[] = [];
    if (!formData.email) newErrors.push("Email is required");
    if (!formData.password) newErrors.push("Password is required");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors([data.message || "Invalid email or password"]);
        return;
      }

      // Pull fresh user state so the UI (TopMenuBar) updates immediately
      await refresh();

      const redirect = searchParams.get("redirect") || "/DocsToKG";
      router.push(redirect);
    } catch (error) {
      setErrors(["Invalid email or password"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "microsoft") => {
    // Placeholder for future OAuth integration
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-900 rounded-full mb-4">
            <Database className="h-6 w-6 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to your DocsToKG account</p>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Please check the following:</span>
            </div>
            <ul className="mt-2 ml-7 list-disc text-sm text-red-400">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => handleSocialLogin("google")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 font-medium">
              Continue with Google
            </span>
          </button>

          <button
            onClick={() => handleSocialLogin("microsoft")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f3f3f3" d="M0 0h23v23H0z" />
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            <span className="text-gray-700 font-medium">
              Continue with Microsoft
            </span>
          </button>
        </div>

        {/* Role Selection (Login Only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select your role</label>
          <div className="grid grid-cols-3 gap-2">
            {(["admin","member","user"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  role === r
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full pl-10 pr-10 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                )}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-500 hover:text-blue-400"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Sign Up Link (only for 'user' role) */}
        {role === 'user' && (
          <div
            className="mt-8 text-center transition-all duration-200 ease-out"
          >
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-blue-500 hover:text-blue-400 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md mx-auto"><div className="bg-gray-800 rounded-2xl h-96"></div></div>}>
      <LoginPageContent />
    </Suspense>
  );
}