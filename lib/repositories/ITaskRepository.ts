import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus, TaskStep, CreateTaskStepDTO, UpdateTaskStepDTO } from '@/types';

export interface ITaskRepository {
    findAll(userId: string): Promise<Task[]>;
    findById(id: string, userId: string): Promise<Task | null>;
    findByStatus(status: TaskStatus, userId: string): Promise<Task[]>;
    create(userId: string, data: CreateTaskDTO): Promise<Task>;
    update(id: string, userId: string, data: UpdateTaskDTO): Promise<Task>;
    delete(id: string, userId: string): Promise<void>;
    updatePosition(id: string, userId: string, newPosition: number): Promise<void>;
    updateStatus(id: string, userId: string, newStatus: TaskStatus): Promise<Task>;
    updatePositionsBatch(userId: string, updates: { id: string; position: number }[]): Promise<void>;
    deleteAllTasks(userId: string): Promise<void>;

    getSteps(taskId: string): Promise<TaskStep[]>;
    createStep(data: CreateTaskStepDTO): Promise<TaskStep>;
    updateStep(id: string, data: UpdateTaskStepDTO): Promise<TaskStep>;
    deleteStep(id: string): Promise<void>;
}
