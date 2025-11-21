import { Outlet, useNavigate } from "react-router-dom";
import { SubscriptionsSidebar } from "@/components/Subscriptions/SubscriptionsSidebar";
import { BackButton } from "@/components/BackButton";
import { NotificationPanel } from "@/components/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Subscriptions = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex w-full">
      <BackButton />
      <SubscriptionsSidebar />
      
      <main className="flex-1 min-h-screen flex flex-col bg-background">
        <div className="border-b border-border px-4 flex items-center justify-between" style={{ height: "52px" }}>
          <h1 className="text-lg font-semibold">IT Tools & Subscriptions</h1>
          
          <div className="flex items-center gap-2">
            <NotificationPanel />

            {/* Profile Icon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground">User</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="px-4 py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Subscriptions;
