import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Users, Bell, Receipt, LogOut, Home, User, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { title: "Dashboard", url: "/subscriptions", icon: LayoutDashboard },
  { title: "Tools", url: "/subscriptions/tools", icon: Package },
  { title: "Vendors", url: "/subscriptions/vendors", icon: Users },
  { title: "Licenses", url: "/subscriptions/licenses", icon: Bell },
  { title: "Payments", url: "/subscriptions/payments", icon: Receipt },
];

export const SubscriptionsSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setCollapsed(!collapsed);

  const isActive = (path: string) => {
    if (path === "/subscriptions") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <TooltipProvider>
      <div
        className={`${
          collapsed ? "w-16" : "w-64"
        } min-h-screen bg-card border-r transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            {!collapsed && (
              <>
                <Package className="w-6 h-6 text-primary" />
                <span className="font-semibold text-lg">IT Subscriptions</span>
              </>
            )}
            {collapsed && <Package className="w-6 h-6 text-primary mx-auto" />}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.url);
            
            const navButton = (
              <button
                onClick={() => navigate(item.url)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.url}>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.url}>{navButton}</div>;
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-2 border-t space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">Homepage</span>}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Homepage</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">Profile</span>}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">User Profile</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSidebar}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {collapsed ? (
                  <ChevronRight className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <>
                    <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Collapse</span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Expand Sidebar</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowLogoutDialog(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">Logout</span>}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </div>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};
