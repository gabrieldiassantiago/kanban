import { Notification, CreateNotificationDTO } from '@/types';

export interface INotificationRepository {
    findAll(userId: string, limit?: number): Promise<Notification[]>;
    findUnread(userId: string): Promise<Notification[]>;
    create(data: CreateNotificationDTO): Promise<Notification>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    delete(notificationId: string, userId: string): Promise<void>;
}
