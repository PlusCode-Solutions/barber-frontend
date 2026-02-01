import { useEffect } from 'react';
import { useTenant } from '../context/TenantContext';

/**
 * DynamicManifest Component
 * 
 * Generates a dynamic PWA manifest based on the current tenant.
 * This allows each barbershop to have its own app name (using slug) and logo
 * when users install the app on their devices.
 */
export default function DynamicManifest() {
    const { tenant } = useTenant();

    useEffect(() => {
        if (!tenant) return;

        // Generate dynamic manifest using tenant slug
        const manifest = {
            name: `${tenant.slug} - Sistema de Citas`,
            short_name: tenant.slug,
            description: `Agenda tu cita en ${tenant.name} de forma rápida y sencilla`,
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: tenant.primaryColor || "#2563eb",
            orientation: "portrait",
            scope: "/",
            icons: [
                {
                    src: tenant.logoUrl || "/fondo.jpg",
                    sizes: "192x192",
                    type: "image/png",
                    purpose: "any maskable"
                },
                {
                    src: tenant.logoUrl || "/fondo.jpg",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any maskable"
                }
            ],
            categories: ["business", "lifestyle"],
            lang: "es",
            dir: "ltr"
        };

        // Convert to blob and create URL
        const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
        const manifestURL = URL.createObjectURL(manifestBlob);

        // Update or create manifest link
        let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;

        if (!manifestLink) {
            manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            document.head.appendChild(manifestLink);
        }

        // Update href
        const oldHref = manifestLink.href;
        manifestLink.href = manifestURL;

        // Update meta tags for better PWA support
        updateMetaTags(tenant);

        // Cleanup old blob URL
        return () => {
            if (oldHref && oldHref.startsWith('blob:')) {
                URL.revokeObjectURL(oldHref);
            }
        };
    }, [tenant]);

    return null; // This component doesn't render anything
}

/**
 * Update meta tags for PWA and social media
 */
function updateMetaTags(tenant: { name: string; slug: string; logoUrl?: string | null; primaryColor?: string | null }) {
    // Update title using slug
    document.title = `${tenant.slug} - Sistema de Citas`;

    // Update or create meta tags
    const metaTags = [
        { name: 'application-name', content: tenant.slug },
        { name: 'apple-mobile-web-app-title', content: tenant.slug },
        { name: 'theme-color', content: tenant.primaryColor || '#2563eb' },
        { property: 'og:title', content: `${tenant.slug} - Sistema de Citas` },
        { property: 'og:site_name', content: tenant.slug },
        { property: 'og:image', content: tenant.logoUrl || '/fondo.jpg' },
        { property: 'twitter:title', content: `${tenant.slug} - Sistema de Citas` },
        { property: 'twitter:image', content: tenant.logoUrl || '/fondo.jpg' },
    ];

    metaTags.forEach(({ name, property, content }) => {
        const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;

        if (!meta) {
            meta = document.createElement('meta');
            if (name) meta.name = name;
            if (property) meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }

        meta.content = content;
    });

    // Update apple touch icon
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
    }
    appleIcon.href = tenant.logoUrl || '/fondo.jpg';
}
