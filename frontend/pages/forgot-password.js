import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Password reset link sent to your email.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password | NiiInfoMed</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">

          <h1 className="text-xl font-semibold text-center">
            Forgot your password?
          </h1>

          <p className="text-sm text-gray-500 text-center mt-2">
            Enter your email address and we’ll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          {message && (
            <p className="text-center text-sm mt-4 text-blue-600">
              {message}
            </p>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remembered your password?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
