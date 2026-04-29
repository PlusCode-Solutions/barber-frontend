import { createContext, useContext, useEffect, useLayoutEffect, useState, useMemo } from "react";
import SplashScreen from "../components/SplashScreen";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  backgroundUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  address?: string | null;
  phone?: string | null;
}

interface TenantContextType {
  tenant: Tenant | null;
  isTenantLoading: boolean;
  setTenant: (t: Tenant) => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isTenantLoading: true,
  setTenant: () => { },
  clearTenant: () => { },
});

// ─────────────────────────────────────────────────
// PRIVATE UTILITIES
// ─────────────────────────────────────────────────

function extractSlugFromURL(): string | null {
  const path = window.location.pathname;
  if (path === "/" || path.startsWith("/admin") || path.startsWith("/super-admin")) {
    return null;
  }
  const segments = path.split("/").filter(Boolean);
  return segments.length > 0 ? segments[0] : null;
}

function hexToRgb(color: string): string {
  let hex = color.trim();
  if (hex.startsWith('#')) hex = hex.slice(1);

  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r} ${g} ${b}`;
  }

  const tempDiv = document.createElement('div');
  tempDiv.style.color = color;
  document.body.appendChild(tempDiv);
  const computed = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  const match = computed.match(/\d+/g);
  if (match && match.length >= 3) {
    return `${match[0]} ${match[1]} ${match[2]}`;
  }

  throw new Error('Invalid color format');
}

// ─────────────────────────────────────────────────
// MAIN PROVIDER
// ─────────────────────────────────────────────────

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [isTenantLoading, setIsTenantLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const slug = extractSlugFromURL();
    if (!slug) {
      setIsTenantLoading(false);
      return;
    }

    import("../features/tenants/api/tenants.service").then(({ TenantsService }) => {
      // Safety timeout: don't let the user stay in loading forever if API fails
      const safetyTimer = setTimeout(() => {
        setIsTenantLoading(false);
      }, 5000);

      TenantsService.getBySlug(slug)
        .then(latest => {
          clearTimeout(safetyTimer);
          if (latest) {
            setTenantState(latest);
          } else {
            // No tenant found, still need to show something
            setIsTenantLoading(false);
          }
        })
        .catch(err => {
          clearTimeout(safetyTimer);
          console.error("Failed to fetch tenant data:", err);
          setIsTenantLoading(false);
        });
    });
  }, []);

  const setTenant = (t: Tenant) => setTenantState(t);
  const clearTenant = () => setTenantState(null);

  useLayoutEffect(() => {
    if (!tenant) return;

    // Apply branding
    document.title = tenant.name;
    const root = document.documentElement;
    const colorToUse = tenant.primaryColor || tenant.secondaryColor;
    const secondaryToUse = tenant.secondaryColor;

    if (colorToUse) {
      try {
        const rgb = hexToRgb(colorToUse);
        root.style.setProperty('--primary-rgb', rgb);
        root.style.setProperty('--primary-color', colorToUse);
      } catch (e) { }
    }

    if (secondaryToUse) {
      try {
        const rgb = hexToRgb(secondaryToUse);
        root.style.setProperty('--secondary-rgb', rgb);
        root.style.setProperty('--secondary-color', secondaryToUse);
      } catch (e) { }
    }

    // 🚀 THE MAGIC: Start fading out, then unmount
    setIsFadingOut(true);
    const timer = setTimeout(() => {
      setIsTenantLoading(false);
    }, 700); // Matches the transition duration in SplashScreen.tsx

    return () => clearTimeout(timer);
  }, [tenant]);

  const contextValue = useMemo(() => ({
    tenant,
    isTenantLoading,
    setTenant,
    clearTenant
  }), [tenant, isTenantLoading]);

  return (
    <TenantContext.Provider value={contextValue}>
      {/* App is always rendered underneath to avoid layout jumps */}
      <div className="animate-fade-in">
        {children}
      </div>
      
      {/* Splash screen stays on top until unmounted after fade */}
      {isTenantLoading && (
        <SplashScreen isFadingOut={isFadingOut} />
      )}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
