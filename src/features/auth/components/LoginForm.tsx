import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useNavigate, Link } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { Input } from "../../../components/ui/Input";

interface LoginFormProps {
  variant?: 'default' | 'glass';
}

export default function LoginForm({ variant = 'default' }: LoginFormProps) {
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
      if (tenant) {
        setTenant(tenant);
      }

      if (result.user.role === 'TENANT_ADMIN') {
        navigate(`/${tenant?.slug}/admin/dashboard`);
      } else if (result.user.role === 'SUPER_ADMIN') {
        navigate(`/admin/dashboard`);
      } else {
        navigate(`/${tenant?.slug}/dashboard`);
      }
    }
  };

  const isGlass = variant === 'glass';

  const inputClass = isGlass
    ? "!bg-white/10 !border-white/20 !text-white placeholder:!text-white/60 focus:!ring-white/30 focus:!border-white/50"
    : "";

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <p className={`p-2 rounded text-sm ${isGlass ? 'bg-red-500/20 text-red-100 border border-red-500/30' : 'bg-red-100 text-red-600'}`}>
          {error}
        </p>
      )}

      <div className="space-y-4">
        <Input
          label="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder={`usuario@${tenant?.slug || 'dominio'}.com`}
          containerClassName={isGlass ? "[&>label]:!text-white/90" : ""}
          className={inputClass}
        />

        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="********"
          containerClassName={isGlass ? "[&>label]:!text-white/90" : ""}
          className={inputClass}
        />

        <div className="flex justify-end">
          <Link
            to={`/${tenant?.slug}/auth/forgot-password`}
            className={`text-sm font-semibold hover:underline ${isGlass ? 'text-white/80 hover:text-white' : 'text-blue-600'}`}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${isGlass ? 'text-white' : 'text-white'}`}
        style={{
          backgroundColor: primaryColor
        }}
      >
        {loading ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form >
  );
}
