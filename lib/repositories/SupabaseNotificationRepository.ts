import { supabase } from '../supabase';
import { Notification, CreateNotificationDTO, NotificationType } from '@/types';
import { INotificationRepository } from './INotificationRepository';
import { withAuthRetry } from '../utils/authRetry';

export class SupabaseNotificationRepository implements INotificationRepository {
    private readonly tableName = 'notifications';

    async findAll(userId: string, limit: number = 20): Promise<Notification[]> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(`Error fetching notifications: ${error.message}`);
            }

            return data || [];
        });
    }

    async findUnread(userId: string): Promise<Notification[]> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('user_id', userId)
                .eq('is_read', false)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Error fetching unread notifications: ${error.message}`);
            }

            return data || [];
        });
    }

    async create(notificationData: CreateNotificationDTO): Promise<Notification> {
        return withAuthRetry(async () => {
            const { data, error } = await supabase
                .from(this.tableName)
                .insert({
                    ...notificationData,
                    type: notificationData.type || NotificationType.SYSTEM,
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Error creating notification: ${error.message}`);
            }

            return data;
        });
    }

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        return withAuthRetry(async () => {
            const { error } = await supabase
                .from(this.tableName)
                .update({ is_read: true })
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error marking notification as read: ${error.message}`);
            }
        });
    }

    async markAllAsRead(userId: string): Promise<void> {
        return withAuthRetry(async () => {
            const { error } = await supabase
                .from(this.tableName)
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) {
                throw new Error(`Error marking all notifications as read: ${error.message}`);
            }
        });
    }

    async delete(notificationId: string, userId: string): Promise<void> {
        return withAuthRetry(async () => {
            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error deleting notification: ${error.message}`);
            }
        });
    }
}

export const notificationRepository = new SupabaseNotificationRepository();
