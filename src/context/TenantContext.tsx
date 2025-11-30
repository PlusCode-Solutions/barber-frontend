import { createContext, useContext, useEffect, useState } from "react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (t: Tenant) => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  setTenant: () => { },
  clearTenant: () => { },
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);

  // Restaura tenant desde localStorage al cargar la app
  useEffect(() => {
    const saved = localStorage.getItem("tenantData");
    if (saved) {
      try {
        setTenantState(JSON.parse(saved));
      } catch { }
    }
  }, []);

  // Guarda automáticamente cuando cambia
  const setTenant = (t: Tenant) => {
    setTenantState(t);
    localStorage.setItem("tenantData", JSON.stringify(t));
  };

  const clearTenant = () => {
    setTenantState(null);
    localStorage.removeItem("tenantData");
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant, clearTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
