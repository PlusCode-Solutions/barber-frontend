import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm({ onSubmit, loading }: {
    onSubmit: (data: any) => void;
    loading: boolean;
}) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validate = () => {
        if (form.password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
        if (form.password !== form.confirmPassword) return "Las contraseñas no coinciden.";
        return null; // Valid
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        onSubmit({
            name: form.name,
            email: form.email,
            password: form.password
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2 animate-pulse">
                    ⚠️ {error}
                </div>
            )}

            <div className="space-y-1">
                <input
                    className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Nombre completo"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-1">
                <input
                    type="email"
                    className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Correo electrónico"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                />
            </div>

            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none pr-10"
                    placeholder="Contraseña (mín. 6 caracteres)"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all outline-none pr-10"
                    placeholder="Confirmar contraseña"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-indigo-600 text-white rounded-xl shadow-md disabled:opacity-60 font-medium hover:bg-indigo-700 transition-colors"
            >
                {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
        </form>
    );
}
