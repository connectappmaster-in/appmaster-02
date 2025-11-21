import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface ToolAccessGuardProps {
  toolKey: string;
  children: React.ReactNode;
}

export const ToolAccessGuard = ({ toolKey, children }: ToolAccessGuardProps) => {
  const { user, accountType } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToolInactive, setIsToolInactive] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [user, toolKey, accountType]);

  const checkAccess = async () => {
    if (!user) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      // Check if user is Super Admin
      const { data: superAdminData } = await supabase
        .from('appmaster_admins')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const isSuperAdminUser = !!superAdminData;
      setIsSuperAdmin(isSuperAdminUser);

      // Check if tool is active
      const { data: toolData, error: toolError } = await supabase
        .from('tools')
        .select('active')
        .eq('key', toolKey)
        .maybeSingle();

      if (toolError) {
        console.error("Error checking tool status:", toolError);
      }

      // Super Admin can access any tool regardless of status
      if (isSuperAdminUser) {
        setHasAccess(true);
        setIsToolInactive(!toolData?.active);
        setIsLoading(false);
        return;
      }

      // Check if tool is active - block access if inactive
      if (!toolData?.active) {
        setHasAccess(false);
        setIsToolInactive(true);
        setIsLoading(false);
        return;
      }

      // Individual users have full access to active tools
      if (accountType === 'personal') {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // Check if user has the tool assigned
      const { data, error } = await supabase.rpc('user_has_tool_access', {
        user_auth_id: user.id,
        tool_key: toolKey,
      });

      if (error) {
        console.error("Error checking tool access:", error);
        setHasAccess(false);
      } else {
        setHasAccess(data);
      }
    } catch (error) {
      console.error("Error in checkAccess:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-8 text-center space-y-4">
          <div className={`mx-auto w-16 h-16 ${isToolInactive ? 'bg-warning/10' : 'bg-destructive/10'} rounded-full flex items-center justify-center`}>
            {isToolInactive ? (
              <AlertTriangle className="w-8 h-8 text-warning" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-destructive" />
            )}
          </div>
          <h2 className="text-2xl font-bold">
            {isToolInactive ? 'Tool Unavailable' : 'Access Denied'}
          </h2>
          <p className="text-muted-foreground">
            {isToolInactive 
              ? 'This tool is currently unavailable. Contact your admin for more information.'
              : "You don't have access to this tool. Contact your Organization Admin to request access."}
          </p>
          <div className="flex gap-2 justify-center pt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isSuperAdmin && isToolInactive && (
        <div className="bg-warning/10 border-warning border px-4 py-2 text-sm text-warning-foreground">
          <strong>Super Admin Notice:</strong> This tool is currently inactive. Regular users cannot access it.
        </div>
      )}
      {children}
    </>
  );
};
