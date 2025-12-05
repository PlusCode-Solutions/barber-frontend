import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { Input } from "../../../components/ui/Input";

export default function LoginForm() {
  const { login, error, loading } = useLogin();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.ok) navigate(`/${tenant?.slug}/dashboard`);
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
        placeholder={`usuario@${tenant?.slug}.com`}
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
        className="w-full bg-indigo-600 text-white py-2 rounded disabled:bg-indigo-300"
      >
        {loading ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
