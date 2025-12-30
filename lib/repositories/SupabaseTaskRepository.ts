import { supabase } from '../supabase';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus, TaskStep, CreateTaskStepDTO, UpdateTaskStepDTO } from '@/types';
import { ITaskRepository } from './ITaskRepository';
import { withAuthRetry } from '../utils/authRetry';

export class SupabaseTaskRepository implements ITaskRepository {

    private readonly tableName = 'tasks';

    async findAll(userId: string): Promise<Task[]> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*, task_steps(*)')
                .eq('user_id', userId)
                .order('position', { ascending: true });

            if (error) {
                throw new Error(`Error fetching tasks: ${error.message}`);
            }

            return data || [];
        });
    }

    async findById(id: string, userId: string): Promise<Task | null> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw new Error(`Error fetching task: ${error.message}`);
            }

            return data;
        });
    }

    async findByStatus(status: TaskStatus, userId: string): Promise<Task[]> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*, task_steps(*)')
                .eq('user_id', userId)
                .eq('status', status)
                .order('position', { ascending: true });

            if (error) {
                throw new Error(`Error fetching tasks by status: ${error.message}`);
            }

            return data || [];
        });
    }

    async create(userId: string, taskData: CreateTaskDTO): Promise<Task> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from(this.tableName)
                .insert({
                    user_id: userId,
                    ...taskData,
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating task: ${error.message}`);
            }

            return data;
        });
    }

    async update(id: string, userId: string, taskData: UpdateTaskDTO): Promise<Task> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from(this.tableName)
                .update(taskData)
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating task: ${error.message}`);
            }

            return data;
        });
    }

    async delete(id: string, userId: string): Promise<void> {
        return withAuthRetry(async () => {
            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error deleting task: ${error.message}`);
            }
        });
    }

    async updatePosition(id: string, userId: string, newPosition: number): Promise<void> {
        return withAuthRetry(async () => {
            const { error } = await supabase
                .from(this.tableName)
                .update({ position: newPosition })
                .eq('id', id)
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error updating task position: ${error.message}`);
            }
        });
    }

    async updateStatus(id: string, userId: string, newStatus: TaskStatus): Promise<Task> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from(this.tableName)
                .update({ status: newStatus })
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating task status: ${error.message}`);
            }

            return data;
        });
    }

    async updatePositionsBatch(userId: string, updates: { id: string; position: number }[]): Promise<void> {
        return withAuthRetry(async () => {
            const updatePromises = updates.map(({ id, position }) => {
                return supabase
                    .from(this.tableName)
                    .update({ position })
                    .eq('id', id)
                    .eq('user_id', userId);
            });

            const results = await Promise.all(updatePromises);

            const hasError = results.some(r => r.error);
            if (hasError) {
                throw new Error('Erro ao atualizar posições de algumas tarefas');
            }
        });
    }

    async deleteAllTasks(userId: string): Promise<void> {
        //falta
    }


    async getSteps(taskId: string): Promise<TaskStep[]> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from('task_steps')
                .select('*')
                .eq('task_id', taskId)
                .order('position', { ascending: true });

            if (error) {
                throw new Error(`Error fetching steps: ${error.message}`);
            }
            return data || [];
        });
    }

    async createStep(data: CreateTaskStepDTO): Promise<TaskStep> {
        return withAuthRetry(async () => {
            const { data: step, error } = await supabase
                .from('task_steps')
                .insert(data)
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating step: ${error.message}`);
            }
            return step;
        });
    }

    async updateStep(id: string, data: UpdateTaskStepDTO): Promise<TaskStep> {
        return withAuthRetry(async () => {
            const { data: step, error } = await supabase
                .from('task_steps')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(`Error updating step: ${error.message}`);
            }
            return step;
        });
    }

    async deleteStep(id: string): Promise<void> {
        return withAuthRetry(async () => {
            const { error } = await supabase
                .from('task_steps')
                .delete()
                .eq('id', id);

            if (error) {
                throw new Error(`Error deleting step: ${error.message}`);
            }
        });
    }
}

export const taskRepository = new SupabaseTaskRepository();
