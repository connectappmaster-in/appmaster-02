import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { ToolCard } from "@/components/Dashboard/ToolCard";
import { 
  Users, Package, TrendingUp, 
  Calendar, FileText, Briefcase,
  Ticket,
  Megaphone
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const OrgEditorDashboard = () => {
  const { user, accountType, userRole, loading } = useAuth();
  const { organisation } = useOrganisation();

  // Fetch user's assigned tools
  const { data: userAssignedTools = [], isLoading: isLoadingTools } = useQuery({
    queryKey: ["user-assigned-tools", user?.id, organisation?.id],
    queryFn: async () => {
      if (!user?.id || !organisation?.id) return [];
      
      // Get the user's internal ID
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();
      
      if (!userData) return [];
      
      // Get user's assigned tools with tool details
      const { data: userTools, error } = await supabase
        .from("user_tools")
        .select(`
          tool_id,
          tool:tools!inner (
            id,
            key,
            name,
            description,
            active
          )
        `)
        .eq("user_id", userData.id)
        .eq("tool.active", true);  // Only get active tools
      
      if (error) {
        console.error("Error fetching user tools:", error);
        return [];
      }
      
      return userTools?.map(ut => ut.tool).filter(Boolean) || [];
    },
    enabled: !!user && !!organisation?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ["org-editor-stats", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return { leads: 0, contacts: 0, inventory: 0 };
      
      const [leadsCount, contactsCount, inventoryCount] = await Promise.all([
        supabase.from("crm_leads").select("*", { count: "exact", head: true }).eq("organisation_id", organisation.id),
        supabase.from("crm_contacts").select("*", { count: "exact", head: true }).eq("organisation_id", organisation.id),
        supabase.from("inventory_items").select("*", { count: "exact", head: true }).eq("organisation_id", organisation.id),
      ]);

      return {
        leads: leadsCount.count || 0,
        contacts: contactsCount.count || 0,
        inventory: inventoryCount.count || 0,
      };
    },
    enabled: !!user && !!organisation?.id,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = userRole?.toLowerCase();
  if (accountType !== "organization" || (role !== "manager" && role !== "editor" && role !== "employee")) {
    return <Navigate to="/dashboard" replace />;
  }

  const activeTools = organisation?.active_tools || [];
  
  // Map tool keys to their icons and paths
  const toolIconMap: Record<string, { icon: any; path: string; color: string }> = {
    crm: { icon: Users, path: "/crm", color: "text-blue-500" },
    inventory: { icon: Package, path: "/inventory", color: "text-green-500" },
    invoicing: { icon: FileText, path: "/invoicing", color: "text-yellow-500" },
    assets: { icon: Briefcase, path: "/assets", color: "text-indigo-500" },
    attendance: { icon: Calendar, path: "/attendance", color: "text-purple-500" },
    subscriptions: { icon: TrendingUp, path: "/subscriptions", color: "text-pink-500" },
    tickets: { icon: Ticket, path: "/tickets", color: "text-red-500" },
    marketing: { icon: Megaphone, path: "/marketing", color: "text-orange-500" },
    recruitment: { icon: Users, path: "/recruitment", color: "text-cyan-500" },
  };
  
  // Filter tools: show only tools that are BOTH active in org AND assigned to user
  const availableTools = userAssignedTools
    .filter(tool => activeTools.includes(tool.key))
    .map(tool => ({
      key: tool.key,
      name: tool.name,
      icon: toolIconMap[tool.key]?.icon || Package,
      path: toolIconMap[tool.key]?.path || `/${tool.key}`,
      color: toolIconMap[tool.key]?.color || "text-gray-500",
    }));

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{organisation?.name}</h1>
          <p className="text-sm text-muted-foreground">
            {role === 'employee' ? 'Employee Dashboard - Your Daily Tools' : 'Editor Dashboard - Operational Tools'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Leads"
            value={stats?.leads || 0}
            icon={Users}
            color="from-blue-500 to-blue-600"
            onClick={() => window.location.href = '/crm/leads'}
          />
          <StatsCard
            title="Total Contacts"
            value={stats?.contacts || 0}
            icon={Users}
            color="from-orange-500 to-orange-600"
            onClick={() => window.location.href = '/crm/customers'}
          />
          <StatsCard
            title="Inventory Items"
            value={stats?.inventory || 0}
            icon={Package}
            color="from-green-500 to-green-600"
            onClick={() => window.location.href = '/inventory'}
          />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {role === 'employee' ? 'Available Tools' : 'Your Tools'}
          </h2>
          {isLoadingTools ? (
            <div className="text-center py-8 text-muted-foreground">Loading tools...</div>
          ) : availableTools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tools assigned yet. Contact your admin to get access to tools.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableTools.map((tool) => (
                <ToolCard
                  key={tool.key}
                  name={tool.name}
                  icon={tool.icon}
                  path={tool.path}
                  color={tool.color}
                  isActive={true}
                  isLocked={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgEditorDashboard;
