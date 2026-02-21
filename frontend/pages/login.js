import { signIn } from "next-auth/react";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Sign in | NiiInfoMed</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
              N
            </div>
          </div>

          <h1 className="text-xl font-semibold text-center">
            Sign in to NiiInfoMed
          </h1>

          <p className="text-sm text-gray-500 text-center mt-2">
            By signing in, you agree to our{" "}
            <span className="text-blue-600 cursor-pointer">terms</span> and{" "}
            <span className="text-blue-600 cursor-pointer">privacy policy</span>.
          </p>

          {/* Google Login */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() =>
                signIn("google", { callbackUrl: "/dashboard" })
              }
              className="w-full border rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="h-5 w-5"
              />
              <span className="font-medium">Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t"></div>
            <span className="px-3 text-sm text-gray-400">
              Or continue with email
            </span>
            <div className="flex-1 border-t"></div>
          </div>

          {/* Email Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember me
              </label>

              <Link
                href="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
