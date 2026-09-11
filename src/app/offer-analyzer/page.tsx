"use client";

import { FormEvent, useMemo, useState } from 'react';
import { BadgeDollarSign, BriefcaseBusiness, CheckCircle2, Gauge, Sparkles, TrendingUp } from 'lucide-react';
import { marketPosition, offerScore, totalCompensation } from '@/lib/compensation';

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

export default function OfferAnalyzerPage() {
  const [form, setForm] = useState({ title: 'Software Engineer', company: '', location: '', level: '', base: '140000', bonus: '15000', stock: '25000', signingBonus: '10000' });
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => totalCompensation(Number(form.base), Number(form.bonus), Number(form.stock), Number(form.signingBonus)), [form]);

  async function analyze(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams({ title: form.title, compensation: String(total) });
    if (form.company) params.set('company', form.company);
    if (form.location) params.set('location', form.location);
    if (form.level) params.set('level', form.level);
    const response = await fetch(`/api/benchmark?${params}`);
    const data = await response.json();
    setBenchmark(response.ok ? data : null);
    setLoading(false);
  }

  const score = benchmark ? offerScore({ total, marketMedian: benchmark.stats.median, marketP75: benchmark.stats.p75, baseShare: total ? Number(form.base) / total : 0, hasEquity: Number(form.stock) > 0 }) : 0;
  const position = benchmark ? marketPosition(total, benchmark.stats.median) : null;

  return <main className="min-h-screen bg-gray-950 text-white"><div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
    <div className="max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-sm text-violet-300"><Sparkles className="h-4 w-4"/> Offer Intelligence</div><h1 className="mt-4 text-4xl font-black md:text-5xl">Analyze any job offer like a compensation strategist.</h1><p className="mt-4 text-lg text-gray-400">Break down cash, bonus and equity, compare total compensation with the market and get an explainable offer score.</p></div>
    <div className="mt-10 grid gap-8 lg:grid-cols-[420px_1fr]">
      <form onSubmit={analyze} className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><h2 className="text-xl font-bold">Offer details</h2><div className="mt-5 grid gap-4">{[['title','Role'],['company','Company'],['location','Location'],['level','Level'],['base','Base salary'],['bonus','Annual bonus'],['stock','Annualized equity'],['signingBonus','Signing bonus']].map(([key,label]) => <label key={key} className="text-sm text-gray-300">{label}<input type={['base','bonus','stock','signingBonus'].includes(key) ? 'number' : 'text'} value={(form as any)[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})} className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-violet-500"/></label>)}</div><div className="mt-5 rounded-xl border border-gray-800 bg-gray-950 p-4"><p className="text-xs uppercase tracking-wider text-gray-500">Total first-year compensation</p><p className="mt-1 text-3xl font-black text-violet-300">{money(total)}</p></div><button disabled={loading} className="mt-5 w-full rounded-xl bg-violet-600 px-4 py-3 font-bold hover:bg-violet-500 disabled:opacity-50">{loading ? 'Analyzing…' : 'Analyze offer'}</button></form>
      {!benchmark ? <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/30 p-8 text-center"><div><BriefcaseBusiness className="mx-auto h-12 w-12 text-violet-400"/><h3 className="mt-4 text-xl font-bold">Your offer report will appear here</h3><p className="mt-2 max-w-lg text-gray-500">Run the analyzer to see total comp mix, market gap, percentile and negotiation signals.</p></div></div> : <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><Gauge className="h-5 w-5 text-violet-400"/><p className="mt-4 text-sm text-gray-400">Offer score</p><p className="mt-1 text-4xl font-black">{score}<span className="text-lg text-gray-500">/100</span></p></div><div className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><TrendingUp className="h-5 w-5 text-emerald-400"/><p className="mt-4 text-sm text-gray-400">Market percentile</p><p className="mt-1 text-4xl font-black">{benchmark.percentileRank}th</p></div><div className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><BadgeDollarSign className="h-5 w-5 text-amber-400"/><p className="mt-4 text-sm text-gray-400">Market median</p><p className="mt-1 text-2xl font-black">{money(benchmark.stats.median)}</p></div></div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><h2 className="text-xl font-bold">Compensation mix</h2><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{[['Base',Number(form.base)],['Bonus',Number(form.bonus)],['Equity',Number(form.stock)],['Signing',Number(form.signingBonus)]].map(([label,value]: any)=><div key={label} className="rounded-xl bg-gray-950 p-4"><p className="text-xs uppercase tracking-wider text-gray-500">{label}</p><p className="mt-2 font-bold">{money(value)}</p><p className="mt-1 text-xs text-gray-600">{total ? ((value/total)*100).toFixed(0) : 0}% of total</p></div>)}</div></div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6"><h2 className="text-xl font-bold">Negotiation intelligence</h2><div className="mt-4 space-y-3 text-sm text-gray-300"><p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-400"/>Your offer is <strong>{position?.label.toLowerCase()}</strong> at {position ? `${position.deltaPercent >= 0 ? '+' : ''}${position.deltaPercent.toFixed(1)}%` : '0%'} versus market median.</p><p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-400"/>The 75th percentile for this profile is <strong>{money(benchmark.stats.p75)}</strong>. Use that as an ambitious but data-backed negotiation anchor.</p><p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-400"/>{Number(form.base)/total < 0.65 ? 'A large share of the package is variable. Consider negotiating more guaranteed base salary.' : 'Your guaranteed-base share is healthy relative to total compensation.'}</p></div></div>
      </div>}
    </div>
  </div></main>;
}
