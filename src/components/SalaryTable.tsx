'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpDown, MapPin, Calendar, Briefcase } from 'lucide-react';

interface SalaryTableProps {
  entries: any[];
  sortBy: string;
  sortOrder: string;
  onSort: (field: string) => void;
  isLoading?: boolean;
}

export default function SalaryTable({ entries, sortBy, sortOrder, onSort, isLoading = false }: SalaryTableProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />;
    return (
      <span className="ml-1 text-emerald-400 font-bold">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-gray-300">
          <thead className="border-b border-gray-800 bg-gray-950/50 text-xs font-semibold uppercase text-gray-400">
            <tr>
              <th className="px-6 py-4">
                <button
                  type="button"
                  className="flex items-center hover:text-white"
                  onClick={() => onSort('createdAt')}
                >
                  Date {renderSortIcon('createdAt')}
                </button>
              </th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Role & Level</th>
              <th className="px-6 py-4">
                <button
                  type="button"
                  className="flex items-center hover:text-white"
                  onClick={() => onSort('totalCompensation')}
                >
                  Total Comp {renderSortIcon('totalCompensation')}
                </button>
              </th>
              <th className="px-6 py-4 hidden md:table-cell">Breakdown (Base/Stock/Bonus)</th>
              <th className="px-6 py-4">
                <button
                  type="button"
                  className="flex items-center hover:text-white"
                  onClick={() => onSort('yearsOfExperience')}
                >
                  Experience {renderSortIcon('yearsOfExperience')}
                </button>
              </th>
              <th className="px-6 py-4 hidden lg:table-cell">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900/50">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <span>Loading salaries...</span>
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No salary records found matching your filters.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(entry.createdAt)}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-white">
                    <Link
                      href={`/companies/${encodeURIComponent(entry.company.name)}`}
                      className="hover:underline hover:text-emerald-400"
                    >
                      {entry.company.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{entry.title}</span>
                      <span className="text-xs text-emerald-400 font-mono font-semibold">{entry.level}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-white">
                    <span className="text-emerald-400">{formatCurrency(entry.totalCompensation)}</span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-900/30">
                        B: {formatCurrency(entry.base)}
                      </span>
                      {entry.stock > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-900/30">
                          S: {formatCurrency(entry.stock)}
                        </span>
                      )}
                      {entry.bonus > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-pink-950/50 text-pink-400 border border-pink-900/30">
                          B: {formatCurrency(entry.bonus)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="flex items-center space-x-1 text-xs font-semibold text-gray-300">
                      <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                      <span>{entry.yearsOfExperience} yrs</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-xs text-gray-400">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span>{entry.location}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
