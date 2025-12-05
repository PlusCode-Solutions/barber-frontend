import { useAuth } from "../../../context/AuthContext";
import { useTenant } from "../../../context/TenantContext";
import { useState } from "react";
import { loginApi } from "../api/auth.api";
import { isAxiosError } from "axios";

export function useLogin() {
  const { login: contextLogin } = useAuth();
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    if (!tenant) {
      setError("No se pudo identificar la barbería.");
      return { ok: false };
    }

    try {
      setLoading(true);
      setError(null);

      const res = await loginApi(tenant.slug, email, password);

      // Use logic from context to update state and storage uniformly
      contextLogin(res.data.access_token, res.data.user);

      // We still store tenant slug if needed by other parts, but token/user is handled by context
      localStorage.setItem("tenant", tenant.slug);

      return { ok: true, user: res.data.user };
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message || "Error al iniciar sesión"
        : "Error al iniciar sesión";

      setError(message);
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
