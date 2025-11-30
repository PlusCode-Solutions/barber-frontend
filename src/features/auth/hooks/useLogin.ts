import { useState } from "react";
import { isAxiosError } from "axios";
import { useTenant } from "../../../context/TenantContext";
import { loginApi } from "../api/auth.api";

export function useLogin() {
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

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("tenant", tenant.slug);

      return { ok: true };
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
