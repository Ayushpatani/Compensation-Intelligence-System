"use client";

import { useMemo, useState } from 'react';
import { Calculator, Percent, TrendingUp, WalletCards } from 'lucide-react';
import { totalCompensation } from '@/lib/compensation';

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

export default function CalculatorPage() {
  const [current, setCurrent] = useState('120000');
  const [base, setBase] = useState('145000');
  const [bonus, setBonus] = useState('15000');
  const [stock, setStock] = useState('25000');
  const [signing, setSigning] = useState('10000');

  const total = useMemo(() => totalCompensation(Number(base), Number(bonus), Number(stock), Number(signing)), [base, bonus, stock, signing]);
  const hike = Number(current) > 0 ? ((total - Number(current)) / Number(current)) * 100 : 0;
  const monthlyBase = Number(base) / 12;

  return <main className="min-h-screen bg-gray-950 text-white"><div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
    <div className="max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-300"><Calculator className="h-4 w-4"/> Compensation Calculator</div><h1 className="mt-4 text-4xl font-black md:text-5xl">Model your next compensation package.</h1><p className="mt-4 text-lg text-gray-400">Calculate annualized total compensation, monthly base pay and the real percentage increase over your current package.</p></div>
    <div className="mt-10 grid gap-8 lg:grid-cols-[380px_1fr]">
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><h2 className="text-xl font-bold">Package inputs</h2><div className="mt-5 space-y-4">{[['Current total comp',current,setCurrent],['New base salary',base,setBase],['Annual bonus',bonus,setBonus],['Annualized equity',stock,setStock],['Signing bonus',signing,setSigning]].map(([label,value,setter]: any)=><label key={label} className="block text-sm text-gray-300">{label}<input type="number" value={value} onChange={(e)=>setter(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 outline-none focus:border-amber-500"/></label>)}</div></div>
      <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><WalletCards className="h-5 w-5 text-amber-400"/><p className="mt-4 text-sm text-gray-400">First-year total comp</p><p className="mt-1 text-3xl font-black">{money(total)}</p></div><div className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><TrendingUp className="h-5 w-5 text-emerald-400"/><p className="mt-4 text-sm text-gray-400">Increase vs current</p><p className="mt-1 text-3xl font-black">{hike >= 0 ? '+' : ''}{hike.toFixed(1)}%</p></div><div className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><Percent className="h-5 w-5 text-sky-400"/><p className="mt-4 text-sm text-gray-400">Monthly base</p><p className="mt-1 text-3xl font-black">{money(monthlyBase)}</p></div></div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><h2 className="text-xl font-bold">Package composition</h2><div className="mt-6 space-y-5">{[['Base salary',Number(base)],['Annual bonus',Number(bonus)],['Equity / stock',Number(stock)],['Signing bonus',Number(signing)]].map(([label,value]: any)=><div key={label}><div className="mb-2 flex justify-between text-sm"><span className="text-gray-400">{label}</span><span className="font-semibold">{money(value)} · {total ? ((value/total)*100).toFixed(1) : '0'}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full bg-amber-500" style={{width:`${total ? Math.max(1,(value/total)*100) : 0}%`}}/></div></div>)}</div></div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6"><h2 className="font-bold text-emerald-300">CompIntel signal</h2><p className="mt-2 text-sm leading-6 text-gray-300">{hike >= 25 ? 'This is a substantial compensation increase. Compare it with the market benchmark before deciding whether to push for more.' : hike >= 10 ? 'This is a meaningful increase, but market percentile matters more than percentage hike alone.' : 'The increase is modest. Use Benchmark and Offer Analyzer to understand whether the package is still below market.'}</p></div>
      </div>
    </div>
  </div></main>;
}
