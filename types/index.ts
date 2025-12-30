export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    code_is_kanban?: string;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    scheduled_time?: string;
    position: number;
    created_at: string;
    updated_at: string;
    task_steps?: TaskStep[];
}

export interface CreateTaskDTO {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    scheduled_time?: string;
    position?: number;
}

export interface UpdateTaskDTO {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    scheduled_time?: string;
    position?: number;
}

// Badge types para indicar status da tarefa
export type TaskBadge =
    | 'atrasado'    // Tarefa com horário passado
    | 'pendente'    // Tarefa em TODO
    | 'em-progresso' // Tarefa em IN_PROGRESS
    | 'concluído'   // Tarefa em DONE
    | 'urgente'     // Tarefa com prioridade URGENT
    | 'alta'        // Tarefa com prioridade HIGH
    | 'agendado';   // Tarefa com horário futuro

export interface TaskStep {
    id: string;
    task_id: string;
    title: string;
    is_completed: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface CreateTaskStepDTO {
    task_id: string;
    title: string;
    position?: number;
}

export interface UpdateTaskStepDTO {
    title?: string;
    is_completed?: boolean;
    position?: number;
}

// Notification Types
export enum NotificationType {
    TASK_ASSIGNED = 'TASK_ASSIGNED',
    TASK_COMPLETED = 'TASK_COMPLETED',
    TASK_OVERDUE = 'TASK_OVERDUE',
    SYSTEM = 'SYSTEM',
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message?: string;
    type: NotificationType;
    is_read: boolean;
    link?: string;
    created_at: string;
}

export interface CreateNotificationDTO {
    user_id: string;
    title: string;
    message?: string;
    type?: NotificationType;
    link?: string;
}
