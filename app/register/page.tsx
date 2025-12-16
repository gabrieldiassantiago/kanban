'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/AuthService';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            await authService.signUp(email, password, fullName);
            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar conta');
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
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="font-bold text-slate-800 text-xl tracking-tight">Kanban</span>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-5xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            Comece sua<br />Jornada<br /><span className="text-indigo-600">Agora Mesmo.</span>
                        </h2>
                        <p className="text-slate-600 font-medium text-lg leading-relaxed max-w-md">
                            Crie sua conta gratuitamente e revolucione a maneira como você trabalha.
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

                <div className="relative z-10">
                    <span className="text-sm text-slate-400 font-medium">v1.0</span>
                </div>
            </motion.div>

            <div className="w-full lg:w-7/12 flex items-center justify-center relative bg-white overflow-y-auto">
                <div className="w-full h-full p-8 lg:p-24 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-md w-full"
                    >
                        <div className="mb-10">
                            <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Criar Conta</h1>
                            <p className="text-slate-500 text-base">Preencha seus dados para começar.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
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
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-green-50 border border-green-100 text-green-600 px-5 py-4 rounded-2xl text-sm flex items-center gap-3"
                                >
                                    <CheckCircle2 size={18} />
                                    Sucesso! Redirecionando...
                                </motion.div>
                            )}

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 block p-4 transition-all outline-none placeholder:text-slate-400"
                                        placeholder="Seu nome"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">E-mail</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 block p-4 transition-all outline-none placeholder:text-slate-400"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 ml-1">Senha</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 block p-4 transition-all outline-none placeholder:text-slate-400"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 ml-1">Repetir Senha</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-[#FAFAFA] border border-slate-200 text-slate-800 text-base rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 block p-4 transition-all outline-none placeholder:text-slate-400"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || success}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4.5 h-[56px] rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle2 size={24} />
                                    </>
                                ) : (
                                    'Criar Minha Conta'
                                )}
                            </button>

                            <div className="text-center pt-6">
                                <p className="text-base text-slate-500">
                                    Já tem uma conta?{' '}
                                    <Link
                                        href="/login"
                                        className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                                    >
                                        Fazer Login
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
