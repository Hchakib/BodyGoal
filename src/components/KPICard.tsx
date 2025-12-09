import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
}

export function KPICard({ icon: Icon, label, value, subtitle, progress }: KPICardProps) {
  return (
    <div className="bg-[#151923] rounded-xl p-6 border border-[#151923]">
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-5 h-5 text-[#00D1FF]" />
        {progress !== undefined && (
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#151923"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#22C55E"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs">
              {progress}%
            </span>
          </div>
        )}
      </div>
      <p className="text-[#FFFFFF]/60 mb-2">{label}</p>
      <p className="text-3xl" style={{ fontWeight: 600 }}>{value}</p>
      {subtitle && <p className="text-[#FFFFFF]/60 mt-1">{subtitle}</p>}
    </div>
  );
}
