import React from 'react';

interface BreakdownProps {
  base: number;
  stock: number;
  bonus: number;
  compact?: boolean;
}

export function CompBreakdownChart({ base, stock, bonus, compact = false }: BreakdownProps) {
  const total = base + stock + bonus;
  if (total === 0) return null;

  const basePct = (base / total) * 100;
  const stockPct = (stock / total) * 100;
  const bonusPct = (bonus / total) * 100;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full space-y-3">
      {!compact && (
        <div className="flex justify-between items-end text-sm">
          <div>
            <span className="text-gray-400">Total Compensation</span>
            <div className="text-2xl font-bold text-white">{formatCurrency(total)}</div>
          </div>
        </div>
      )}

      {/* Stacked Horizontal Bar */}
      <div className="h-6 w-full rounded-full overflow-hidden flex bg-gray-800 border border-gray-700">
        {base > 0 && (
          <div
            style={{ width: `${basePct}%` }}
            className="h-full bg-emerald-500 transition-all duration-500 hover:opacity-90"
            title={`Base: ${formatCurrency(base)} (${basePct.toFixed(1)}%)`}
          />
        )}
        {stock > 0 && (
          <div
            style={{ width: `${stockPct}%` }}
            className="h-full bg-indigo-500 transition-all duration-500 hover:opacity-90"
            title={`Stock: ${formatCurrency(stock)} (${stockPct.toFixed(1)}%)`}
          />
        )}
        {bonus > 0 && (
          <div
            style={{ width: `${bonusPct}%` }}
            className="h-full bg-pink-500 transition-all duration-500 hover:opacity-90"
            title={`Bonus: ${formatCurrency(bonus)} (${bonusPct.toFixed(1)}%)`}
          />
        )}
      </div>

      {/* Legends */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-gray-300 font-medium">Base:</span>
          <span className="text-gray-400 font-semibold">{formatCurrency(base)} ({basePct.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-indigo-500" />
          <span className="text-gray-300 font-medium">Stock:</span>
          <span className="text-gray-400 font-semibold">{formatCurrency(stock)} ({stockPct.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-pink-500" />
          <span className="text-gray-300 font-medium">Bonus:</span>
          <span className="text-gray-400 font-semibold">{formatCurrency(bonus)} ({bonusPct.toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  );
}

interface CompareItem {
  company: string;
  level: string;
  totalCompensation: number;
  base: number;
  stock: number;
  bonus: number;
}

interface CompareChartProps {
  items: CompareItem[];
}

export function CompCompareChart({ items }: CompareChartProps) {
  const maxComp = Math.max(...items.map((item) => item.totalCompensation), 1);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(val);
  };

  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Compensation Comparison</h3>
      
      <div className="space-y-6">
        {items.map((item, idx) => {
          const totalPct = (item.totalCompensation / maxComp) * 100;
          const basePct = (item.base / item.totalCompensation) * 100;
          const stockPct = (item.stock / item.totalCompensation) * 100;
          const bonusPct = (item.bonus / item.totalCompensation) * 100;

          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">
                  {item.company} <span className="text-emerald-400 font-normal">{item.level}</span>
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.totalCompensation)}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Horizontal Bar container mapped to relative maxComp */}
                <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden flex border border-gray-700/50" style={{ width: '100%' }}>
                  <div
                    style={{ width: `${totalPct}%` }}
                    className="h-full flex overflow-hidden rounded-lg"
                  >
                    {item.base > 0 && (
                      <div
                        style={{ width: `${basePct}%` }}
                        className="h-full bg-emerald-500 hover:opacity-90 transition-opacity"
                        title={`Base: ${formatCurrency(item.base)}`}
                      />
                    )}
                    {item.stock > 0 && (
                      <div
                        style={{ width: `${stockPct}%` }}
                        className="h-full bg-indigo-500 hover:opacity-90 transition-opacity"
                        title={`Stock: ${formatCurrency(item.stock)}`}
                      />
                    )}
                    {item.bonus > 0 && (
                      <div
                        style={{ width: `${bonusPct}%` }}
                        className="h-full bg-pink-500 hover:opacity-90 transition-opacity"
                        title={`Bonus: ${formatCurrency(item.bonus)}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center space-x-6 pt-2 border-t border-gray-800 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Base</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-indigo-500" />
          <span>Stock / Equity</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-pink-500" />
          <span>Bonus</span>
        </div>
      </div>
    </div>
  );
}
