"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Calendar, 
  Home, 
  AlertCircle,
  Database,
  Check,
  X
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  address: string;
}

interface PasswordValidation {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    address: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): PasswordValidation => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    // Validation
    const newErrors: string[] = [];
    
    // Required fields
    if (!formData.firstName) newErrors.push("First name is required");
    if (!formData.lastName) newErrors.push("Last name is required");
    if (!formData.email) newErrors.push("Email is required");
    if (!formData.password) newErrors.push("Password is required");
    if (!formData.confirmPassword) newErrors.push("Confirm password is required");
    if (!formData.dateOfBirth) newErrors.push("Date of birth is required");
    if (!formData.address) newErrors.push("Address is required");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push("Please enter a valid email address");
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Passwords do not match");
    }

    // Password strength
    const validation = validatePassword(formData.password);
    if (formData.password && !Object.values(validation).every(Boolean)) {
      newErrors.push("Password does not meet all requirements");
    }

    // Age validation (must be at least 18 years old)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.push("You must be at least 18 years old");
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors([data.message || "Registration failed. Please try again."]);
        return;
      }

      // Refresh auth state so TopMenuBar shows the user immediately
      await refresh();

      const redirect = searchParams.get("redirect") || "/DocsToKG";
      router.push(redirect);
    } catch (error) {
      setErrors(["Registration failed. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: "google" | "microsoft") => {
    // Placeholder for future OAuth integration
    console.log(`Registering with ${provider}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-900 rounded-full mb-4">
            <Database className="h-6 w-6 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-2">Start your journey with DocsToKG</p>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Please fix the following errors:</span>
            </div>
            <ul className="mt-2 ml-7 list-disc text-sm text-red-400">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Social Registration Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleSocialRegister("google")}
            className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
            </svg>
            <span className="text-gray-300 font-medium">Google</span>
          </button>

          <button
            onClick={() => handleSocialRegister("microsoft")}
            className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
            </svg>
            <span className="text-gray-300 font-medium">Microsoft</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or register with email</span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                First Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="John"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
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

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-2">
              Date of Birth *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              />
            </div>
            <p className="mt-1 text-sm text-gray-400">You must be at least 18 years old</p>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
              Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Home className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="123 Main St, City, Country"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password *
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

            {/* Password Requirements */}
            <div className="mt-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
              <p className="text-sm font-medium text-gray-300 mb-2">Password must contain:</p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  {passwordValidation.hasMinLength ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={passwordValidation.hasMinLength ? "text-green-400" : "text-gray-400"}>
                    At least 8 characters
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordValidation.hasUpperCase ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={passwordValidation.hasUpperCase ? "text-green-400" : "text-gray-400"}>
                    One uppercase letter
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordValidation.hasLowerCase ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={passwordValidation.hasLowerCase ? "text-green-400" : "text-gray-400"}>
                    One lowercase letter
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordValidation.hasNumber ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={passwordValidation.hasNumber ? "text-green-400" : "text-gray-400"}>
                    One number
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {passwordValidation.hasSpecialChar ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-500" />
                  )}
                  <span className={passwordValidation.hasSpecialChar ? "text-green-400" : "text-gray-400"}>
                    One special character
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`block w-full pl-10 pr-10 py-2 border rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? "border-red-600 focus:border-red-500"
                    : "border-gray-600 focus:border-blue-500"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-500 hover:text-blue-400 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-2xl mx-auto"><div className="bg-gray-800 rounded-2xl h-96"></div></div>}>
      <RegisterPageContent />
    </Suspense>
  );
}