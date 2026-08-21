'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, HelpCircle, BarChart2 } from 'lucide-react';
import { CompCompareChart } from '@/components/SalaryChart';

interface CompareResult {
  company: string;
  level: string;
  count: number;
  averages: {
    totalCompensation: number;
    base: number;
    stock: number;
    bonus: number;
    yearsOfExperience: number;
  };
}

export default function Compare() {
  const [targets, setTargets] = useState<string[]>(['Google-L4', 'Meta-E4']);
  const [results, setResults] = useState<CompareResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New: toggle for automatic equivalence
  const [useEquivalence, setUseEquivalence] = useState(false);

  const [newCompany, setNewCompany] = useState('');
  const [newLevel, setNewLevel] = useState('');

  const fetchComparison = async (targetList: string[], isEquivalent: boolean) => {
    if (targetList.length === 0) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const modeParam = isEquivalent ? '&mode=equivalent' : '';
      const listToFetch = isEquivalent ? [targetList[0]] : targetList;
      
      const res = await fetch(`/api/compare?targets=${encodeURIComponent(listToFetch.join(','))}${modeParam}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to fetch comparison data');
      }
    } catch (err) {
      setError('Network error. Failed to load comparison.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(targets, useEquivalence);
  }, [targets, useEquivalence]);

  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newLevel) return;

    const targetString = `${newCompany.trim()}-${newLevel.trim().toUpperCase()}`;
    
    if (targets.includes(targetString)) {
      setError('This company-level combination is already being compared.');
      return;
    }

    if (targets.length >= 4) {
      setError('You can compare up to 4 targets at once.');
      return;
    }

    setTargets([...targets, targetString]);
    setNewCompany('');
    setNewLevel('');
  };

  const handleRemoveTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 max-w-5xl space-y-8">
      <div className="space-y-4">
        <Link href="/" className="inline-flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to salaries</span>
        </Link>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2.5">
            <BarChart2 className="h-7 w-7 text-emerald-500" />
            <span>Side-by-Side Level Comparison</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            Compare base salary, equity/stock, yearly bonuses, and experience requirements side-by-side. 
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-900/30 text-red-400 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-6 lg:col-span-1">
          {/* Options */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Comparison Mode</h2>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={useEquivalence}
                onChange={(e) => setUseEquivalence(e.target.checked)}
                className="mt-1 rounded bg-gray-950 border-gray-700 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-200">Auto-fill equivalents</div>
                <div className="text-xs text-gray-500">
                  Automatically finds and compares equivalent levels based on your first target.
                </div>
              </div>
            </label>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Add to Comparison</h2>
            
            <form onSubmit={handleAddTarget} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Company</label>
                <input
                  type="text"
                  placeholder="E.g., Google"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  required
                  disabled={useEquivalence}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Level</label>
                <input
                  type="text"
                  placeholder="E.g., L4"
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                  required
                  disabled={useEquivalence}
                />
              </div>
              <button
                type="submit"
                disabled={targets.length >= 4 || useEquivalence}
                className="w-full inline-flex items-center justify-center space-x-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Target</span>
              </button>
            </form>
          </div>

          {!useEquivalence && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Targets</h2>
              <div className="space-y-2">
                {targets.map((t, idx) => {
                  const [company, level] = t.split('-');
                  return (
                    <div key={t} className="flex justify-between items-center bg-gray-950 p-3 rounded-lg border border-gray-800">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Target {idx + 1}</div>
                        <div className="text-sm font-bold text-white">
                          {company} <span className="text-emerald-400">{level}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveTarget(idx)}
                        className="p-1.5 rounded bg-gray-900 hover:bg-red-950/30 hover:text-red-400 text-gray-500 transition-colors"
                        title="Remove target"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
                {targets.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">No active targets selected. Add a target to compare.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
              <div className="flex justify-center items-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                <span>Generating comparison stats...</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">
              Please add at least one company/level to see comparison results.
            </div>
          ) : (
            <>
              <CompCompareChart items={results.map(r => ({
                company: r.company,
                level: r.level,
                totalCompensation: r.averages.totalCompensation,
                base: r.averages.base,
                stock: r.averages.stock,
                bonus: r.averages.bonus
              }))} />

              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="text-md font-bold text-white">Comparative Table</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-gray-300">
                    <thead className="border-b border-gray-800 bg-gray-950/50 text-xs font-semibold uppercase text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Metric</th>
                        {results.map((r, idx) => (
                          <th key={idx} className="px-6 py-4 min-w-[140px] text-center border-l border-gray-850">
                            {r.company} <span className="text-emerald-400 font-mono">{r.level}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      <tr>
                        <td className="px-6 py-4 font-semibold text-white">Total Compensation</td>
                        {results.map((r, idx) => (
                          <td key={idx} className="px-6 py-4 text-center font-bold text-emerald-400 border-l border-gray-850">
                            {r.count > 0 ? formatCurrency(r.averages.totalCompensation) : 'No data'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-gray-400">Base Salary</td>
                        {results.map((r, idx) => (
                          <td key={idx} className="px-6 py-4 text-center border-l border-gray-850">
                            {r.count > 0 ? formatCurrency(r.averages.base) : '-'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-gray-400">Stock / Equity (per yr)</td>
                        {results.map((r, idx) => (
                          <td key={idx} className="px-6 py-4 text-center border-l border-gray-850">
                            {r.count > 0 ? formatCurrency(r.averages.stock) : '-'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-gray-400">Bonus</td>
                        {results.map((r, idx) => (
                          <td key={idx} className="px-6 py-4 text-center border-l border-gray-850">
                            {r.count > 0 ? formatCurrency(r.averages.bonus) : '-'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-gray-400">Avg Experience</td>
                        {results.map((r, idx) => (
                          <td key={idx} className="px-6 py-4 text-center border-l border-gray-850">
                            {r.count > 0 ? `${r.averages.yearsOfExperience} yrs` : '-'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-gray-400">Sample Count</td>
                        {results.map((r, idx) => (
                          <td key={idx} className="px-6 py-4 text-center text-xs font-semibold text-gray-500 border-l border-gray-850">
                            {r.count} {r.count === 1 ? 'entry' : 'entries'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
