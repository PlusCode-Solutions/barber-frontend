import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { Input } from "../../../components/ui/Input";

export default function LoginForm() {
  const { login, error, loading } = useLogin();
  const { tenant, setTenant } = useTenant();
  const primaryColor = tenant?.primaryColor || tenant?.secondaryColor || '#2563eb';
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.ok && result.user) {
      // Ensure tenant is persisted to localStorage (fixes visual flash on next page)
      if (tenant) {
        setTenant(tenant);
      }

      if (result.user.role === 'TENANT_ADMIN') {
        navigate(`/${tenant?.slug}/admin/dashboard`);
      } else if (result.user.role === 'SUPER_ADMIN') {
        navigate(`/admin/dashboard`); // Or appropriate super admin route
      } else {
        navigate(`/${tenant?.slug}/dashboard`);
      }
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <p className="bg-red-100 text-red-600 p-2 rounded">{error}</p>
      )}

      <Input
        label="Correo"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder={`usuario@${tenant?.slug || 'dominio'}.com`}
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="********"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white py-2 rounded disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
