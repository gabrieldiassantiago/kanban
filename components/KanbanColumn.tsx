import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { MoreHorizontal, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface KanbanColumnProps {
    id: TaskStatus;
    title: string;
    tasks: Task[];
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
    onAdd: (status: TaskStatus) => void;
}

export function KanbanColumn({
    id,
    title,
    tasks,
    onEditTask,
    onDeleteTask,
    onAdd,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`
                flex-1 min-w-[320px] flex flex-col h-full rounded-2xl border px-2 group/column transition-colors duration-200
                ${isOver ? 'bg-indigo-50/80 border-indigo-300 ring-4 ring-indigo-50' : 'bg-slate-50/50 border-slate-200/60'}
            `}
        >
            <div className="flex items-center justify-between p-4 mb-2">
                <div className="flex items-center gap-3">
                    <h2 className="font-bold text-slate-700 text-base tracking-tight">{title}</h2>
                    <div className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {tasks.length}
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/column:opacity-100 transition-opacity">
                    <button
                        onClick={() => onAdd(id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            <div
                className="flex-1 overflow-y-auto px-1 pb-4 scrollbar-hide"
            >
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-3">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onAdd(id)}
                        className="mt-3 w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-indigo-100 text-sm font-medium group"
                    >
                        <Plus size={16} className="group-hover:scale-110 transition-transform" />
                        Nova tarefa
                    </motion.button>
                </SortableContext>
            </div>
        </div>
    );
}
