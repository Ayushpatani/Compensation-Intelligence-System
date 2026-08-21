'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, MapPin, Filter, RefreshCw, BarChart2, DollarSign, Users, TrendingUp, Building2 } from 'lucide-react';
import SalaryTable from '@/components/SalaryTable';
import { StatsCard } from '@/components/StatsCard';

interface CompanyAggregation {
  id: string;
  name: string;
  entryCount: number;
  averageCompensation: number;
}

export default function Home() {
  const [entries, setEntries] = useState<any[]>([]);
  const [companies, setCompanies] = useState<CompanyAggregation[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    avgCompensation: 0,
    totalSubmissions: 0,
    companiesCount: 0,
  });

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchLevels = async () => {
    try {
      const res = await fetch('/api/levels');
      if (res.ok) {
        const data = await res.json();
        setAvailableLevels(data);
      }
    } catch (err) {
      console.error('Failed to fetch levels:', err);
    }
  };

  const fetchSalaries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        company: selectedCompany,
        location: selectedLocation,
        level: selectedLevel,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const res = await fetch(`/api/salaries?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setEntries(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch salaries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCompany, selectedLocation, selectedLevel, sortBy, sortOrder, page, limit]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchLevels();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCompany('');
    setSelectedLocation('');
    setSelectedLevel('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(val);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 max-w-7xl space-y-8">
      {/* Hero Section */}
      <div className="text-center md:text-left space-y-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Levels Matter More Than{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Job Titles.
          </span>
        </h1>
        <p className="text-gray-400 text-lg">
          CompIntel is an open database that aggregates granular total compensation (Base, Stock, Bonus) mapping standard levels across tech companies.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Total Submissions" 
          value={stats.totalSubmissions} 
          icon={Users} 
          subtitle="Salaries reported"
        />
        <StatsCard 
          title="Active Companies" 
          value={stats.companiesCount} 
          icon={Building2} 
          subtitle="Tracked in database"
        />
        <StatsCard 
          title="Average Total Comp" 
          value={stats.avgCompensation > 0 ? formatCurrency(stats.avgCompensation) : '$0'} 
          icon={TrendingUp} 
          subtitle="Across all levels"
        />
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Panel */}
        <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6 h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-gray-800">
            <h2 className="text-md font-bold text-white flex items-center space-x-2">
              <Filter className="h-4 w-4 text-emerald-400" />
              <span>Filters</span>
            </h2>
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-400 hover:text-emerald-400 flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Company, title, level..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Company Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</label>
              <select
                value={selectedCompany}
                onChange={(e) => { setSelectedCompany(e.target.value); setPage(1); }}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Companies</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.name}>
                    {comp.name} ({comp.entryCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => { setSelectedLevel(e.target.value); setPage(1); }}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Levels</option>
                {availableLevels.map((lvl, idx) => (
                  <option key={idx} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="City, Country"
                  value={selectedLocation}
                  onChange={(e) => { setSelectedLocation(e.target.value); setPage(1); }}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-gray-800 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Level Equivalence</h3>
            <Link
              href="/compare"
              className="flex items-center justify-between p-2 rounded-lg bg-gray-950/60 hover:bg-gray-850 hover:text-emerald-400 text-xs transition-colors border border-gray-800/40 text-gray-300"
            >
              <span className="flex items-center space-x-1.5">
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Compare Levels Side-by-Side</span>
              </span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Recent Submissions</h2>
            <span className="text-xs text-gray-500">
              Showing {entries.length} {stats.totalSubmissions ? `of ${stats.totalSubmissions}` : ''} entries
            </span>
          </div>

          {/* Salary Table */}
          <SalaryTable
            entries={entries}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            isLoading={isLoading}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-gray-900 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-gray-900 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
