import { createContext, useContext, useState } from "react";

// Tenant interface
interface Tenant {
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

// TenantContext interface
interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (t: Tenant) => void;
}

// TenantContext
const TenantContext = createContext<TenantContextType>({
  tenant: null,
  setTenant: () => { },
});

// TenantProvider
export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

// useTenant hook
export const useTenant = () => useContext(TenantContext);
