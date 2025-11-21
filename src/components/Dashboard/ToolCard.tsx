import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ToolCardProps {
  name: string;
  icon: LucideIcon;
  path: string;
  color: string;
  isActive: boolean;
  isLocked: boolean;
  onActivate?: () => void;
}

export const ToolCard = ({
  name,
  icon: Icon,
  path,
  color,
  isActive,
  isLocked,
  onActivate,
}: ToolCardProps) => {
  if (isLocked) {
    return (
      <Card className="relative p-6 hover:shadow-lg transition-all group cursor-not-allowed opacity-60">
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
        <Badge variant="secondary">Upgrade to unlock</Badge>
      </Card>
    );
  }

  if (!isActive) {
    return (
      <Card className="relative p-6 hover:shadow-lg transition-all group">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
        <Button onClick={onActivate} size="sm" variant="outline" className="w-full">
          Activate Tool
        </Button>
      </Card>
    );
  }

  return (
    <Link to={path} className="group">
      <Card className="relative p-6 overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="relative">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{name}</h3>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
            Click to open
            <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </p>
        </div>
      </Card>
    </Link>
  );
};
