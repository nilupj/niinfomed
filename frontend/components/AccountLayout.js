import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AccountLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">

        {/* Sidebar */}
        <aside className="w-64 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-4">Account</h3>

          <nav className="space-y-2">
            <SidebarLink href="/account">My Account</SidebarLink>
            <SidebarLink href="/account/saved">My Content</SidebarLink>

            <button
              onClick={() => signOut()}
              className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600"
            >
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ href, children }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded hover:bg-blue-50 text-gray-700"
    >
      {children}
    </Link>
  );
}
