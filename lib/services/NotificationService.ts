import { Notification, CreateNotificationDTO } from '@/types';
import { INotificationRepository } from '../repositories/INotificationRepository';
import { notificationRepository } from '../repositories/SupabaseNotificationRepository';

export class NotificationService {
    constructor(private repository: INotificationRepository) { }

    /**
     * Lista todas as notificações do usuário
     */
    async getAllNotifications(userId: string, limit?: number): Promise<Notification[]> {
        return this.repository.findAll(userId, limit);
    }

    /**
     * Lista apenas notificações não lidas
     */
    async getUnreadNotifications(userId: string): Promise<Notification[]> {
        return this.repository.findUnread(userId);
    }

    /**
     * Cria uma nova notificação
     */
    async createNotification(data: CreateNotificationDTO): Promise<Notification> {
        if (!data.title || data.title.trim() === '') {
            throw new Error('O título da notificação é obrigatório');
        }

        return this.repository.create(data);
    }

    /**
     * Marca uma notificação como lida
     */
    async markAsRead(notificationId: string, userId: string): Promise<void> {
        return this.repository.markAsRead(notificationId, userId);
    }

    /**
     * Marca todas as notificações como lidas
     */
    async markAllAsRead(userId: string): Promise<void> {
        return this.repository.markAllAsRead(userId);
    }

    /**
     * Deleta uma notificação
     */
    async deleteNotification(notificationId: string, userId: string): Promise<void> {
        return this.repository.delete(notificationId, userId);
    }

    /**
     * Conta notificações não lidas
     */
    async getUnreadCount(userId: string): Promise<number> {
        const unread = await this.repository.findUnread(userId);
        return unread.length;
    }
}

export const notificationService = new NotificationService(notificationRepository);
