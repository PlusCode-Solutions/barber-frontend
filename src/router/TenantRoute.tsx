import { Navigate, Outlet, useParams } from "react-router-dom";
import { useTenant } from "../context/TenantContext";

export default function TenantRoute() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams();

  // Si no hay tenant, redirige a login
  if (!tenant) {
    return <Navigate to={`/${tenantSlug}`} />;
  }

  return <Outlet />;
}
