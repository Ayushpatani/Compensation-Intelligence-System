import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
}

export function StatsCard({ title, value, icon: Icon, subtitle }: StatsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-50">{value}</p>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      {subtitle && (
        <div className="mt-4 flex items-center text-sm text-gray-400">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
