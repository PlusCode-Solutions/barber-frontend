import { useParams } from "react-router-dom";
import { TenantProvider } from "../context/TenantContext";
import React from "react";

export default function TenantRoute({ children }: { children: React.ReactNode }) {
  const { tenant: tenantSlug } = useParams();

  if (!tenantSlug) {
    return <div>Tenant no encontrado</div>;
  }

  return (
    <TenantProvider>
      {children}
    </TenantProvider>
  );
}
