import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus, TaskBadge, TaskStep, CreateTaskStepDTO, UpdateTaskStepDTO, NotificationType } from '@/types';
import { ITaskRepository } from '../repositories/ITaskRepository';
import { taskRepository } from '../repositories/SupabaseTaskRepository';
import { isPast, isFuture, parseISO } from 'date-fns';
import { notificationService } from './NotificationService';

export class TaskService {
    constructor(private repository: ITaskRepository) { }

    /**
     * Lista todas as tarefas do usuário
     */
    async getAllTasks(userId: string): Promise<Task[]> {
        return this.repository.findAll(userId);
    }

    /**
     * Obtém uma tarefa específica
     */
    async getTaskById(id: string, userId: string): Promise<Task | null> {
        return this.repository.findById(id, userId);
    }

    /**
     * Lista tarefas por status
     */
    async getTasksByStatus(status: TaskStatus, userId: string): Promise<Task[]> {
        return this.repository.findByStatus(status, userId);
    }

    /**
     * Cria uma nova tarefa
     */
    async createTask(userId: string, data: CreateTaskDTO): Promise<Task> {
        // Validação
        if (!data.title || data.title.trim() === '') {
            throw new Error('O título da tarefa é obrigatório');
        }

        // Define posição padrão se não fornecida
        if (data.position === undefined) {
            const tasks = await this.repository.findByStatus(
                data.status || TaskStatus.TODO,
                userId
            );
            data.position = tasks.length;
        }

        await notificationService.createNotification({
            user_id: userId,
            title: 'Tarefa atualizada',
            message: `A tarefa ${data.title} foi atualizada.`,
            type: NotificationType.TASK_ASSIGNED

        });

        return this.repository.create(userId, data);
    }

    /**
     * Atualiza uma tarefa
     */
    async updateTask(id: string, userId: string, data: UpdateTaskDTO): Promise<Task> {
        const existingTask = await this.repository.findById(id, userId);

        if (!existingTask) {
            throw new Error('Tarefa não encontrada');
        }

        if (data.title !== undefined && data.title.trim() === '') {
            throw new Error('O título da tarefa não pode estar vazio');
        }

        await notificationService.createNotification({
            user_id: userId,
            title: 'Tarefa atualizada',
            message: `A tarefa ${existingTask.title} foi atualizada.`,
            type: NotificationType.TASK_ASSIGNED

        });


        return this.repository.update(id, userId, data);
    }

    /** 
     * Deleta uma tarefa
     */
    async deleteTask(id: string, userId: string): Promise<void> {
        const existingTask = await this.repository.findById(id, userId);

        if (!existingTask) {
            throw new Error('Tarefa não encontrada');
        }

        await this.repository.delete(id, userId);
    }

    /**
     * Move uma tarefa para outro status
     */
    async moveTask(
        id: string,
        userId: string,
        newStatus: TaskStatus,
        newPosition: number
    ): Promise<Task> {
        const task = await this.repository.findById(id, userId);

        if (!task) {
            throw new Error('Tarefa não encontrada');
        }

        // Primeiro atualiza o status
        const updatedTask = await this.repository.updateStatus(id, userId, newStatus);

        // Depois atualiza a posição
        await this.repository.updatePosition(id, userId, newPosition);

        return { ...updatedTask, position: newPosition };
    }

    /**
     * Move tarefa e reordena toda a coluna de destino
     */
    async moveTaskAndReorder(
        userId: string,
        taskId: string,
        newStatus: TaskStatus,
        newOrderedIds: string[]
    ): Promise<void> {

        const task = await this.repository.findById(taskId, userId);
        if (task && task.status !== newStatus) {
            await this.repository.updateStatus(taskId, userId, newStatus);
        }

        // 2. Preparar updates de posição
        const updates = newOrderedIds.map((id, index) => ({
            id,
            position: index
        }));

        await this.repository.updatePositionsBatch(userId, updates);
    }

    async deleteAllTasks(userId: string) {

    }

    /**
     * Reordena tarefas dentro do mesmo status
     */
    async reorderTasks(
        taskId: string,
        userId: string,
        newPosition: number
    ): Promise<void> {
        await this.repository.updatePosition(taskId, userId, newPosition);
    }

    /**
     * Determina os badges de uma tarefa baseado nas regras de negócio
     */
    getBadges(task: Task): TaskBadge[] {
        const badges: TaskBadge[] = [];

        // Badge de status
        if (task.status === TaskStatus.TODO) {
            badges.push('pendente');
        } else if (task.status === TaskStatus.IN_PROGRESS) {
            badges.push('em-progresso');
        } else if (task.status === TaskStatus.DONE) {
            badges.push('concluído');
        }

        // Badge de prioridade
        if (task.priority === 'URGENT') {
            badges.push('urgente');
        } else if (task.priority === 'HIGH') {
            badges.push('alta');
        }

        // Badge de tempo
        if (task.scheduled_time) {
            try {
                const scheduledDate = parseISO(task.scheduled_time);

                if (isPast(scheduledDate) && task.status !== TaskStatus.DONE) {
                    badges.push('atrasado');
                } else if (isFuture(scheduledDate)) {
                    badges.push('agendado');
                }
            } catch (error) {
                console.error('Error parsing date:', error);
            }
        }

        return badges;
    }

    /**
     * Verifica se uma tarefa está atrasada
     */
    isOverdue(task: Task): boolean {
        if (!task.scheduled_time || task.status === TaskStatus.DONE) {
            return false;
        }

        try {
            return isPast(parseISO(task.scheduled_time));
        } catch {
            return false;
        }
    }

    // Steps
    async getSteps(taskId: string): Promise<TaskStep[]> {
        return this.repository.getSteps(taskId);
    }

    async createStep(data: CreateTaskStepDTO): Promise<TaskStep> {
        if (!data.title || data.title.trim() === '') {
            throw new Error('O título da etapa é obrigatório');
        }
        return this.repository.createStep(data);
    }

    async updateStep(id: string, data: UpdateTaskStepDTO): Promise<TaskStep> {
        return this.repository.updateStep(id, data);
    }

    async deleteStep(id: string): Promise<void> {
        return this.repository.deleteStep(id);
    }

}

export const taskService = new TaskService(taskRepository);
