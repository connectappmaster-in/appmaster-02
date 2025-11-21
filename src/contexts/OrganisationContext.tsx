import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Organisation {
  id: string;
  name: string;
  plan: string;
  active_tools: string[];
  logo_url: string | null;
  timezone: string;
  account_type: 'personal' | 'organization';
}

interface OrganisationContextType {
  organisation: Organisation | null;
  loading: boolean;
  refreshOrganisation: () => Promise<void>;
}

const OrganisationContext = createContext<OrganisationContextType | undefined>(undefined);

export const OrganisationProvider = ({ children }: { children: React.ReactNode }) => {
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrganisation = async () => {
    if (!user) {
      setOrganisation(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("organisations")
        .select("*")
        .single();

      if (error) throw error;
      
      setOrganisation({
        ...data,
        account_type: data.account_type as 'personal' | 'organization',
      });
    } catch (error) {
      console.error("Error fetching organisation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganisation();
  }, [user]);

  return (
    <OrganisationContext.Provider
      value={{ organisation, loading, refreshOrganisation: fetchOrganisation }}
    >
      {children}
    </OrganisationContext.Provider>
  );
};

export const useOrganisation = () => {
  const context = useContext(OrganisationContext);
  if (context === undefined) {
    throw new Error("useOrganisation must be used within an OrganisationProvider");
  }
  return context;
};
