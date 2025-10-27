"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  async function resendEmail() {
    setResending(true);
    setMessage("");
    
    try {
      const email = localStorage.getItem("pending_verification_email");
      
      if (!email) {
        setMessage("Email not found. Please try signing up again.");
        setResending(false);
        return;
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (error) {
        setMessage("Error resending email. Please try again.");
      } else {
        setMessage("✓ Verification email resent! Check your inbox.");
      }
    } catch (e) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">Check your inbox ✉️</h1>
          <p className="text-gray-600">
            We've sent a confirmation link to your email.
            <br />
            Click it to verify and unlock your Trip Builder.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`text-sm text-center p-3 rounded-lg ${message.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={resendEmail}
            disabled={resending}
            className="w-full px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {resending ? "Sending..." : "Resend Email"}
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 rounded-lg font-semibold text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-center text-gray-500">
          Didn't receive the email? Check your spam folder or click "Resend Email" above.
        </p>
      </div>
    </main>
  );
}
