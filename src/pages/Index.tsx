import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { ToolCard } from "@/components/Dashboard/ToolCard";
import { Users, Package, TrendingUp, CreditCard, BarChart3, Clock, Ticket, FileText, PackageSearch, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { organisation, loading: orgLoading } = useOrganisation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const { data: subscription } = useQuery({
    queryKey: ["subscription", organisation?.id],
    queryFn: async () => {
      if (!organisation) return null;
      const { data } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("organisation_id", organisation.id)
        .eq("status", "active")
        .single();
      return data;
    },
    enabled: !!organisation,
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", organisation?.id],
    queryFn: async () => {
      if (!organisation) return null;

      const [leads, tickets, inventory, users] = await Promise.all([
        supabase.from("crm_leads").select("id", { count: "exact", head: true }).eq("organisation_id", organisation.id),
        supabase.from("tickets").select("id", { count: "exact", head: true }).eq("organisation_id", organisation.id).eq("status", "open"),
        supabase.from("inventory_items").select("id", { count: "exact", head: true }).eq("organisation_id", organisation.id),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("organisation_id", organisation.id).eq("status", "active"),
      ]);

      return {
        leads: leads.count || 0,
        tickets: tickets.count || 0,
        inventory: inventory.count || 0,
        users: users.count || 0,
      };
    },
    enabled: !!organisation,
  });

  const handleActivateTool = async (toolKey: string) => {
    if (!organisation) return;

    const canActivate = await supabase.rpc("can_activate_tool", {
      org_id: organisation.id,
    });

    if (!canActivate.data) {
      toast({
        title: "Upgrade Required",
        description: "You've reached your tool limit. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("organisations")
      .update({
        active_tools: [...(organisation.active_tools || []), toolKey],
      })
      .eq("id", organisation.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to activate tool.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Tool activated successfully!",
      });
      window.location.reload();
    }
  };

  const tools = [
    { key: "crm", name: "CRM", icon: BarChart3, path: "/crm", color: "from-indigo-500 to-purple-500" },
    { key: "inventory", name: "Inventory", icon: PackageSearch, path: "/inventory", color: "from-orange-500 to-red-500" },
    { key: "invoicing", name: "Invoicing", icon: FileText, path: "/invoicing", color: "from-blue-500 to-cyan-500" },
    { key: "hr", name: "HR", icon: Users, path: "/attendance", color: "from-purple-500 to-pink-500" },
    { key: "tickets", name: "Tickets", icon: Ticket, path: "/tickets", color: "from-cyan-500 to-blue-500" },
    { key: "assets", name: "Assets", icon: Package, path: "/assets", color: "from-emerald-500 to-teal-500" },
  ];

  const maxTools = subscription?.subscription_plans?.max_tools || 1;
  const activeTools = organisation?.active_tools || [];

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's an overview of your business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatsCard title="Active Users" value={stats?.users || 0} icon={Users} color="from-blue-500 to-cyan-500" />
          <StatsCard title="CRM Leads" value={stats?.leads || 0} icon={TrendingUp} color="from-purple-500 to-pink-500" />
          <StatsCard title="Open Tickets" value={stats?.tickets || 0} icon={Ticket} color="from-orange-500 to-red-500" />
          <StatsCard title="Inventory Items" value={stats?.inventory || 0} icon={Package} color="from-emerald-500 to-teal-500" />
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-3">Your Tools</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Using {activeTools.length} of {maxTools === -1 ? "unlimited" : maxTools} tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const isActive = activeTools.includes(tool.key);
            const isLocked = !isActive && activeTools.length >= maxTools && maxTools !== -1;

            return (
              <ToolCard
                key={tool.key}
                name={tool.name}
                icon={tool.icon}
                path={tool.path}
                color={tool.color}
                isActive={isActive}
                isLocked={isLocked}
                onActivate={() => handleActivateTool(tool.key)}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Index;