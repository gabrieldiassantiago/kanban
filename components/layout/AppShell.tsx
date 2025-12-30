'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import {
    LayoutDashboard,
    Kanban,
    LogOut,
    Search,
    Bell,
    Plus,
    Filter,
    ArrowUpDown,
    MoreVertical,
    X,
    Command,
    CheckSquare,
    Settings,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/AuthService';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

import { toast } from 'sonner';
import { Profile, Task } from '@/types';
import { NotificationsPopover } from '@/components/NotificationsPopover';

interface AppShellProps {
    children: ReactNode;
    user: any;
    onSearch?: (term: string) => void;
    onNewTask?: () => void;
    onFilterChange?: (filters: { status: string; priority: string }) => void;
    profile?: Profile | null;
    tasks?: Task[];
    onSelectTask?: (task: Task) => void;
}

export function AppShell({
    children,
    user,
    onSearch,
    onNewTask,
    onFilterChange,
    profile,
    tasks = [],
    onSelectTask
}: AppShellProps) {

    const router = useRouter();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile?.avatar_url);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isSearchOpen) {
            // Pequeno delay para garantir que o elemento esteja no DOM antes do focus
            const timeout = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [isSearchOpen]);

    useEffect(() => {
        if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
        }
    }, [profile]);

    const handleAvatarClick = () => {
        if (isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !profile?.id) return;

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', profile.id);


            const { updateAvatarAction } = await import('@/app/actions');
            const newUrl = await updateAvatarAction(formData);

            setAvatarUrl(newUrl);
            toast.success('Foto de perfil atualizada!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar foto');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleLogout = async () => {
        await authService.signOut();
        router.push('/login');
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }

        if (isFilterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterOpen]);


    return (
        <div className="flex h-screen bg-[#F4F5F7] overflow-hidden font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-8 shadow-sm">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Kanban className="text-white w-6 h-6" />
                </div>

                <nav className="flex flex-col gap-6 flex-1 w-full px-2">
                    <NavItem active icon={<LayoutDashboard size={22} />} />
                    <NavItem onClick={() => router.push('/dashboard/settings')} icon={<Settings size={22} />} />
                </nav>

                <button
                    onClick={handleLogout}
                    className="p-3 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 mb-4"
                >
                    <LogOut size={22} />
                </button>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Kanban</h1>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all flex items-center gap-2 group"
                            >
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 group-hover:border-indigo-200 group-hover:bg-white transition-all">
                                    <Search size={18} className="text-slate-400 group-hover:text-indigo-500" />
                                    <span className="text-sm text-slate-400 group-hover:text-slate-600 pr-2">Buscar...</span>
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-100 uppercase">
                                        <Command size={10} /> K
                                    </div>
                                </div>
                            </button>
                        </div>

                        <NotificationsPopover userId={user?.id} />

                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className={clsx(
                                        "w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-500 transition-all",
                                        isUploading && "opacity-50"
                                    )}
                                />
                            ) : (
                                <div className={clsx(
                                    "w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full ring-2 ring-transparent group-hover:ring-indigo-500 transition-all",
                                    isUploading && "opacity-50"
                                )} />
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Actions Bar */}
                <div className="h-16 flex items-center justify-end px-8 gap-3">
                    {/* FILTROS */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen((prev) => !prev)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm"
                        >
                            <Filter size={16} />
                            Filtros
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <FilterPopover
                                    onApply={(filters) => {
                                        onFilterChange?.(filters);
                                        setIsFilterOpen(false);
                                    }}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm">
                        <ArrowUpDown size={16} />
                        Ordenar
                    </button>

                    <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm">
                        <MoreVertical size={16} />
                    </button>

                    <button
                        onClick={onNewTask}
                        className="ml-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md"
                    >
                        <Plus size={18} />
                        Nova Tarefa
                    </button>
                </div>

                {/* Content */}
                <main className="flex-1 overflow-x-auto overflow-y-hidden p-8">
                    {children}
                </main>
            </div>

            {/* Spotlight Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white/90 backdrop-blur-xl w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative flex items-center p-6 border-b border-slate-100 bg-white/50 backdrop-blur-md">
                                <Search className="text-indigo-500 w-6 h-6 mr-4" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="O que você está procurando?"
                                    value={localSearchTerm}
                                    onChange={(e) => {
                                        setLocalSearchTerm(e.target.value);
                                        onSearch?.(e.target.value);
                                    }}
                                    className="flex-1 bg-transparent text-xl text-slate-800 placeholder:text-slate-400 outline-none font-medium"
                                />
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="p-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all text-xs font-bold flex items-center gap-1 uppercase tracking-tight"
                                >
                                    ESC
                                </button>
                            </div>

                            {/* Results Area */}
                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {localSearchTerm.length > 0 ? (
                                    <div className="space-y-1">
                                        <h3 className="px-4 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-indigo-500">Tarefas encontradas</h3>
                                        <div className="space-y-1 px-1">
                                            {tasks.filter(t =>
                                                t.title.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
                                                t.description?.toLowerCase().includes(localSearchTerm.toLowerCase())
                                            ).slice(0, 8).map((task) => (
                                                <button
                                                    key={task.id}
                                                    onClick={() => {
                                                        onSelectTask?.(task);
                                                        setIsSearchOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-indigo-600 group transition-all text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                                        <Kanban size={20} className="text-slate-400 group-hover:text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-slate-700 group-hover:text-white truncate">
                                                            {task.title}
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-0.5">
                                                            <p className="text-xs text-slate-400 group-hover:text-indigo-100 truncate flex-1">
                                                                {task.description || 'Sem descrição'}
                                                            </p>
                                                            {task.task_steps && task.task_steps.length > 0 && (
                                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 group-hover:text-white bg-slate-50 group-hover:bg-indigo-500/50 px-1.5 py-0.5 rounded transition-colors border border-slate-100 group-hover:border-indigo-400">
                                                                    <CheckSquare size={10} />
                                                                    {task.task_steps.filter(s => s.is_completed).length}/{task.task_steps.length}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 group-hover:bg-indigo-500 group-hover:text-white border border-slate-200 group-hover:border-indigo-400">
                                                        {task.status}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        {tasks.filter(t =>
                                            t.title.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
                                            t.description?.toLowerCase().includes(localSearchTerm.toLowerCase())
                                        ).length === 0 && (
                                                <div className="p-12 text-center text-slate-400">
                                                    <div className="w-16 h-16 bg-slate-50/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100/50">
                                                        <Search size={24} className="text-slate-300" />
                                                    </div>
                                                    <p className="text-sm font-medium">Nenhum resultado para "{localSearchTerm}"</p>
                                                    <p className="text-xs">Tente buscar por outro termo ou descrição.</p>
                                                </div>
                                            )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="px-4 pt-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-slate-400">Sugestões e Ações</h3>
                                            <div className="grid grid-cols-2 gap-2 px-2">
                                                <button
                                                    onClick={() => {
                                                        onNewTask?.();
                                                        setIsSearchOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-indigo-50/50 border border-slate-100/50 hover:border-indigo-100/50 transition-all text-left group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <Plus size={16} />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600">Nova Tarefa</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsFilterOpen(true);
                                                        setIsSearchOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-indigo-50/50 border border-slate-100/50 hover:border-indigo-100/50 transition-all text-left group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <Filter size={16} />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600">Ver Filtros</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-50/50 border-t border-slate-100/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                            <ArrowUpDown size={10} />
                                            Navegar
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-[10px] font-bold text-slate-500">
                                            ENTER
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Selecionar</span>
                                    </div>
                                </div>


                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FilterPopover({ onApply }: { onApply: (filters: { status: string; priority: string }) => void }) {
    const [status, setStatus] = useState('Todos');
    const [priority, setPriority] = useState('Todas');

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 z-50 origin-top-right whitespace-nowrap"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                    Filtros
                </h3>
                <button
                    onClick={() => {
                        setStatus('Todos');
                        setPriority('Todas');
                    }}
                    className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 hover:text-indigo-700"
                >
                    Limpar tudo
                </button>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        Status
                    </label>
                    <div className="grid grid-cols-1 gap-1">
                        {['Todos', 'TODO', 'IN_PROGRESS', 'DONE'].map((s) => {
                            const labels: Record<string, string> = {
                                'Todos': 'Todos',
                                'TODO': 'A Fazer',
                                'IN_PROGRESS': 'Em Progresso',
                                'DONE': 'Concluído'
                            };
                            return (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={clsx(
                                        "text-left px-3 py-2 text-sm rounded-lg transition-colors",
                                        status === s ? "bg-indigo-50 text-indigo-600 font-medium" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {labels[s]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        Prioridade
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['Todas', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => {
                            const labels: Record<string, string> = {
                                'Todas': 'Todas',
                                'LOW': 'Baixa',
                                'MEDIUM': 'Média',
                                'HIGH': 'Alta',
                                'URGENT': 'Urgente'
                            };
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={clsx(
                                        "px-3 py-1 text-xs rounded-full border transition-all",
                                        priority === p
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    {labels[p]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100 mt-5 pt-4">
                <button
                    onClick={() => onApply({ status, priority })}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                    Aplicar Filtros
                </button>
            </div>
        </motion.div>
    );
}

function NavItem({ icon, active = false, onClick }: { icon: ReactNode; active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full h-12 flex items-center justify-center rounded-xl transition-all
                ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-500 hover:bg-white'}
            `}
        >
            {icon}
        </button>
    );
}
