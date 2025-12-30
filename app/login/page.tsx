'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/AuthService';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authService.signIn(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white overflow-hidden">

            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex w-5/12 relative flex-col p-16 bg-[#F4F7FF] overflow-hidden border-r border-slate-100"
            >
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="font-bold text-slate-800 text-xl tracking-tight">Kanban</span>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-5xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            Rápido,<br />Eficiente e<br /><span className="text-blue-600">Produtivo.</span>
                        </h2>
                        <p className="text-slate-600 font-medium text-lg leading-relaxed max-w-md">
                            A plataforma definitiva para gerenciar seus projetos pessoais e profissionais.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex-1 flex items-center justify-center min-h-[300px]">
                    <div className="relative w-full h-full">
                        <Image
                            src="/auth_hero.png"
                            alt="Produtividade"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3 mt-4">

                    <span className="text-sm text-slate-400 font-medium">v1.0</span>
                </div>
            </motion.div>

            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 lg:p-24 relative bg-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-md w-full"
                >
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Entrar</h1>
                        <p className="text-slate-500 text-base">Bem-vindo de volta! Insira seus dados para acessar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-sm flex items-center gap-3"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 transition-all outline-none placeholder:text-slate-400"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Senha</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 transition-all outline-none placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                        <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Lembrar de mim</span>
                                    </label>
                                    <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                        Esqueceu a senha?
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4.5 h-[56px] rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                </>
                            ) : (
                                'Entrar na Conta'
                            )}
                        </button>

                        <div className="text-center pt-6">
                            <p className="text-base text-slate-500">
                                Não tem uma conta?{' '}
                                <Link
                                    href="/register"
                                    className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                                >
                                    Cadastre-se grátis
                                </Link>
                            </p>
                        </div>
                    </form>

                    <div className="mt-12 border-t border-slate-100 pt-8 flex justify-center lg:justify-start gap-6 text-sm text-slate-400 font-medium">
                        <a href="#" className="hover:text-slate-600 transition-colors">Termos</a>
                        <a href="#" className="hover:text-slate-600 transition-colors">Privacidade e Cookies</a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
