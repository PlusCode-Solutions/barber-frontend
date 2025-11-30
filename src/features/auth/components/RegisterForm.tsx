import { useState } from "react";

export default function RegisterForm({ onSubmit, loading }: {
    onSubmit: (data: any) => void;
    loading: boolean;
}) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={submit} className="space-y-4">

            <input
                className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2"
                placeholder="Nombre completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
            />

            <input
                type="email"
                className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
            />

            <input
                type="password"
                className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2"
                placeholder="Contraseña"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full p-3 bg-indigo-600 text-white rounded-xl shadow-md disabled:opacity-60"
            >
                {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
        </form>
    );
}
