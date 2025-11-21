import { Home, User, Shield, CreditCard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";

const navigationItems = [
  { title: "Home", icon: Home, path: "/profile" },
  { title: "Personal info", icon: User, path: "/profile/personal-info" },
  { title: "Security", icon: Shield, path: "/profile/security" },
  { title: "Payments", icon: CreditCard, path: "/profile/payments", adminOnly: true },
];

export const ProfileSidebar = () => {
  const { isAdmin, accountType } = useRole();
  
  // Filter navigation items - hide admin-only items for non-admins in organization accounts
  const visibleItems = navigationItems.filter(item => {
    if (!item.adminOnly) return true;
    if (accountType === 'personal') return true; // Personal accounts see all
    return isAdmin(); // Only admins in organizations see payments
  });

  return (
    <aside className="w-56 bg-background min-h-screen">
      <nav className="space-y-1 px-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/profile"}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              "hover:bg-muted/50"
            )}
            activeClassName="bg-primary/10 text-primary"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
