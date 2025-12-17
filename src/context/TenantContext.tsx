import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
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
  // 1. Initialize directly from localStorage to prevent "Blue Flash" (FOUC)
  // This ensures the first paint already has the correct color if data exists.
  const [tenant, setTenantState] = useState<Tenant | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem("tenantData");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Auto-refresh from API to keep data in sync (silent update)
  useEffect(() => {
    if (tenant?.slug) {
      import("../features/tenants/api/tenants.service").then(({ TenantsService }) => {
        TenantsService.getBySlug(tenant.slug)
          .then(latest => {
            // Only update if relevant data changed to avoid re-renders
            if (
              latest.primaryColor !== tenant.primaryColor ||
              latest.secondaryColor !== tenant.secondaryColor ||
              latest.name !== tenant.name ||
              latest.logoUrl !== tenant.logoUrl
            ) {
              console.log("Tenant data updated from server", latest);
              setTenantState(latest);
              localStorage.setItem("tenantData", JSON.stringify(latest));
            }
          })
          .catch(err => console.error("Failed to refresh tenant data", err));
      });
    }
  }, []); // Empty dependency array is fine as we only want this check on mount

  // NOTE: We don't need the old useEffect that purely loaded from localStorage anymore,
  // because we did it in the useState initializer.

  // Guarda automáticamente cuando cambia
  const setTenant = (t: Tenant) => {
    setTenantState(t);
    localStorage.setItem("tenantData", JSON.stringify(t));
  };

  const clearTenant = () => {
    setTenantState(null);
    localStorage.removeItem("tenantData");
  };

  // DYNAMIC THEMING: Inject CSS variables
  useLayoutEffect(() => {
    const root = document.documentElement;

    const hexToRgb = (color: string) => {
      // 1. Try standard hex parse
      let hex = color.trim();
      if (hex.startsWith('#')) hex = hex.slice(1);

      if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r} ${g} ${b}`;
      }

      // 2. Fallback for named colors (e.g., "red", "blue") or short hex
      // We use a temporary element to let the browser compute the computed RGB
      const tempDiv = document.createElement('div');
      tempDiv.style.color = color;
      document.body.appendChild(tempDiv);
      const computed = window.getComputedStyle(tempDiv).color; // returns "rgb(r, g, b)"
      document.body.removeChild(tempDiv);

      const match = computed.match(/\d+/g);
      if (match && match.length >= 3) {
        return `${match[0]} ${match[1]} ${match[2]}`;
      }

      throw new Error('Invalid color format');
    };

    const colorToUse = tenant?.primaryColor || tenant?.secondaryColor;
    const secondaryToUse = tenant?.secondaryColor;

    if (colorToUse) {
      // Fallback for valid hex check could be added here
      try {
        const rgb = hexToRgb(colorToUse);
        root.style.setProperty('--primary-rgb', rgb);
        // Also keep hex for reference if needed, but Tailwind will use RGB
        root.style.setProperty('--primary-color', colorToUse);
      } catch (e) {
        console.warn("Invalid primary color format", colorToUse);
        root.style.removeProperty('--primary-rgb');
        root.style.removeProperty('--primary-color');
      }
    } else {
      // Default fallback (remove, so Tailwind uses its internal fallback)
      root.style.removeProperty('--primary-rgb');
      root.style.removeProperty('--primary-color');
    }

    if (secondaryToUse) {
      try {
        const rgb = hexToRgb(secondaryToUse);
        root.style.setProperty('--secondary-rgb', rgb);
        root.style.setProperty('--secondary-color', secondaryToUse);
      } catch (e) {
        console.warn("Invalid secondary color format", secondaryToUse);
        root.style.removeProperty('--secondary-rgb');
        root.style.removeProperty('--secondary-color');
      }
    } else {
      root.style.removeProperty('--secondary-rgb');
      root.style.removeProperty('--secondary-color');
    }
  }, [tenant?.primaryColor, tenant?.secondaryColor]);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, clearTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
