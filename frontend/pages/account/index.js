import { useSession } from 'next-auth/react';
import AccountLayout from '../../components/AccountLayout';
export default function AccountPage() {
  const { data: session } = useSession();

  return (
    <AccountLayout>
      <h1 className="text-2xl font-bold mb-4">My Account</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <p><strong>Name:</strong> {session?.user?.name}</p>
        <p><strong>Email:</strong> {session?.user?.email}</p>
      </div>
    </AccountLayout>
  );
}
