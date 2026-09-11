import { prisma } from '@/lib/prisma';
import { compensationStats } from '@/lib/compensation';
import { BarChart3, Building2, MapPin, Sparkles, TrendingUp, Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

export default async function InsightsPage() {
  const entries = await prisma.salaryEntry.findMany({
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  const stats = compensationStats(entries);

  const aggregate = <T extends string>(key: (entry: (typeof entries)[number]) => T) =>
    Object.entries(entries.reduce<Record<string, { total: number; count: number }>>((acc, entry) => {
      const name = key(entry) || 'Unknown';
      acc[name] ??= { total: 0, count: 0 };
      acc[name].total += entry.totalCompensation;
      acc[name].count += 1;
      return acc;
    }, {})).map(([name, value]) => ({ name, average: value.total / value.count, count: value.count }));

  const companies = aggregate((entry) => entry.company.name).sort((a, b) => b.average - a.average).slice(0, 6);
  const roles = aggregate((entry) => entry.title).filter((item) => item.count >= 2).sort((a, b) => b.average - a.average).slice(0, 6);
  const locations = aggregate((entry) => entry.location).filter((item) => item.count >= 2).sort((a, b) => b.average - a.average).slice(0, 6);

  const newest = entries.slice(0, 30);
  const older = entries.slice(30, 60);
  const recentAvg = newest.length ? newest.reduce((sum, e) => sum + e.totalCompensation, 0) / newest.length : 0;
  const olderAvg = older.length ? older.reduce((sum, e) => sum + e.totalCompensation, 0) / older.length : recentAvg;
  const trend = olderAvg ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  const equityShare = entries.length ? entries.reduce((sum, e) => sum + e.stock, 0) / entries.reduce((sum, e) => sum + e.totalCompensation, 0) * 100 : 0;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="border-b border-gray-800 bg-gradient-to-b from-sky-950/25 to-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-sm text-sky-300"><Sparkles className="h-4 w-4"/> Intelligence Brief</div>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">Market compensation intelligence from your dataset.</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-400">A decision-ready view of pay distribution, company premiums, role economics, location effects and recent market movement.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[['Dataset median', money(stats.median), BarChart3],['P90 compensation', money(stats.p90), Trophy],['Recent comp trend', `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`, TrendingUp],['Average equity mix', `${equityShare.toFixed(1)}%`, Sparkles]].map(([label,value,Icon]: any) => <div key={label} className="rounded-2xl border border-gray-800 bg-gray-900 p-5"><Icon className="h-5 w-5 text-sky-400"/><p className="mt-4 text-sm text-gray-400">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div>)}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Ranking title="Highest-paying companies" icon={<Building2 className="h-5 w-5 text-emerald-400"/>} items={companies}/>
          <Ranking title="Highest-paying roles" icon={<Trophy className="h-5 w-5 text-amber-400"/>} items={roles}/>
          <Ranking title="Highest-paying locations" icon={<MapPin className="h-5 w-5 text-sky-400"/>} items={locations}/>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-400"/><h2 className="text-xl font-bold">Automated intelligence signals</h2></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Signal title="Market center" body={`The median total compensation across ${stats.count} records is ${money(stats.median)}. The interquartile market band runs from ${money(stats.p25)} to ${money(stats.p75)}.`}/>
            <Signal title="Top-end premium" body={`P90 compensation is ${money(stats.p90)}, which is ${stats.median ? (((stats.p90 - stats.median) / stats.median) * 100).toFixed(0) : 0}% above the dataset median.`}/>
            <Signal title="Company premium" body={companies[0] ? `${companies[0].name} currently leads the dataset with an average total compensation of ${money(companies[0].average)} across ${companies[0].count} records.` : 'Add more salary records to calculate company premiums.'}/>
            <Signal title="Market direction" body={`The most recent sample is trending ${Math.abs(trend).toFixed(1)}% ${trend >= 0 ? 'higher' : 'lower'} than the preceding sample. Treat this as directional, not causal, because submissions are user-generated.`}/>
          </div>
        </div>
      </div>
    </main>
  );
}

function Ranking({ title, icon, items }: { title: string; icon: React.ReactNode; items: { name: string; average: number; count: number }[] }) {
  return <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6"><div className="flex items-center gap-2">{icon}<h2 className="font-bold">{title}</h2></div><div className="mt-5 space-y-3">{items.length ? items.map((item, index) => <div key={item.name} className="flex items-center justify-between gap-4 rounded-xl bg-gray-950 p-4"><div className="min-w-0"><p className="truncate font-semibold"><span className="mr-2 text-gray-600">#{index + 1}</span>{item.name}</p><p className="mt-1 text-xs text-gray-500">{item.count} record{item.count === 1 ? '' : 's'}</p></div><p className="shrink-0 font-bold">{money(item.average)}</p></div>) : <p className="text-sm text-gray-500">Not enough data yet.</p>}</div></div>;
}

function Signal({ title, body }: { title: string; body: string }) {
  return <div className="rounded-xl border border-gray-800 bg-gray-950 p-5"><p className="font-bold text-gray-100">{title}</p><p className="mt-2 text-sm leading-6 text-gray-400">{body}</p></div>;
}
