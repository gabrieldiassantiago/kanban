import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Função para enviar mensagem via Evolution API
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
    const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://104.248.184.126:8080';
    const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME || 'intelisensor';
    const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Adicionar API Key se estiver configurada (header deve ser 'apikey' em minúsculo)
        if (EVOLUTION_API_KEY) {
            headers['apikey'] = EVOLUTION_API_KEY;
        }

        console.log('📤 Enviando mensagem para:', phoneNumber);
        console.log('🔗 URL:', `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`);

        const response = await fetch(
            `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    number: phoneNumber,
                    text: message,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Evolution API error: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Mensagem enviada com sucesso!', result);
        return result;
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
        throw error;
    }
}

// Função para formatar a data
function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export async function GET(request: Request) {
    try {
        // Verificar autorização (apenas cron jobs da Vercel podem chamar)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Criar cliente Supabase com service_role para contornar RLS
        // O cron job precisa ver TODAS as tarefas de TODOS os usuários
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleGZtemdzY2J3a2h6cnN3aWRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUzNDk2MSwiZXhwIjoyMDU2MTEwOTYxfQ.UPw5-FTaXQ3GoMV_JoOK0mQ8mitcJCjYejUHwNCUi2c';

        if (!supabaseServiceKey) {
            console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada!');
            return NextResponse.json(
                { error: 'Server configuration error', details: 'SUPABASE_SERVICE_ROLE_KEY is required' },
                { status: 500 }
            );
        }

        const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Buscar tarefas atrasadas (scheduled_time < agora e status != DONE)
        const now = new Date().toISOString();

        // Debug: Buscar TODAS as tarefas com scheduled_time
        const { data: allTasksDebug } = await supabase
            .from('tasks')
            .select('id, title, scheduled_time, status, user_id')
            .not('scheduled_time', 'is', null)
            .order('scheduled_time', { ascending: true })
            .limit(10);

        console.log('🔍 Debug - TODAS as tarefas com scheduled_time:');
        console.log(JSON.stringify(allTasksDebug, null, 2));

        const { data: overdueTasks, error } = await supabase
            .from('tasks')
            .select(`
        id,
        title,
        description,
        scheduled_time,
        priority,
        status,
        user_id,
        profiles:user_id (
          id,
          full_name,
          email
        )
      `)
            .lt('scheduled_time', now)
            .neq('status', 'DONE')
            .order('scheduled_time', { ascending: true });

        console.log('🔍 Debug Info:');
        console.log('Horário atual (now):', now);
        console.log('Tarefas encontradas:', overdueTasks?.length || 0);
        if (overdueTasks && overdueTasks.length > 0) {
            console.log('Primeiras tarefas:', JSON.stringify(overdueTasks.slice(0, 3), null, 2));
        }

        if (error) {
            console.error('Erro ao buscar tarefas atrasadas:', error);
            return NextResponse.json(
                { error: 'Database error', details: error.message },
                { status: 500 }
            );
        }

        if (!overdueTasks || overdueTasks.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Nenhuma tarefa atrasada encontrada',
                count: 0,
            });
        }

        // Agrupar tarefas por usuário
        const tasksByUser: Record<string, any> = {};

        for (const task of overdueTasks) {
            const userId = task.user_id;
            const userProfile = Array.isArray(task.profiles) ? task.profiles[0] : task.profiles;

            if (!tasksByUser[userId]) {
                tasksByUser[userId] = {
                    user: userProfile,
                    tasks: [],
                };
            }
            tasksByUser[userId].tasks.push(task);
        }

        const results = [];

        // Enviar mensagem para cada usuário com suas tarefas atrasadas
        for (const [userId, data] of Object.entries(tasksByUser)) {
            const { user, tasks } = data;

            // Montar mensagem
            let message = `🚨 *ALERTA DE TAREFAS ATRASADAS* 🚨\n\n`;
            message += `Olá ${user.full_name || 'usuário'}!\n\n`;
            message += `Você tem ${tasks.length} tarefa(s) atrasada(s):\n\n`;

            tasks.forEach((task: any, index: number) => {
                const scheduledDate = new Date(task.scheduled_time);
                const priorityEmojis: Record<string, string> = {
                    LOW: '🟢',
                    MEDIUM: '🟡',
                    HIGH: '🟠',
                    URGENT: '🔴',
                };
                const priorityEmoji = priorityEmojis[task.priority] || '⚪';

                message += `${index + 1}. ${priorityEmoji} *${task.title}*\n`;
                message += `   📅 Prazo: ${formatDate(scheduledDate)}\n`;
                if (task.description) {
                    message += `   📝 ${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}\n`;
                }
                message += `   Status: ${task.status === 'TODO' ? '📋 A Fazer' : '⚙️ Em Progresso'}\n\n`;
            });

            message += `\n⚡ Acesse o sistema para atualizar suas tarefas!`;

            try {
                // Usar número padrão configurado no .env
                const DEFAULT_PHONE = process.env.DEFAULT_NOTIFICATION_PHONE || '5512981082276';

                await sendWhatsAppMessage(DEFAULT_PHONE, message);

                results.push({
                    userId,
                    userName: user.full_name,
                    email: user.email,
                    phone: DEFAULT_PHONE,
                    tasksCount: tasks.length,
                    status: 'sent',
                });
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Erro ao enviar mensagem para ${user.email}:`, error);

                const DEFAULT_PHONE = process.env.DEFAULT_NOTIFICATION_PHONE || '5512981082276';

                results.push({
                    userId,
                    userName: user.full_name,
                    email: user.email,
                    phone: DEFAULT_PHONE,
                    tasksCount: tasks.length,
                    status: 'error',
                    error: errorMessage,
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processadas ${overdueTasks.length} tarefas atrasadas de ${Object.keys(tasksByUser).length} usuário(s)`,
            totalOverdueTasks: overdueTasks.length,
            usersNotified: Object.keys(tasksByUser).length,
            results,
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Erro no cron job:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: errorMessage },
            { status: 500 }
        );
    }
}
