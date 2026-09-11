"use client";

import { FormEvent, useState } from 'react';
import { BarChart3, Building2, MapPin, Search, Sparkles, Target, TrendingUp } from 'lucide-react';

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

export default function BenchmarkPage() {
  const [form, setForm] = useState({ title: 'Software Engineer', company: '', location: '', level: '', compensation: '' });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(form).forEach(([key, value]) => value && params.set(key, value));
      const response = await fetch(`/api/benchmark?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to run benchmark');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="border-b border-gray-800 bg-gradient-to-b from-emerald-950/30 to-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300"><Sparkles className="h-4 w-4" /> Market Intelligence</div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">Know exactly where your compensation stands.</h1>
            <p className="mt-4 text-lg text-gray-400">Benchmark compensation using real records in CompIntel and compare yourself against market percentiles, leading companies and role-level trends.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="h-fit rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl shadow-black/20">
          <h2 className="text-xl font-bold">Benchmark profile</h2>
          <p className="mt-1 text-sm text-gray-400">More filters = more relevant result.</p>
          <div className="mt-6 space-y-4">
            {[['title','Role / title','Software Engineer'],['company','Company (optional)','Google'],['location','Location (optional)','Bangalore'],['level','Level (optional)','L4'],['compensation','Your total compensation','180000']].map(([key,label,placeholder]) => (
              <label key={key} className="block text-sm font-medium text-gray-300">{label}
                <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} type={key === 'compensation' ? 'number' : 'text'} className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500" />
              </label>
            ))}
          </div>
          <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold transition hover:bg-emerald-500 disabled:opacity-50"><Search className="h-4 w-4" />{loading ? 'Analyzing market…' : 'Run benchmark'}</button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </form>

        {!result ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/30 p-8 text-center"><div><Target className="mx-auto h-12 w-12 text-emerald-500" /><h3 className="mt-4 text-xl font-bold">Your market report will appear here</h3><p className="mt-2 max-w-md text-gray-500">Enter a role and your compensation to calculate percentile rank, market position, compensation bands and leading employers.</p></div></div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[['Market median', money(result.stats.median), BarChart3],['Your percentile', result.percentileRank !== null ? `${result.percentileRank}th` : '—', Target],['P75 benchmark', money(result.stats.p75), TrendingUp],['Sample size', result.sampleSize, Search]].map(([label,value,Icon]: any) => <div key={label} className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><Icon className="h-5 w-5 text-emerald-400" /><p className="mt-4 text-sm text-gray-400">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}
            </div>

            {result.position && <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Market position</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-3xl font-black">{result.position.label}</h2><p className="mt-2 text-gray-400">You are {Math.abs(result.position.deltaPercent).toFixed(1)}% {result.position.deltaPercent >= 0 ? 'above' : 'below'} the market median for this comparison set.</p></div><div className="rounded-full bg-gray-950 px-4 py-2 font-bold text-emerald-300">{result.position.deltaPercent >= 0 ? '+' : ''}{result.position.deltaPercent.toFixed(1)}%</div></div></div>}

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><h2 className="text-xl font-bold">Market compensation bands</h2><div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">{[['P25', result.stats.p25],['Median', result.stats.median],['P75', result.stats.p75],['P90', result.stats.p90],['Maximum', result.stats.max]].map(([label,value]: any) => <div key={label} className="rounded-xl bg-gray-950 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p><p className="mt-2 text-lg font-bold">{money(value)}</p></div>)}</div></div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-emerald-400" /><h2 className="text-xl font-bold">Highest-paying companies in this dataset</h2></div><div className="mt-5 space-y-3">{result.topCompanies.map((company: any, index: number) => <div key={company.name} className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950 p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 font-bold text-emerald-300">{index + 1}</div><div><p className="font-semibold">{company.name}</p><p className="text-xs text-gray-500">{company.count} record{company.count === 1 ? '' : 's'}</p></div></div><p className="font-bold">{money(company.average)}</p></div>)}</div></div>
          </div>
        )}
      </div>
    </main>
  );
}
