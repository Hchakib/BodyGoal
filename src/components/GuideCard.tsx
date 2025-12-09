import { LucideIcon } from 'lucide-react';

interface GuideCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export function GuideCard({ icon: Icon, title, description, onClick }: GuideCardProps) {
  return (
    <div onClick={onClick} className="bg-[#151923] rounded-lg p-6 border border-[#151923] hover:border-[#00D1FF]/30 transition-colors cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-[#00D1FF]" />
      </div>
      <h4 className="mb-2">{title}</h4>
      <p className="text-[#FFFFFF]/60">{description}</p>
    </div>
  );
}
