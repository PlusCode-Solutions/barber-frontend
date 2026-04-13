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
// UTILIDADES PRIVADAS
// ─────────────────────────────────────────────────

/**
 * Extrae el slug del tenant desde la URL actual.
 * Soporta rutas como: /{slug}, /{slug}/auth/login, /{slug}/dashboard, etc.
 * Devuelve null si estamos en rutas del sistema (/admin, /super-admin).
 */
function extractSlugFromURL(): string | null {
  const path = window.location.pathname;
  // Ignorar rutas del sistema
  if (path === "/" || path.startsWith("/admin") || path.startsWith("/super-admin")) {
    return null;
  }
  // El slug es siempre el primer segmento después de "/"
  const segments = path.split("/").filter(Boolean);
  return segments.length > 0 ? segments[0] : null;
}

/**
 * Genera una clave única de localStorage por slug.
 * Esto permite que cada negocio tenga su propia caché independiente.
 */
function getStorageKey(slug: string): string {
  return `tenantData_${slug}`;
}

/**
 * Convierte un color hex/named a formato RGB separado por espacios.
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

  // Fallback: dejar que el browser compute el color
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
// PROVIDER PRINCIPAL
// ─────────────────────────────────────────────────

export function TenantProvider({ children }: { children: React.ReactNode }) {

  // 1. INICIALIZACIÓN INTELIGENTE: Lee del slug en la URL + caché aislada por negocio
  const [tenant, setTenantState] = useState<Tenant | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const slug = extractSlugFromURL();
      if (!slug) {
        // Si no hay slug, intentar la caché genérica como fallback (para rutas de admin)
        const generic = localStorage.getItem("tenantData");
        return generic ? JSON.parse(generic) : null;
      }
      // Buscar la caché específica de este negocio
      const saved = localStorage.getItem(getStorageKey(slug));
      if (saved) return JSON.parse(saved);
      // Fallback a la caché genérica si existe y coincide el slug
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

  // 2. AUTO-FETCH INTELIGENTE: Si no hay datos en caché O los datos son de otro slug, pide al API
  useEffect(() => {
    const slug = extractSlugFromURL();
    if (!slug) return; // No estamos en un tenant

    // Si ya tenemos datos y son del mismo slug, solo refrescamos silenciosamente
    const shouldFreshFetch = !tenant || tenant.slug !== slug;

    import("../features/tenants/api/tenants.service").then(({ TenantsService }) => {
      TenantsService.getBySlug(slug)
        .then(latest => {
          if (shouldFreshFetch) {
            // Primera carga: instalar datos del tenant correcto
            setTenantState(latest);
            localStorage.setItem(getStorageKey(slug), JSON.stringify(latest));
            localStorage.setItem("tenantData", JSON.stringify(latest)); // Compatibilidad
          } else if (
            // Refresh silencioso: solo actualizar si cambió algo relevante
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
  }, []); // Solo al montar

  // 3. SETTERS PÚBLICOS
  const setTenant = (t: Tenant) => {
    setTenantState(t);
    localStorage.setItem(getStorageKey(t.slug), JSON.stringify(t));
    localStorage.setItem("tenantData", JSON.stringify(t)); // Compatibilidad
  };

  const clearTenant = () => {
    if (tenant?.slug) {
      localStorage.removeItem(getStorageKey(tenant.slug));
    }
    setTenantState(null);
    localStorage.removeItem("tenantData");
  };

  // ─────────────────────────────────────────────────
  // 4. THEMING DINÁMICO + METADATOS PWA
  // ─────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!tenant) return;

    // ── 4.a Título del documento y de la app instalada ──
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

      // ── 4.c Manifest Dinámico por Slug (Android Install) ──
      // Cada slug genera un manifest con ID único, permitiendo instalar
      // múltiples negocios como apps independientes en el mismo teléfono
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
      // Limpiar el blob anterior para evitar fugas de memoria
      if (linkManifest.href && linkManifest.href.startsWith("blob:")) {
        URL.revokeObjectURL(linkManifest.href);
      }
      linkManifest.href = manifestURL;
    }

    // ── 4.d Variables CSS Dinámicas ──
    const root = document.documentElement;
    const colorToUse = tenant.primaryColor || tenant.secondaryColor;
    const secondaryToUse = tenant.secondaryColor;

    if (colorToUse) {
      try {
        const rgb = hexToRgb(colorToUse);
        root.style.setProperty('--primary-rgb', rgb);
        root.style.setProperty('--primary-color', colorToUse);

        // Barra de estado del celular
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

    // Cleanup: liberar blobs al desmontar
    return () => {
      const manifest = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
      if (manifest?.href?.startsWith("blob:")) {
        URL.revokeObjectURL(manifest.href);
      }
    };
  }, [tenant]); // Se ejecuta cada vez que cambia el tenant completo

  return (
    <TenantContext.Provider value={{ tenant, setTenant, clearTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
