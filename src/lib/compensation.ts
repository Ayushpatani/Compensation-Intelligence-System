export type SalaryLike = {
  base: number;
  stock?: number;
  bonus?: number;
  totalCompensation: number;
  yearsOfExperience?: number;
};

export function currency(value: number, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function percentile(sortedValues: number[], p: number) {
  if (!sortedValues.length) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

export function compensationStats(entries: SalaryLike[]) {
  const values = entries
    .map((entry) => entry.totalCompensation)
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  const average = values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

  return {
    count: values.length,
    min: values[0] ?? 0,
    max: values[values.length - 1] ?? 0,
    average,
    p25: percentile(values, 0.25),
    median: percentile(values, 0.5),
    p75: percentile(values, 0.75),
    p90: percentile(values, 0.9),
  };
}

export function percentileRank(values: number[], target: number) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  const belowOrEqual = valid.filter((value) => value <= target).length;
  return Math.round((belowOrEqual / valid.length) * 100);
}

export function marketPosition(target: number, median: number) {
  if (!median) return { label: 'Insufficient data', deltaPercent: 0, tone: 'neutral' as const };
  const deltaPercent = ((target - median) / median) * 100;
  if (deltaPercent <= -12) return { label: 'Below market', deltaPercent, tone: 'low' as const };
  if (deltaPercent >= 12) return { label: 'Above market', deltaPercent, tone: 'high' as const };
  return { label: 'Market competitive', deltaPercent, tone: 'market' as const };
}

export function totalCompensation(base: number, bonus = 0, stock = 0, signingBonus = 0) {
  return [base, bonus, stock, signingBonus].reduce(
    (sum, value) => sum + (Number.isFinite(value) ? value : 0),
    0,
  );
}

export function offerScore(input: {
  total: number;
  marketMedian: number;
  marketP75: number;
  baseShare: number;
  hasEquity: boolean;
}) {
  const { total, marketMedian, marketP75, baseShare, hasEquity } = input;
  if (!marketMedian) return 50;

  const marketRatio = total / marketMedian;
  const upperRatio = marketP75 ? total / marketP75 : marketRatio;
  let score = 45;
  score += Math.max(-20, Math.min(30, (marketRatio - 1) * 75));
  score += Math.max(0, Math.min(10, (upperRatio - 0.9) * 40));
  if (baseShare >= 0.7) score += 7;
  if (hasEquity) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}
