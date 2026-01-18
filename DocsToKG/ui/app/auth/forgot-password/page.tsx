"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle, Database } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-900 rounded-full mb-4">
            <Database className="h-6 w-6 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isSubmitted ? "Check your email" : "Forgot your password?"}
          </h1>
          <p className="text-gray-400 mt-2">
            {isSubmitted
              ? "We've sent you a password reset link"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {!isSubmitted ? (
          <>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Reset Form */}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success Message */}
            <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Reset email sent successfully!</span>
              </div>
              <p className="mt-2 text-sm text-green-400">
                We've sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and follow the instructions.
              </p>
            </div>

            {/* Additional Instructions */}
            <div className="space-y-4 text-sm text-gray-400">
              <p>
                <strong>Didn't receive the email?</strong>
              </p>
              <ul className="space-y-2 ml-4">
                <li className="list-disc">Check your spam or junk folder</li>
                <li className="list-disc">Make sure you entered the correct email address</li>
                <li className="list-disc">Wait a few minutes and try again</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                Try another email
              </button>
              <Link
                href="/auth/login"
                className="block w-full text-center border border-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}