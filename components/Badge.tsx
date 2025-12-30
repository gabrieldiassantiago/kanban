import { TaskBadge } from '@/types';

interface BadgeProps {
    type: TaskBadge;
    className?: string;
}

const badgeStyles: Record<TaskBadge, string> = {
    atrasado: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
    pendente: 'bg-slate-100 text-slate-600',
    'em-progresso': 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200',
    concluído: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',

    urgente: 'bg-red-50 text-red-600 ring-1 ring-red-100',
    alta: 'bg-orange-50 text-orange-600 ring-1 ring-orange-100',

    agendado: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
};

const badgeLabels: Record<TaskBadge, string> = {
    atrasado: 'Atrasado',
    pendente: 'Pendente',
    'em-progresso': 'Em Progresso',
    concluído: 'Concluído',
    urgente: 'Urgente',
    alta: 'Alta Prioridade',
    agendado: 'Agendado',
};

export function Badge({ type, className = '' }: BadgeProps) {
    const style = badgeStyles[type] || 'bg-gray-100 text-gray-600';

    return (
        <span
            className={`
        inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wide font-bold
        ${style}
        ${className}
      `}
        >
            {badgeLabels[type]}
        </span>
    );
}
