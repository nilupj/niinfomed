import { useSession, signIn } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="p-10 text-center">
        Loading profile...
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold mb-4">
          You are not logged in
        </h2>
        <button
          onClick={() => signIn()}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Logged in
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">
        Your Profile
      </h1>

      <div className="bg-white shadow rounded p-6 space-y-4">
        <div>
          <strong>Name:</strong> {session.user?.name}
        </div>

        <div>
          <strong>Email:</strong> {session.user?.email}
        </div>

        {session.user?.image && (
          <img
            src={session.user.image}
            alt="Profile"
            className="w-20 h-20 rounded-full"
          />
        )}
      </div>
    </div>
  );
}
