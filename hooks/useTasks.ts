'use client';

import { useEffect, useState, useCallback } from 'react';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from '@/types';
import { taskService } from '@/lib/services/TaskService';
import { toast } from 'sonner';

export function useTasks(userId: string | undefined) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTasks = useCallback(async (silent: boolean = false) => {
        if (!userId) {
            setTasks([]);
            setLoading(false);
            return;
        }

        try {
            if (!silent) setLoading(true);
            setError(null);
            const allTasks = await taskService.getAllTasks(userId);
            setTasks(allTasks);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao carregar tarefas';
            setError(msg);
            if (!silent) toast.error(msg);
            console.error('Error loading tasks:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Criar tarefa
    const createTask = async (data: CreateTaskDTO) => {
        if (!userId) throw new Error('Usuário não autenticado');

        try {
            const newTask = await taskService.createTask(userId, data);
            setTasks((prev) => [...prev, newTask]);
            toast.success('Tarefa criada com sucesso!');
            return newTask;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao criar tarefa';
            setError(errorMessage);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Atualizar tarefa
    const updateTask = async (id: string, data: UpdateTaskDTO) => {
        if (!userId) throw new Error('Usuário não autenticado');

        try {
            const updatedTask = await taskService.updateTask(id, userId, data);
            setTasks((prev) =>
                prev.map((task) => (task.id === id ? updatedTask : task))
            );
            toast.success('Tarefa atualizada!');
            return updatedTask;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar tarefa';
            setError(errorMessage);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Deletar tarefa
    const deleteTask = async (id: string) => {
        if (!userId) throw new Error('Usuário não autenticado');

        try {
            await taskService.deleteTask(id, userId);
            setTasks((prev) => prev.filter((task) => task.id !== id));
            toast.success('Tarefa excluída.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar tarefa';
            setError(errorMessage);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const moveTask = async (id: string, newStatus: TaskStatus, newPosition: number) => {
        if (!userId) throw new Error('Usuário não autenticado');

        try {
            const movedTask = await taskService.moveTask(id, userId, newStatus, newPosition);
            setTasks((prev) =>
                prev.map((task) => (task.id === id ? movedTask : task))
            );
            toast.success('Tarefa movida.');
            return movedTask;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao mover tarefa';
            setError(errorMessage);
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Obter tarefas por status
    const getTasksByStatus = (status: TaskStatus) => {
        return tasks.filter((task) => task.status === status);
    };

    const moveTaskAndReorder = async (id: string, newStatus: TaskStatus, newOrderedIds: string[]) => {
        if (!userId) throw new Error('Usuário não autenticado');

        setTasks(prev => {
            let newTasks = [...prev];
            newTasks = newTasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
            return newTasks;
        });

        try {
            await taskService.moveTaskAndReorder(userId, id, newStatus, newOrderedIds);
            await loadTasks(true);
            toast.success('Tarefa movida.');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao mover tarefa';
            setError(errorMessage);
            toast.error('Erro ao salvar a nova ordem!');
            await loadTasks(false);
            throw new Error(errorMessage);
        }
    };

    return {
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        moveTaskAndReorder,
        getTasksByStatus,
        refreshTasks: loadTasks,
    };
}
