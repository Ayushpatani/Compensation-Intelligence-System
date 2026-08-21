"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DollarSign, Landmark, BarChart2, PlusCircle, Building2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="mr-8 flex items-center space-x-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <DollarSign className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            CompIntel
          </span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          <Link
            href="/"
            className={`flex items-center space-x-1 transition-colors hover:text-emerald-400 ${
              pathname === '/' ? 'text-emerald-400 font-semibold' : 'text-gray-300'
            }`}
          >
            <Landmark className="h-4 w-4" />
            <span>Salaries</span>
          </Link>
          <Link
            href="/companies"
            className={`flex items-center space-x-1 transition-colors hover:text-emerald-400 ${
              pathname.startsWith('/companies') ? 'text-emerald-400 font-semibold' : 'text-gray-300'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Companies</span>
          </Link>
          <Link
            href="/compare"
            className={`flex items-center space-x-1 transition-colors hover:text-emerald-400 ${
              pathname.startsWith('/compare') ? 'text-emerald-400 font-semibold' : 'text-gray-300'
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Compare</span>
          </Link>
        </nav>
        <div className="flex items-center">
          <Link
            href="/submit"
            className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-emerald-500 hover:shadow-emerald-950/20 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Submit Salary</span>
            <span className="sm:hidden">Submit</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
