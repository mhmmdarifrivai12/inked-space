import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultContent, mergeContent, SiteContent } from "@/lib/defaultContent";

type Ctx = { content: SiteContent; loading: boolean; refresh: () => Promise<void> };
const SiteContentContext = createContext<Ctx>({ content: defaultContent, loading: false, refresh: async () => {} });

export const SiteContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase.from("site_settings").select("data").eq("id", "main").maybeSingle();
    setContent(mergeContent(data?.data));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <SiteContentContext.Provider value={{ content, loading, refresh: fetchData }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
