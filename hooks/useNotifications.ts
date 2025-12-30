'use client';

import { useEffect, useState } from 'react';
import { notificationService } from '@/lib/services/NotificationService';
import { Notification } from '@/types';
import { supabase } from '@/lib/supabase';

export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        // Carrega notificações iniciais
        const loadNotifications = async () => {
            try {
                const data = await notificationService.getAllNotifications(userId);
                setNotifications(data);

                const count = await notificationService.getUnreadCount(userId);
                setUnreadCount(count);
            } catch (error) {
                console.error('Error loading notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();

        // Configura Realtime para escutar novas notificações
        const channel = supabase
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;

                    // Adiciona no topo da lista
                    setNotifications(prev => [newNotification, ...prev]);

                    // Incrementa contador de não lidas
                    if (!newNotification.is_read) {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const updatedNotification = payload.new as Notification;

                    // Atualiza na lista
                    setNotifications(prev =>
                        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
                    );

                    // Recalcula contador
                    if (updatedNotification.is_read) {
                        setUnreadCount(prev => Math.max(0, prev - 1));
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const deletedId = payload.old.id;

                    setNotifications(prev => prev.filter(n => n.id !== deletedId));

                    // Recalcula contador se era não lida
                    if (!payload.old.is_read) {
                        setUnreadCount(prev => Math.max(0, prev - 1));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const markAsRead = async (notificationId: string) => {
        if (!userId) return;

        try {
            await notificationService.markAsRead(notificationId, userId);
            // O Realtime vai atualizar automaticamente via UPDATE event
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!userId) return;

        try {
            await notificationService.markAllAsRead(userId);

            // Atualiza localmente
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        if (!userId) return;

        try {
            await notificationService.deleteNotification(notificationId, userId);
            // O Realtime vai atualizar automaticamente via DELETE event
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    };
}
