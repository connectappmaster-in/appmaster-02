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
    <Link to={path}>
      <Card className="relative p-6 hover:shadow-lg transition-all hover:scale-105 group cursor-pointer">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground">Click to open</p>
      </Card>
    </Link>
  );
};
