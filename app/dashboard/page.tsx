'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskModal } from '@/components/TaskModal';
import { AppShell } from '@/components/layout/AppShell';
import { Task, TaskStatus } from '@/types';
import { authService } from '@/lib/services/AuthService';

import { KanbanSkeleton } from '@/components/KanbanSkeleton';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const {
        tasks,
        loading: tasksLoading,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        moveTaskAndReorder
    } = useTasks(user?.id);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [initialStatus, setInitialStatus] = useState<TaskStatus | null>(null);

    useEffect(() => {
        // Apenas redireciona se terminou de carregar E não está autenticado
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleLogout = async () => {
        try {
            await authService.signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        setInitialStatus(null);
        setIsModalOpen(true);
    };

    const handleCreateTaskWithStatus = (status: TaskStatus) => {
        setEditingTask(null);
        setInitialStatus(status);
        setIsModalOpen(true);
    }

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setInitialStatus(null);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData: any) => {
        if (editingTask) {
            await updateTask(editingTask.id, taskData);
        } else {
            await createTask(taskData);
        }
    };

    // Estado de busca local
    const [searchTerm, setSearchTerm] = useState('');

    const handleMoveTask = async (taskId: string, newStatus: any, newOrderedIds: string[]) => {
        await moveTaskAndReorder(taskId, newStatus, newOrderedIds);
    };

    // Filtragem local
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Combina os estados de loading
    const isPageLoading = authLoading || (isAuthenticated && tasksLoading);

    // Se não estiver autenticado E não estiver carregando, retornamos null (vai redirecionar)
    if (!authLoading && !isAuthenticated) {
        return null;
    }

    return (
        <AppShell
            user={user}
            onSearch={setSearchTerm}
            onNewTask={handleCreateTask}
        >
            <div className="h-full flex flex-col">
                {/* Conteúdo Principal com Loading State */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="h-full min-w-max pb-8 pt-6">
                        {isPageLoading ? (
                            <KanbanSkeleton />
                        ) : (
                            <KanbanBoard
                                tasks={filteredTasks}
                                loading={false}
                                onEditTask={handleEditTask}
                                onDeleteTask={deleteTask}
                                onTaskMove={handleMoveTask}
                                onAdd={handleCreateTaskWithStatus}
                            />
                        )}
                    </div>
                </div>

                {/* Task Modal */}
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSave={handleSaveTask}
                    task={editingTask}
                    initialStatus={initialStatus}
                />
            </div>
        </AppShell>
    );
}
