import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}
export const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  onClick
}: StatsCardProps) => {
  return (
    <Card 
      className={`p-6 hover:shadow-lg transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </Card>
  );
};