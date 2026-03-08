'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const NAV_ITEMS = user ? [
    { href: '/', label: 'Home', id: 'nav-home' },
    { href: '/add-food', label: 'Add Food', id: 'nav-add-food' },
    { href: '/profile', label: 'Profile', id: 'nav-profile' },
  ] : [];

  return (
    <nav className="bg-[#FFD600] border-b-4 border-black">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
          id="nav-logo"
        >
          MACROS CALC
        </Link>

        {user && (
          <div className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                id={item.id}
                className={`px-4 py-2 font-bold text-sm uppercase tracking-wide transition-all border-3 border-transparent hover:border-black ${
                  pathname === item.href
                    ? 'bg-black text-[#FFD600] border-black'
                    : 'hover:bg-black/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
