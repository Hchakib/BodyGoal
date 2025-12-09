import { TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const mockSparklineData = [
  { value: 115 },
  { value: 120 },
  { value: 118 },
  { value: 125 },
  { value: 122 },
  { value: 130 },
  { value: 135 },
];

export function HeroPRCard() {
  return (
    <div className="bg-[#151923] rounded-xl p-8 border border-[#151923]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#22C55E]" />
            <span className="text-[#FFFFFF]/60">Current PR</span>
          </div>
          <h2 className="mb-2">Bench Press</h2>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-5xl text-[#22C55E]" style={{ fontWeight: 600 }}>135</span>
            <span className="text-2xl text-[#FFFFFF]/60">kg</span>
          </div>
          <p className="text-[#FFFFFF]/60">Set on October 18, 2025</p>
        </div>
        <div className="w-32 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockSparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22C55E"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
