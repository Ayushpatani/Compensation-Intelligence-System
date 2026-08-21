'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Landmark, MapPin, Briefcase, DollarSign } from 'lucide-react';
import SalaryTable from '@/components/SalaryTable';
import { CompBreakdownChart } from '@/components/SalaryChart';

interface CompanyDetails {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  averageCompensation: number;
  entryCount: number;
}

export default function CompanyProfile({ params }: { params: { companyName: string } }) {
  const companyName = decodeURIComponent(params.companyName);

  // State variables
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [averages, setAverages] = useState({ base: 0, stock: 0, bonus: 0 });
  
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanyData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Company Metadata
      const compRes = await fetch(`/api/companies?search=${encodeURIComponent(companyName)}`);
      if (compRes.ok) {
        const comps = await compRes.json();
        const found = comps.find((c: any) => c.name.toLowerCase() === companyName.toLowerCase());
        if (found) setCompany(found);
      }

      // 2. Fetch Salaries for this Company
      const params = new URLSearchParams({
        company: companyName,
        sortBy,
        sortOrder,
        limit: '100', // Fetch up to 100 entries for detailed profile
      });
      const salRes = await fetch(`/api/salaries?${params.toString()}`);
      if (salRes.ok) {
        const result = await salRes.json();
        setEntries(result.data);

        // Calculate average base, stock, bonus splits
        const data = result.data;
        if (data.length > 0) {
          const sums = data.reduce((acc: any, entry: any) => {
            acc.base += entry.base;
            acc.stock += entry.stock;
            acc.bonus += entry.bonus;
            return acc;
          }, { base: 0, stock: 0, bonus: 0 });

          setAverages({
            base: Math.round(sums.base / data.length),
            stock: Math.round(sums.stock / data.length),
            bonus: Math.round(sums.bonus / data.length),
          });
        }
      }
    } catch (err) {
      console.error('Failed to load company profile data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyName, sortBy, sortOrder]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading && !company) {
    return (
      <div className="container mx-auto px-4 py-24 text-center text-gray-500">
        <div className="flex justify-center items-center space-x-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span>Loading company profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 max-w-6xl space-y-8">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to salaries</span>
      </Link>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">{company?.name || companyName}</h1>
              {company?.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">
                  {company.website}
                </a>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-400 pt-2">
            <span className="flex items-center space-x-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{company?.entryCount || 0} Submissions</span>
            </span>
          </div>
        </div>

        {/* Company aggregate averages */}
        <div className="border-t border-gray-800 md:border-t-0 pt-4 md:pt-0 space-y-1">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Average Total Compensation</span>
          <div className="text-3xl font-extrabold text-emerald-400">
            {formatCurrency(company?.averageCompensation || 0)}
          </div>
        </div>
      </div>

      {/* Splits and breakdown visualization */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Average Breakdown</h2>
            <CompBreakdownChart
              base={averages.base}
              stock={averages.stock}
              bonus={averages.bonus}
            />
          </div>

          {/* Level ranges list */}
          <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Compensation by Level</h2>
            <div className="divide-y divide-gray-800">
              {Object.entries(
                entries.reduce((acc: any, curr: any) => {
                  if (!acc[curr.level]) {
                    acc[curr.level] = { count: 0, total: 0, min: Infinity, max: -Infinity };
                  }
                  acc[curr.level].count += 1;
                  acc[curr.level].total += curr.totalCompensation;
                  if (curr.totalCompensation < acc[curr.level].min) acc[curr.level].min = curr.totalCompensation;
                  if (curr.totalCompensation > acc[curr.level].max) acc[curr.level].max = curr.totalCompensation;
                  return acc;
                }, {})
              ).map(([lvl, stat]: [string, any]) => (
                <div key={lvl} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                  <div>
                    <span className="font-mono text-emerald-400 font-bold">{lvl}</span>
                    <span className="text-xs text-gray-500 ml-2">({stat.count} {stat.count === 1 ? 'entry' : 'entries'})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{formatCurrency(Math.round(stat.total / stat.count))}</div>
                    <div className="text-xs text-gray-500">Range: {formatCurrency(stat.min)} - {formatCurrency(stat.max)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Salary entries listing */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">All Submissions for {company?.name || companyName}</h2>
        <SalaryTable
          entries={entries}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
