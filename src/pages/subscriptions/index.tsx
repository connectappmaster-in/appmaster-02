import { Outlet } from "react-router-dom";
import { SubscriptionsSidebar } from "@/components/Subscriptions/SubscriptionsSidebar";
import { BackButton } from "@/components/BackButton";

const Subscriptions = () => {
  return (
    <div className="min-h-screen flex w-full">
      <BackButton />
      <SubscriptionsSidebar />
      
      <main className="flex-1 min-h-screen flex flex-col bg-background">
        <div className="border-b px-4 py-2">
          <h1 className="text-lg font-semibold">IT Tools & Subscriptions</h1>
        </div>

        <div className="px-4 py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Subscriptions;
