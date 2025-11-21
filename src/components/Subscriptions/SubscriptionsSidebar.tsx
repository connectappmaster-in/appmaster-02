import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Users, Bell, Receipt, LogOut, Home, ChevronLeft } from "lucide-react";
import appmasterLogo from "@/assets/appmaster-logo.png";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NavLink } from "react-router-dom";

const navItems = [
  { title: "Dashboard", url: "/subscriptions", icon: LayoutDashboard },
  { title: "Tools", url: "/subscriptions/tools", icon: Package },
  { title: "Vendors", url: "/subscriptions/vendors", icon: Users },
  { title: "Licenses", url: "/subscriptions/licenses", icon: Bell },
  { title: "Payments", url: "/subscriptions/payments", icon: Receipt },
];

export const SubscriptionsSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const toggleSidebar = () => setCollapsed(!collapsed);

  const isActive = (path: string) => {
    if (path === "/subscriptions") {
      return currentPath === "/subscriptions";
    }
    return currentPath.startsWith(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div
      className="h-screen flex flex-col bg-background transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? "50px" : "180px",
        minWidth: collapsed ? "50px" : "180px",
        maxWidth: collapsed ? "50px" : "180px",
      }}
    >
      {/* Header - matches navbar height */}
      <div className="flex items-center justify-center border-b border-border px-2" style={{ height: "52px" }}>
        {!collapsed && <img src={appmasterLogo} alt="AppMaster Logo" className="h-8 w-auto transition-all duration-300" />}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = isActive(item.url);

            const menuButton = (
              <NavLink
                to={item.url}
                end={item.url === "/subscriptions"}
                className={`flex items-center h-9 rounded-lg relative transition-colors duration-200 font-medium text-sm ${
                  active
                    ? "text-primary bg-accent"
                    : "text-foreground hover:text-primary hover:bg-accent/50"
                }`}
              >
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4" />
                </div>
                <div
                  className={`transition-all duration-300 overflow-hidden whitespace-nowrap flex items-center gap-2 ${
                    collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  }`}
                >
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
              </NavLink>
            );

            if (collapsed) {
              return (
                <TooltipProvider key={item.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return <div key={item.title}>{menuButton}</div>;
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-2 space-y-1">
        {/* Homepage Button */}
        <div>
          {(() => {
            const homeButton = (
              <button
                onClick={() => navigate("/")}
                className="flex items-center h-9 w-full rounded-lg transition-colors font-medium text-sm text-foreground/70 hover:text-primary hover:bg-accent/50"
              >
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div
                  className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                    collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  }`}
                >
                  <span className="text-sm font-medium">Homepage</span>
                </div>
              </button>
            );

            if (collapsed) {
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>{homeButton}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>Homepage</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return homeButton;
          })()}
        </div>

        {/* Collapse Toggle */}
        <div>
          {(() => {
            const collapseButton = (
              <button
                onClick={toggleSidebar}
                className="flex items-center h-9 w-full rounded-lg transition-colors font-medium text-sm text-foreground/70 hover:text-primary hover:bg-accent/50"
              >
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <ChevronLeft
                    className={`w-4 h-4 transition-transform duration-300 ${
                      collapsed ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div
                  className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                    collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  }`}
                >
                  <span className="text-sm font-medium">Collapse</span>
                </div>
              </button>
            );

            if (collapsed) {
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>{collapseButton}</TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>Expand sidebar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return collapseButton;
          })()}
        </div>

        {/* Logout */}
        <div>
          {(() => {
            const logoutButton = (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center h-9 w-full rounded-lg transition-colors font-medium text-sm text-foreground/70 hover:text-primary hover:bg-accent/50">
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div
                      className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                        collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                      }`}
                    >
                      <span className="text-sm font-medium">Logout</span>
                    </div>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be redirected to the login page and will need to sign in again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            );

            if (collapsed) {
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="flex items-center h-10 w-full rounded-lg transition-colors font-medium text-foreground/70 hover:text-primary hover:bg-accent/50">
                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                              <LogOut className="w-5 h-5" />
                            </div>
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to logout?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You will be redirected to the login page and will need to sign in
                              again.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return logoutButton;
          })()}
        </div>
      </div>
    </div>
  );
};