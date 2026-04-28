import React from 'react';
import Link from 'next/link';
import { getPublicNavigation } from '../../lib/publicSite/publicNavigation';

// Define a minimal Club type based on what we need and what Prisma provides
interface Club {
  id: string;
  name: string;
  slug: string;
  settings?: {
    displayName: string;
    shortName: string;
  } | null;
}

interface PublicClubShellProps {
  club: Club;
  children: React.ReactNode;
}

/**
 * A minimal navigation shell for the public club site.
 */
export default function PublicClubShell({ club, children }: PublicClubShellProps) {
  const displayName = club.settings?.displayName || club.name;
  const navigationItems = getPublicNavigation(club.slug);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-slate-900">{displayName}</span>
            </div>
            <nav className="flex space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} {displayName}. Powered by Club Platform.
        </div>
      </footer>
    </div>
  );
}
