"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BadgeDollarSign,
  BarChart2,
  Building2,
  Calculator,
  DollarSign,
  Landmark,
  Menu,
  PlusCircle,
  Target,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Salaries', icon: Landmark },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/compare', label: 'Compare', icon: BarChart2 },
  { href: '/benchmark', label: 'Benchmark', icon: Target },
  { href: '/offer-analyzer', label: 'Offer Analyzer', icon: BadgeDollarSign },
  { href: '/calculator', label: 'Calculator', icon: Calculator },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-950/30">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <span className="block bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-lg font-black tracking-tight text-transparent">CompIntel</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">Compensation Intelligence</span>
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? 'bg-emerald-500/10 text-emerald-300' : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <details className="relative lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-2 text-gray-300">
              <Menu className="h-5 w-5" />
            </summary>
            <div className="absolute right-0 mt-3 w-56 rounded-xl border border-gray-800 bg-gray-900 p-2 shadow-2xl">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white">
                  <Icon className="h-4 w-4" />{label}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/submit" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 active:scale-95">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Submit Salary</span>
            <span className="sm:hidden">Submit</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
