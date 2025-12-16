'use client';

import { useEffect, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { KanbanSkeleton } from './KanbanSkeleton';

interface KanbanBoardProps {
    tasks: Task[];
    loading: boolean;
    onEditTask: (task: Task) => void;
    onDeleteTask: (id: string) => void;
    onTaskMove: (taskId: string, newStatus: TaskStatus, newOrderedIds: string[]) => Promise<void>;
    onAdd: (status: TaskStatus) => void;
}

export function KanbanBoard({
    tasks,
    loading,
    onEditTask,
    onDeleteTask,
    onTaskMove,
    onAdd
}: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find((t) => t.id === active.id);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        //ainda não implementado
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const activeTaskId = active.id as string;
        const activeTask = tasks.find((t) => t.id === activeTaskId);
        if (!activeTask) return;

        const overId = over.id;

        // Determinar status de destino
        let targetStatus: TaskStatus;
        let isContainer = false;

        if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
            targetStatus = overId as TaskStatus;
            isContainer = true;
        } else {
            const overTask = tasks.find(t => t.id === overId);
            if (!overTask) return;
            targetStatus = overTask.status;
        }

        // Calcular nova ordem
        const tasksInTargetColumn = tasks.filter(t => t.status === targetStatus);
        const activeIndex = tasksInTargetColumn.findIndex(t => t.id === activeTaskId);
        const overIndex = isContainer
            ? tasksInTargetColumn.length
            : tasksInTargetColumn.findIndex(t => t.id === overId);

        let newOrderedTasks: Task[] = [];

        if (activeTask.status !== targetStatus) {

            const newColumnTasks = [...tasksInTargetColumn];
            if (isContainer) {
                newColumnTasks.push({ ...activeTask, status: targetStatus });
            } else {
                // Nota: Se index for -1 (nao achou), poe no fim.
                const insertIndex = overIndex >= 0 ? overIndex : newColumnTasks.length;
                newColumnTasks.splice(insertIndex, 0, { ...activeTask, status: targetStatus });
            }
            newOrderedTasks = newColumnTasks;

        } else {
            // Mesma coluna: Reordenar
            if (activeIndex !== overIndex) {
                newOrderedTasks = arrayMove(tasksInTargetColumn, activeIndex, overIndex);
            } else {
                // Nenhuma mudança real
                setActiveTask(null);
                return;
            }
        }

        // Extrair IDs
        const newOrderedIds = newOrderedTasks.map(t => t.id);

        // Chamar handler
        await onTaskMove(activeTaskId, targetStatus, newOrderedIds);

        setActiveTask(null);
    };

    const handleDragCancel = () => {
        setActiveTask(null);
    };

    if (loading) {
        return <KanbanSkeleton />;
    }

    const getTasksByStatus = (status: TaskStatus) => tasks.filter(t => t.status === status);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                <KanbanColumn
                    id={TaskStatus.TODO}
                    title="A Fazer"
                    tasks={getTasksByStatus(TaskStatus.TODO)}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onAdd={onAdd}
                />
                <KanbanColumn
                    id={TaskStatus.IN_PROGRESS}
                    title="Em Progresso"
                    tasks={getTasksByStatus(TaskStatus.IN_PROGRESS)}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onAdd={onAdd}
                />
                <KanbanColumn
                    id={TaskStatus.DONE}
                    title="Concluído"
                    tasks={getTasksByStatus(TaskStatus.DONE)}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onAdd={onAdd}
                />
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="rotate-3 scale-105 cursor-grabbing">
                        <TaskCard
                            task={activeTask}
                            onEdit={() => { }}
                            onDelete={() => { }}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
