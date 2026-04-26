import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

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
  setTenant: (t: Tenant) => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  setTenant: () => { },
  clearTenant: () => { },
});

// ─────────────────────────────────────────────────
// PRIVATE UTILITIES
// ─────────────────────────────────────────────────

/**
 * Extracts the tenant slug from the current URL.
 * Supports paths like: /{slug}, /{slug}/auth/login, /{slug}/dashboard, etc.
 * Returns null if in system routes (/admin, /super-admin).
 */
function extractSlugFromURL(): string | null {
  const path = window.location.pathname;
  // Ignore system routes
  if (path === "/" || path.startsWith("/admin") || path.startsWith("/super-admin")) {
    return null;
  }
  // Slug is always the first segment after "/"
  const segments = path.split("/").filter(Boolean);
  return segments.length > 0 ? segments[0] : null;
}

/**
 * Generates a unique localStorage key per slug.
 * This allows each business to have its own independent cache.
 */
function getStorageKey(slug: string): string {
  return `tenantData_${slug}`;
}

/**
 * Converts a hex/named color to space-separated RGB format.
 */
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

  // Fallback: let the browser compute the color
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

  // 1. SMART INITIALIZATION: Read slug from URL + isolated business cache
  const [tenant, setTenantState] = useState<Tenant | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const slug = extractSlugFromURL();
      if (!slug) {
        // If no slug, try generic cache as fallback (for admin routes)
        const generic = localStorage.getItem("tenantData");
        return generic ? JSON.parse(generic) : null;
      }
      // Search for business-specific cache
      const saved = localStorage.getItem(getStorageKey(slug));
      if (saved) return JSON.parse(saved);
      // Fallback to generic cache if it exists and slug matches
      const generic = localStorage.getItem("tenantData");
      if (generic) {
        const parsed = JSON.parse(generic);
        if (parsed.slug === slug) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // 2. SMART AUTO-FETCH: If no cache data OR data is from another slug, fetch from API
  useEffect(() => {
    const slug = extractSlugFromURL();
    if (!slug) return; // Not in a tenant route

    // If we already have data and it's from the same slug, just refresh silently
    const shouldFreshFetch = !tenant || tenant.slug !== slug;

    import("../features/tenants/api/tenants.service").then(({ TenantsService }) => {
      TenantsService.getBySlug(slug)
        .then(latest => {
          if (shouldFreshFetch) {
            // First load: install correct tenant data
            setTenantState(latest);
            localStorage.setItem(getStorageKey(slug), JSON.stringify(latest));
            localStorage.setItem("tenantData", JSON.stringify(latest)); // Compatibility
          } else if (
            // Silent refresh: only update if something relevant changed
            latest.primaryColor !== tenant.primaryColor ||
            latest.secondaryColor !== tenant.secondaryColor ||
            latest.name !== tenant.name ||
            latest.logoUrl !== tenant.logoUrl ||
            latest.backgroundUrl !== tenant.backgroundUrl ||
            latest.description !== tenant.description ||
            latest.phone !== tenant.phone ||
            latest.address !== tenant.address
          ) {
            setTenantState(latest);
            localStorage.setItem(getStorageKey(slug), JSON.stringify(latest));
            localStorage.setItem("tenantData", JSON.stringify(latest));
          }
        })
        .catch(err => console.error("Failed to fetch tenant data for slug:", slug, err));
    });
  }, []); // Mount only

  // 3. PUBLIC SETTERS
  const setTenant = (t: Tenant) => {
    setTenantState(t);
    localStorage.setItem(getStorageKey(t.slug), JSON.stringify(t));
    localStorage.setItem("tenantData", JSON.stringify(t)); // Compatibility
  };

  const clearTenant = () => {
    if (tenant?.slug) {
      localStorage.removeItem(getStorageKey(tenant.slug));
    }
    setTenantState(null);
    localStorage.removeItem("tenantData");
  };

  // 4. DYNAMIC THEMING + PWA METADATA
// ─────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!tenant) return;

    // ── 4.a Document title and installed app name ──
    document.title = tenant.name;

    const appleTitle = document.querySelector("meta[name='apple-mobile-web-app-title']");
    if (appleTitle) appleTitle.setAttribute("content", tenant.name);

    // ── 4.b Favicon + Apple Touch Icon ──
    if (tenant.logoUrl) {
      // Favicon
      let linkIcon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!linkIcon) {
        linkIcon = document.createElement("link");
        linkIcon.rel = "icon";
        document.head.appendChild(linkIcon);
      }
      linkIcon.href = tenant.logoUrl;

      // Apple Touch Icon (iOS Add to Home Screen)
      let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!appleIcon) {
        appleIcon = document.createElement("link");
        appleIcon.rel = "apple-touch-icon";
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = tenant.logoUrl;

      // ── 4.c Dynamic Manifest per Slug (Android Install) ──
      // Each slug generates a manifest with a unique ID, allowing
      // installing multiple businesses as independent apps on the same phone
      const manifest = {
        name: tenant.name,
        short_name: tenant.name,
        description: tenant.description || `Reserva tu cita en ${tenant.name}`,
        start_url: `/${tenant.slug}/`,
        scope: `/${tenant.slug}/`,
        id: `/${tenant.slug}/`,
        display: "standalone" as const,
        orientation: "portrait" as const,
        background_color: "#ffffff",
        theme_color: tenant.primaryColor || "#000000",
        categories: ["business", "lifestyle"],
        icons: [
          {
            src: tenant.logoUrl,
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: tenant.logoUrl,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      };

      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestURL = URL.createObjectURL(blob);

      let linkManifest = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
      if (!linkManifest) {
        linkManifest = document.createElement("link");
        linkManifest.rel = "manifest";
        document.head.appendChild(linkManifest);
      }
      // Clean up previous blob to avoid memory leaks
      if (linkManifest.href && linkManifest.href.startsWith("blob:")) {
        URL.revokeObjectURL(linkManifest.href);
      }
      linkManifest.href = manifestURL;
    }

    // ── 4.d Dynamic CSS Variables ──
    const root = document.documentElement;
    const colorToUse = tenant.primaryColor || tenant.secondaryColor;
    const secondaryToUse = tenant.secondaryColor;

    if (colorToUse) {
      try {
        const rgb = hexToRgb(colorToUse);
        root.style.setProperty('--primary-rgb', rgb);
        root.style.setProperty('--primary-color', colorToUse);

        // Mobile status bar
        let themeMeta = document.querySelector("meta[name='theme-color']");
        if (!themeMeta) {
          themeMeta = document.createElement("meta");
          themeMeta.setAttribute("name", "theme-color");
          document.head.appendChild(themeMeta);
        }
        themeMeta.setAttribute("content", colorToUse);
      } catch (e) {
        console.warn("Invalid primary color format", colorToUse);
        root.style.removeProperty('--primary-rgb');
        root.style.removeProperty('--primary-color');
      }
    } else {
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

    // Cleanup: revoke blobs on unmount
    return () => {
      const manifest = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
      if (manifest?.href?.startsWith("blob:")) {
        URL.revokeObjectURL(manifest.href);
      }
    };
  }, [tenant]); // Executes every time the full tenant object changes

  return (
    <TenantContext.Provider value={{ tenant, setTenant, clearTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
