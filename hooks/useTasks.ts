'use client';

import { useEffect, useState, useCallback } from 'react';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from '@/types';
import { taskService } from '@/lib/services/TaskService';

export function useTasks(userId: string | undefined) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carregar tarefas
    const loadTasks = useCallback(async () => {
        if (!userId) {
            setTasks([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const allTasks = await taskService.getAllTasks(userId);
            setTasks(allTasks);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
            console.error('Error loading tasks:', err);
        } finally {
            setLoading(false);
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
            return newTask;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao criar tarefa';
            setError(errorMessage);
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
            return updatedTask;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar tarefa';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Deletar tarefa
    const deleteTask = async (id: string) => {
        if (!userId) throw new Error('Usuário não autenticado');

        try {
            await taskService.deleteTask(id, userId);
            setTasks((prev) => prev.filter((task) => task.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar tarefa';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Mover tarefa para outro status (simples)
    const moveTask = async (id: string, newStatus: TaskStatus, newPosition: number) => {
        if (!userId) throw new Error('Usuário não autenticado');

        try {
            const movedTask = await taskService.moveTask(id, userId, newStatus, newPosition);
            setTasks((prev) =>
                prev.map((task) => (task.id === id ? movedTask : task))
            );
            return movedTask;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao mover tarefa';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    // Obter tarefas por status
    const getTasksByStatus = (status: TaskStatus) => {
        return tasks.filter((task) => task.status === status);
    };

    // Mover tarefa com reordenação completa (Batch Update)
    const moveTaskAndReorder = async (id: string, newStatus: TaskStatus, newOrderedIds: string[]) => {
        if (!userId) throw new Error('Usuário não autenticado');

        // Optimistic Update Simples:
        // Assumimos que vai dar certo e atualizamos
        // Mas como a lógica de position é complexa, só atualizamos status e esperamos reload.
        // Ou melhor, setamos loading=true silencioso (sem spinner total)

        try {
            await taskService.moveTaskAndReorder(userId, id, newStatus, newOrderedIds);
            // Recarrega do servidor para ter as posições corretas
            await loadTasks();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao mover tarefa';
            setError(errorMessage);
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
