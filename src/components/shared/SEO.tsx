import { Helmet } from 'react-helmet-async';
import { useTenant } from '../../context/TenantContext';

interface SEOProps {
    title: string;
    description?: string;
    name?: string;
    type?: string;
}

export default function SEO({ title, description, name, type = 'website' }: SEOProps) {
    const { tenant } = useTenant();

    const siteName = tenant?.name || 'Barbería App';
    const finalTitle = `${title} | ${siteName}`;
    const finalDescription = description || `Reserva tu cita en ${siteName}. Los mejores cortes y servicios de barbería.`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{finalTitle}</title>
            <meta name='description' content={finalDescription} />

            {/* Open Graph tags (Facebook, LinkedIn, etc) */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name || siteName} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
        </Helmet>
    );
}
