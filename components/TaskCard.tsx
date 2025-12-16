import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { Badge } from './Badge';
import { taskService } from '@/lib/services/TaskService';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Trash2 } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const badges = taskService.getBadges(task);
    const isOverdue = taskService.isOverdue(task);

    // Calcula dias restantes ou passados
    const getDaysLabel = () => {
        if (!task.scheduled_time) return null;
        try {
            const date = parseISO(task.scheduled_time);
            const now = new Date();
            const diffTime = date.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) return `${Math.abs(diffDays)} dias atraso`;
            if (diffDays === 0) return 'Hoje';
            return `${diffDays} dias restantes`;
        } catch {
            return null;
        }
    };

    const daysLabel = getDaysLabel();

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onEdit(task)}
            className={`
        group relative bg-white rounded-xl p-4 cursor-grab active:cursor-grabbing
        border border-transparent hover:border-indigo-100
        shadow-sm hover:shadow-md transition-all duration-200
        ${isOverdue ? 'ring-1 ring-red-100' : ''}
      `}
            {...attributes}
            {...listeners}
        >
            {/* Header com badges e delete */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-2">
                    {badges.slice(0, 3).map((badge, index) => (
                        <Badge key={index} type={badge} />
                    ))}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                            onDelete(task.id);
                        }
                    }}
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded"
                    title="Excluir tarefa"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Título e Descrição */}
            <h3 className="font-semibold text-slate-800 mb-2 leading-tight">{task.title}</h3>

            {task.description && (
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {task.description}
                </p>
            )}

            {/* Footer apenas com Data Real */}
            {daysLabel && (
                <div className="flex items-center justify-start pt-2 border-t border-slate-50 mt-2">
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${isOverdue ? 'text-red-500 bg-red-50' : 'text-slate-500 bg-slate-100'}`}>
                        <Clock size={12} />
                        <span>{daysLabel}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
