'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationType } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationsPopoverProps {
    userId?: string;
}

export function NotificationsPopover({ userId }: NotificationsPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications(userId);

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getNotificationIcon = (type: NotificationType) => {
        const iconClass = "w-4 h-4";

        switch (type) {
            case NotificationType.TASK_ASSIGNED:
                return <Bell className={iconClass} />;
            case NotificationType.TASK_COMPLETED:
                return <Check className={iconClass} />;
            case NotificationType.TASK_OVERDUE:
                return <Bell className={iconClass} />;
            default:
                return <Bell className={iconClass} />;
        }
    };

    const getNotificationColor = (type: NotificationType) => {
        switch (type) {
            case NotificationType.TASK_ASSIGNED:
                return 'bg-blue-100 text-blue-600';
            case NotificationType.TASK_COMPLETED:
                return 'bg-green-100 text-green-600';
            case NotificationType.TASK_OVERDUE:
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="relative" ref={popoverRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-500 hover:bg-slate-50 rounded-full relative transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full">
                        <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></span>
                    </span>
                )}
            </button>

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 origin-top-right"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    Notificações
                                </h3>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
                                    </p>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    Carregando...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">
                                        Nenhuma notificação
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={markAsRead}
                                            onDelete={deleteNotification}
                                            getIcon={getNotificationIcon}
                                            getColor={getNotificationColor}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    getIcon: (type: NotificationType) => React.JSX.Element;
    getColor: (type: NotificationType) => string;
}

function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    getIcon,
    getColor,
}: NotificationItemProps) {
    return (
        <div
            className={clsx(
                "p-4 hover:bg-slate-50 transition-colors group",
                !notification.is_read && "bg-indigo-50/30"
            )}
        >
            <div className="flex gap-3">
                {/* Icon */}
                <div className={clsx(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    getColor(notification.type)
                )}>
                    {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <p className={clsx(
                                "text-sm",
                                notification.is_read ? "text-slate-600" : "text-slate-900 font-medium"
                            )}>
                                {notification.title}
                            </p>
                            {notification.message && (
                                <p className="text-xs text-slate-500 mt-1">
                                    {notification.message}
                                </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                    addSuffix: true,
                                    locale: ptBR,
                                })}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.is_read && (
                                <button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                                    title="Marcar como lida"
                                >
                                    <Check size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(notification.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                title="Excluir"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
