import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ProfileCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export const ProfileCard = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  children,
}: ProfileCardProps) => {
  return (
    <Card className="border-border/50 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 mb-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              {icon && <div>{icon}</div>}
            </div>
            <CardDescription className="text-sm">{description}</CardDescription>
            {children && <div className="mt-3">{children}</div>}
            {actionLabel && (
              <Button variant="link" onClick={onAction} className="px-0 mt-2">
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
