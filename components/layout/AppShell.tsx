'use client';

import { ReactNode } from 'react';
import { LayoutDashboard, Kanban, BarChart3, Settings, LogOut, Search, Bell, Plus, Filter, ArrowUpDown, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/AuthService';

interface AppShellProps {
    children: ReactNode;
    user: any;
    onSearch?: (term: string) => void;
    onNewTask?: () => void;
}

export function AppShell({ children, user, onSearch, onNewTask }: AppShellProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await authService.signOut();
        router.push('/login');
    };

    return (
        <div className="flex h-screen bg-[#F4F5F7] overflow-hidden font-sans text-slate-900">
            {/* ... Sidebar ... */}
            <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-8 z-20 shadow-sm">
                {/* Logo Area */}
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg mb-4">
                    <Kanban className="text-white w-6 h-6" />
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-6 flex-1 w-full px-2">
                    <NavItem active icon={<LayoutDashboard size={22} />} />
                </nav>

                {/* Logout */}
                <div className="mt-auto pb-4">
                    <button
                        onClick={handleLogout}
                        className="p-3 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold text-slate-800">Kanban</h1>

                        <div className="hidden md:flex items-center gap-2 pl-6 border-l border-slate-100">
                            <span className="text-sm font-medium text-slate-600">Meu Projeto Pessoal</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                onChange={(e) => onSearch?.(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none text-slate-600 placeholder:text-slate-400"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                    </div>
                </header>

                {/* Filters Bar */}
                <div className="h-16 flex items-center justify-between px-8 pt-4 pb-2">
                    <div className="flex items-center gap-4">
                        {/* Breadcrumbs or Filters could go here */}
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-all hover:border-slate-300">
                            <Filter size={16} />
                            Filtros
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-all hover:border-slate-300">
                            <ArrowUpDown size={16} />
                            Ordenar
                        </button>
                        <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-all hover:border-slate-300">
                            <MoreVertical size={16} />
                        </button>
                        <button
                            onClick={onNewTask}
                            className="ml-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            Nova Tarefa
                        </button>
                    </div>
                </div>

                {/* Board Content Area */}
                <main className="flex-1 overflow-x-auto overflow-y-hidden p-8 pt-2">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ icon, active = false }: { icon: ReactNode, active?: boolean }) {
    return (
        <button
            className={`
        w-full h-12 flex items-center justify-center rounded-xl transition-all duration-200
        ${active
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'text-slate-400 hover:text-indigo-500 hover:bg-white'}
      `}
        >
            {icon}
        </button>
    );
}
