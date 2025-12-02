import { Navigate, Outlet, useParams } from "react-router-dom";
import { useTenant } from "../context/TenantContext";

export default function TenantRoute() {
  const { tenant } = useTenant();
  const { tenantSlug } = useParams();
  const token = localStorage.getItem("token");

  // Si no hay tenant o no hay token, redirige a login
  if (!tenant || !token) {
    return <Navigate to={`/${tenantSlug}/auth/login`} />;
  }

  return <Outlet />;
}
