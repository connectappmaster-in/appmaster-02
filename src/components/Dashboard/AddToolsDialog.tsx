import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, Ticket, TrendingUp, 
  Calendar, FileText, Briefcase, LucideIcon, Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

interface Tool {
  key: string;
  name: string;
  icon: LucideIcon;
  path: string;
  color: string;
  description: string;
}

const TOOL_ICONS: Record<string, LucideIcon> = {
  assets: Briefcase,
  attendance: Calendar,
  crm: Users,
  invoicing: FileText,
  tickets: Ticket,
  subscriptions: TrendingUp,
  inventory: Package,
  marketing: TrendingUp,
  recruitment: Users,
};

interface AddToolsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTools: string[];
  onToolsUpdated: (tools: string[]) => void;
}

export const AddToolsDialog = ({ open, onOpenChange, selectedTools, onToolsUpdated }: AddToolsDialogProps) => {
  const [tempSelectedTools, setTempSelectedTools] = useState<string[]>(selectedTools);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch active tools from database
  const { data: availableTools = [], isLoading } = useQuery({
    queryKey: ["active-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Sync tempSelectedTools with selectedTools prop when dialog opens
  useEffect(() => {
    if (open) {
      setTempSelectedTools(selectedTools);
    }
  }, [open, selectedTools]);

  const handleToggleTool = (toolKey: string) => {
    setTempSelectedTools(prev => 
      prev.includes(toolKey) 
        ? prev.filter(k => k !== toolKey)
        : [...prev, toolKey]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ selected_tools: tempSelectedTools } as any)
        .eq('id', user.id);

      if (error) throw error;

      onToolsUpdated(tempSelectedTools);
      toast({
        title: "Tools updated",
        description: "Your tool selection has been saved successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving tools:', error);
      toast({
        title: "Error",
        description: "Failed to save your tool selection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Tools to Your Dashboard</DialogTitle>
          <DialogDescription>
            Select the tools you want to see on your personal dashboard
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading tools...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTools.map((tool) => {
                const Icon = TOOL_ICONS[tool.key] || Package;
                const isSelected = tempSelectedTools.includes(tool.key);
                const colorClasses = `hsl(var(--primary))`;
                
                return (
                  <div
                    key={tool.key}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => handleToggleTool(tool.key)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleTool(tool.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="font-semibold">{tool.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description || 'No description available'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Tools"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};