import { useAuth } from "../../../../context/AuthContext";
import { useState } from "react";
import { AuthService } from "../../../auth/api/auth.service";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";
import { useNavigate } from "react-router-dom";

export function useAdminLogin() {
  const { login: authLogin } = useAuth();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await AuthService.adminLogin({ email, password });
      
      if (res.user.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized access. Only administrators allowed.');
      }
      
      authLogin(res.token, res.user);
      navigate('/admin/dashboard'); 
      return { ok: true, user: res.user };
    } catch (err) {
      const message = handleError(err, 'useAdminLogin');
      setError(message);
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
