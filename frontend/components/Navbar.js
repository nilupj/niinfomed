import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  const servicesUrl =
    process.env.NEXT_PUBLIC_SERVICES_URL || 'http://localhost:3000';

  return (
    <nav className="bg-white border-b-2 border-blue-600 sticky top-0 z-50 shadow-sm">

      {/* ───── TOP BAR ───── */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">

          <span className="text-xs text-white hidden md:block">
            Trusted Medical Information
          </span>

          <div className="flex items-center gap-4 text-white">

            {status === 'loading' ? null : session ? (
              <div className="flex items-center gap-3">

                <span className="text-sm hidden sm:block">
                  Hello, {session.user?.name || 'User'}
                </span>

                {/* ✅ PROFILE → ACCOUNT DASHBOARD */}
                <Link
                  href="/account/saved"
                  className="text-sm hover:text-blue-200"
                >
                  My Content
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-sm hover:text-blue-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ───── MAIN NAVBAR ───── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 text-white font-bold flex items-center justify-center rounded">
            N
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-blue-700">NiinfoMed</div>
            <div className="text-xs text-gray-500">Medical Information Portal</div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-4">
          <NavLink href="/conditions">Conditions</NavLink>
          <NavLink href="/drugs-supplements">Drugs & Supplements</NavLink>
          <NavLink href="/well-being">Well-Being</NavLink>

          <div className="relative group">
            <button className="font-medium flex items-center gap-1">
              More ▾
            </button>
            <div className="absolute hidden group-hover:block bg-white shadow-md w-56">
              <DropdownLink href={servicesUrl} external>🏥 Services</DropdownLink>
              <DropdownLink href="/symptom-checker">🩺 Symptom Checker</DropdownLink>
              <DropdownLink href="/health-news">📰 Health News</DropdownLink>
              <DropdownLink href="/quizzes">🎯 Quizzes</DropdownLink>
              <DropdownLink href="/videos">🎥 Videos</DropdownLink>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <SearchBar />
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <SearchBar />
          <button onClick={toggleMobileMenu}>
            {mobileMenuOpen ? '✖' : '☰'}
          </button>
        </div>
      </div>

      {/* ───── MOBILE MENU ───── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t">

          <MobileLink href="/conditions">Conditions</MobileLink>
          <MobileLink href="/drugs-supplements">Drugs & Supplements</MobileLink>
          <MobileLink href="/well-being">Well-Being</MobileLink>
          <MobileLink href={servicesUrl} external>🏥 Services</MobileLink>
          <MobileLink href="/symptom-checker">🩺 Symptom Checker</MobileLink>
          <MobileLink href="/health-news">📰 Health News</MobileLink>

          {session ? (
            <>
              {/* ✅ MOBILE PROFILE FIX */}
              <MobileLink href="/account/saved">👤 My Content</MobileLink>

              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full text-left px-4 py-3 hover:bg-red-50"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <MobileLink href="/login">Sign In</MobileLink>
          )}
        </div>
      )}
    </nav>
  );
}

/* ───── Helpers ───── */

function NavLink({ href, children }) {
  return (
    <Link href={href} className="font-medium hover:text-blue-600">
      {children}
    </Link>
  );
}

function DropdownLink({ href, children, external = false }) {
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="block px-4 py-2 hover:bg-blue-50">
      {children}
    </a>
  ) : (
    <Link href={href} className="block px-4 py-2 hover:bg-blue-50">
      {children}
    </Link>
  );
}

function MobileLink({ href, children, external = false }) {
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="block px-4 py-3 hover:bg-blue-50">
      {children}
    </a>
  ) : (
    <Link href={href} className="block px-4 py-3 hover:bg-blue-50">
      {children}
    </Link>
  );
}
