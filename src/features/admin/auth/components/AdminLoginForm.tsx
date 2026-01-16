import React, { useState } from 'react';
import { useAdminLogin } from '../hooks/useAdminLogin';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';

export default function AdminLoginForm() {
    const { login, loading, error } = useAdminLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-white mb-2">
                    Email
                </label>
                <Input
                    type="email"
                    placeholder="admin@sassbarber.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/50"
                />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-white mb-2">
                    Password
                </label>
                <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 focus:ring-blue-400/50"
                />
            </div>

            {error && (
                <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full flex justify-center py-3 px-4 shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
                isLoading={loading}
            >
                {loading ? 'Iniciando sesión...' : 'Sign in'}
            </Button>
        </form>
    );
}
