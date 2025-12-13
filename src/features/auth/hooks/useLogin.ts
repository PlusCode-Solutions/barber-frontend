import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { AuthService } from "../api/auth.service";
import { useErrorHandler } from "../../../hooks/useErrorHandler";

export function useLogin() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { login: authLogin } = useAuth();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    if (!tenant?.slug) {
      setError("Tenant no disponible");
      return { ok: false };
    }

    setLoading(true);
    setError(null);

    try {
      const res = await AuthService.login(tenant.slug, { email, password });
      
      // Ensure tenantSlug and tenantId are included in user data
      const userData = {
        ...res.user,
        tenantSlug: tenant.slug,
        tenantId: res.user.tenantId || tenant?.id
      };
      
      authLogin(res.token, userData);
      return { ok: true, user: userData };
    } catch (err) {
      const message = handleError(err, 'useLogin');
      setError(message);
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
