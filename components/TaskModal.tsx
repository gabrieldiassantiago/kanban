'use client';

import { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, TaskStep } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlignLeft, Tag, Activity, ListTodo, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { clsx } from 'clsx';
import { taskService } from '@/lib/services/TaskService';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: any) => Promise<void>;
    task?: Task | null;
    initialStatus?: TaskStatus | null;
}

export function TaskModal({ isOpen, onClose, onSave, task, initialStatus }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [scheduledTime, setScheduledTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Steps State
    const [steps, setSteps] = useState<TaskStep[]>([]);
    const [newStepTitle, setNewStepTitle] = useState('');
    const [isAddingStep, setIsAddingStep] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setTitle(task.title);
                setDescription(task.description || '');
                setPriority(task.priority);
                setStatus(task.status);

                // Fetch steps
                taskService.getSteps(task.id).then(setSteps).catch(console.error);

                if (task.scheduled_time) {
                    try {
                        const date = new Date(task.scheduled_time);
                        // Ajuste para input datetime-local (yyyy-MM-ddThh:mm)
                        // Usando formatação manual para garantir fuso horário local correto
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        setScheduledTime(`${year}-${month}-${day}T${hours}:${minutes}`);
                    } catch (e) {
                        console.error("Erro ao formatar data", e);
                        setScheduledTime('');
                    }
                } else {
                    setScheduledTime('');
                }
            } else {
                // Reset para nova tarefa
                setTitle('');
                setDescription('');
                setPriority(TaskPriority.MEDIUM);
                // Usa o status inicial se fornecido (clique no + da coluna), senão usa TODO
                setStatus(initialStatus || TaskStatus.TODO);
                setScheduledTime('');
                setSteps([]);
            }
        }
    }, [task, isOpen, initialStatus]);

    const handleAddStep = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStepTitle.trim() || !task) return;

        try {
            const newStep = await taskService.createStep({
                task_id: task.id,
                title: newStepTitle.trim(),
                position: steps.length
            });
            setSteps([...steps, newStep]);
            setNewStepTitle('');
        } catch (error) {
            console.error('Error adding step:', error);
            alert('Erro ao adicionar etapa');
        }
    };

    const handleToggleStep = async (step: TaskStep) => {
        try {
            // Optimistic update
            const updatedSteps = steps.map(s =>
                s.id === step.id ? { ...s, is_completed: !s.is_completed } : s
            );
            setSteps(updatedSteps);

            await taskService.updateStep(step.id, {
                is_completed: !step.is_completed
            });
        } catch (error) {
            console.error('Error updating step:', error);
            // Revert on error
            taskService.getSteps(task!.id).then(setSteps);
        }
    };

    const handleDeleteStep = async (stepId: string) => {
        try {
            // Optimistic update
            setSteps(steps.filter(s => s.id !== stepId));
            await taskService.deleteStep(stepId);
        } catch (error) {
            console.error('Error deleting step:', error);
            // Revert
            taskService.getSteps(task!.id).then(setSteps);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            const taskData = {
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                status,
                scheduled_time: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
            };
            await onSave(taskData);
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Erro ao salvar tarefa. Tente novamente.');
        } finally {
            // ALWAYS reset loading state, even on error
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {task ? 'Editar Tarefa' : 'Nova Tarefa'}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body Scrolável */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <form id="task-form" onSubmit={handleSubmit} className="space-y-6">

                                    {/* Título */}
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="O que precisa ser feito?"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 p-2 text-lg font-semibold placeholder:text-slate-300 border-none focus:ring-0 focus:outline-none p-0 text-slate-800"
                                        />
                                    </div>

                                    {/* Status e Prioridade Custom Selector */}
                                    <div className="space-y-6">
                                        {/* Seletor de Status */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Activity size={12} /> Status
                                            </label>
                                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                                {[
                                                    { value: TaskStatus.TODO, label: 'A Fazer' },
                                                    { value: TaskStatus.IN_PROGRESS, label: 'Em Progresso' },
                                                    { value: TaskStatus.DONE, label: 'Concluído' }
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => setStatus(option.value)}
                                                        className={clsx(
                                                            "py-2 text-sm font-medium rounded-2xl transition-all duration-200",
                                                            status === option.value
                                                                ? "bg-white text-indigo-600 rounded-2xl shadow-sm ring-1 ring-slate-200"
                                                                : "text-slate-500 hover:text-slate-700 rounded-2xl hover:bg-slate-200/50"
                                                        )}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Seletor de Prioridade - Pills Coloridas */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <Tag size={12} /> Prioridade
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { value: TaskPriority.LOW, label: 'Baixa', color: 'bg-slate-100 text-slate-600 hover:bg-slate-200', active: 'bg-slate-600 text-white ring-2 ring-slate-200' },
                                                    { value: TaskPriority.MEDIUM, label: 'Média', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', active: 'bg-blue-500 text-white ring-2 ring-blue-200' },
                                                    { value: TaskPriority.HIGH, label: 'Alta', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100', active: 'bg-orange-500 text-white ring-2 ring-orange-200' },
                                                    { value: TaskPriority.URGENT, label: 'Urgente', color: 'bg-red-50 text-red-600 hover:bg-red-100', active: 'bg-red-500 text-white ring-2 ring-red-200' }
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => setPriority(option.value)}
                                                        className={clsx(
                                                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border border-transparent",
                                                            priority === option.value ? option.active : option.color
                                                        )}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Descrição */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <AlignLeft size={12} /> Descrição
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            placeholder="Adicione mais detalhes sobre esta tarefa..."
                                            className="w-full focus:outline-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl  block p-4 resize-none transition-all focus:bg-white"
                                        />
                                    </div>

                                    {/* Etapas / Checklist (Apenas se a tarefa já existir) */}
                                    {task && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <ListTodo size={12} /> Etapas
                                                <span className="text-slate-300 text-[10px] font-normal ml-auto">
                                                    {steps.filter(s => s.is_completed).length}/{steps.length}
                                                </span>
                                            </label>

                                            <div className="space-y-2">
                                                {/* Lista de Steps */}
                                                <div className="space-y-1">
                                                    {steps.map((step) => (
                                                        <div key={step.id} className="group flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleStep(step)}
                                                                className={clsx(
                                                                    "flex-shrink-0 transition-colors",
                                                                    step.is_completed ? "text-green-500" : "text-slate-300 hover:text-slate-400"
                                                                )}
                                                            >
                                                                {step.is_completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                            </button>
                                                            <span className={clsx(
                                                                "flex-grow text-sm transition-all",
                                                                step.is_completed ? "text-slate-400 line-through" : "text-slate-700"
                                                            )}>
                                                                {step.title}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteStep(step.id)}
                                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Adicionar Step */}
                                                <div className="mt-2">
                                                    {isAddingStep ? (
                                                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                            <input
                                                                type="text"
                                                                value={newStepTitle}
                                                                onChange={(e) => setNewStepTitle(e.target.value)}
                                                                placeholder="Nova etapa..."
                                                                className="flex-grow bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleAddStep(e);
                                                                    } else if (e.key === 'Escape') {
                                                                        setIsAddingStep(false);
                                                                        setNewStepTitle('');
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleAddStep}
                                                                disabled={!newStepTitle.trim()}
                                                                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-50"
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsAddingStep(false);
                                                                    setNewStepTitle('');
                                                                }}
                                                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAddingStep(true)}
                                                            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors w-full"
                                                        >
                                                            <Plus size={16} />
                                                            Adicionar etapa
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Data */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar size={12} /> Data de Entrega
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                        />
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    form="task-form"
                                    type="submit"
                                    disabled={isLoading || !title.trim()}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                                >
                                    {isLoading ? 'Salvando...' : task ? 'Salvar Alterações' : 'Criar Tarefa'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
