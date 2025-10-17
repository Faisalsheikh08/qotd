'use client';

import Navbar from '@/components/Navbar';
import Spinner from '@/components/Spinner';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    await signIn("google", { callbackUrl: "/home" })
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-violet-100 px-4">
        <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg">
          {/* Logo or Title */}
          <div className="text-center">
            <img src="/logo.png" alt="Logo" className="mx-auto h-24 w-24 border-2 border-gray-100 shadow-md mb-6 rounded-xl" />
            <h1 className="text-3xl font-bold text-gray-800">Hello Student👋🏻</h1>
            <p className="mt-2 text-gray-500">Welcome back! Sign in to continue</p>
          </div>

          {/* Google Login Button */}
          <div className="">
            <button
              onClick={handleLogin}
              disabled={loading}
              className={"w-full flex items-center justify-center gap-3 rounded-md bg-violet-500 hover:bg-violet-600 px-4 py-2 text-white font-medium shadow-md transition " + (loading ? " opacity-50 cursor-not-allowed" : "cursor-pointer")}
            >
              {loading ? <><Spinner />Signing in</> : <><svg className="h-5 w-5" viewBox="0 0 48 48">
                <path
                  fill="#fff"
                  d="M44.5 20H24v8.5h11.9C34.3 33.9 29.7 37 24 37c-7 0-13-6-13-13s6-13 13-13c3.4 0 6.4 1.3 8.7 3.4l6.4-6.4C35.1 4.5 29.9 2 24 2 12.4 2 3 11.4 3 23s9.4 21 21 21c10.5 0 20.5-7.5 20.5-21 0-1.2-.1-2.1-.3-3z"
                />
              </svg>Sign in with Google</>}
            </button>
          </div>

          {/* Info Note */}
          {/* <p className="text-sm text-gray-400 text-center">
          We only use your Google account to authenticate you.
        </p> */}

          {/* Terms / Privacy Links */}
          <div className="text-center text-xs text-gray-400 mt-4">
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>{' '}
            ·{' '}
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>
          </div>

          {/* Optional Footer */}
          <footer className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} Teaching Pariksha
          </footer>
        </div>
      </div>
    </div>
  );
}
