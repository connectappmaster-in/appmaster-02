import { Outlet } from "react-router-dom";
import { SubscriptionsSidebar } from "@/components/Subscriptions/SubscriptionsSidebar";
import { BackButton } from "@/components/BackButton";
import { NotificationPanel } from "@/components/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Subscriptions = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex w-full">
      <BackButton />
      <SubscriptionsSidebar />
      
      <main className="flex-1 min-h-screen flex flex-col bg-background">
        <div className="border-b border-border px-4 flex items-center justify-between" style={{ height: "52px" }}>
          <h1 className="text-lg font-semibold">IT Tools & Subscriptions</h1>
          
          <div className="flex items-center gap-2">
            <NotificationPanel />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
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
