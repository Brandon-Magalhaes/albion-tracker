'use client';

import Link from 'next/link';
import { Sword } from 'lucide-react';
import { usePathname } from 'next/navigation';
import SearchForm from './SearchForm';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-backdrop-filter:bg-gray-900/75">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Sword className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold text-white hidden sm:inline-block">Albion Tracker</span>
        </Link>

        {/* Show Search in Header only if NOT on Home page */}
        {!isHome && (
          <div className="flex-1 max-w-md mx-4">
             <div className="scale-90 origin-right sm:origin-center">
                <SearchForm />
             </div>
          </div>
        )}

        <div className="flex items-center gap-4">
            {/* Future links can go here (e.g. Guilds, Leaderboards) */}
        </div>
      </div>
    </header>
  );
}
