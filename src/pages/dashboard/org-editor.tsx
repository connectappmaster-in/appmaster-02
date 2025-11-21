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
        .eq("tools.active", true);  // Use table name 'tools', not alias 'tool'
      
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
      if (!organisation?.id) return { leads: 0, contacts: 0 };
      
      const [leadsCount, contactsCount] = await Promise.all([
        supabase.from("crm_leads").select("*", { count: "exact", head: true }).eq("organisation_id", organisation.id),
        supabase.from("crm_contacts").select("*", { count: "exact", head: true }).eq("organisation_id", organisation.id),
      ]);

      return {
        leads: leadsCount.count || 0,
        contacts: contactsCount.count || 0,
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
    invoicing: { icon: FileText, path: "/invoicing", color: "text-yellow-500" },
    assets: { icon: Briefcase, path: "/assets", color: "text-indigo-500" },
    attendance: { icon: Calendar, path: "/attendance", color: "text-purple-500" },
    subscriptions: { icon: TrendingUp, path: "/subscriptions", color: "text-pink-500" },
    it_help_desk: { icon: Ticket, path: "/it-help-desk", color: "text-red-500" },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <DashboardHeader />
      
      <div className="container mx-auto px-6 py-8 space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
            {organisation?.name}
          </h1>
          <p className="text-base text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {role === 'employee' ? '👋 Welcome back! Here are your daily tools' : '📊 Operational Dashboard'}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <StatsCard
              title="Total Leads"
              value={stats?.leads || 0}
              icon={TrendingUp}
              color="from-blue-500 via-cyan-500 to-blue-600"
              onClick={() => window.location.href = '/crm/leads'}
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <StatsCard
              title="Total Contacts"
              value={stats?.contacts || 0}
              icon={Users}
              color="from-orange-500 via-pink-500 to-orange-600"
              onClick={() => window.location.href = '/crm/customers'}
            />
          </div>
        </div>

        {/* Tools Section */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {role === 'employee' ? 'Your Tools' : 'Available Tools'}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                {availableTools.length > 0 
                  ? `${availableTools.length} tool${availableTools.length !== 1 ? 's' : ''} available`
                  : 'No tools assigned yet'}
              </p>
            </div>
          </div>

          {isLoadingTools ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading your tools...</p>
              </div>
            </div>
          ) : availableTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Tools Assigned</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Contact your organization admin to get access to tools and start working.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTools.map((tool, index) => (
                <div 
                  key={tool.key} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <ToolCard
                    name={tool.name}
                    icon={tool.icon}
                    path={tool.path}
                    color={tool.color}
                    isActive={true}
                    isLocked={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgEditorDashboard;
