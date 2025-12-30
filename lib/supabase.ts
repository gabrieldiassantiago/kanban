import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Habilita auto-refresh de sessão
        autoRefreshToken: true,
        // Persiste a sessão entre reloads
        persistSession: true,
        // Detecta quando a sessão está próxima de expirar e renova automaticamente
        detectSessionInUrl: true,
        // Storage para persistir a sessão
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Flow para renovação automática
        flowType: 'pkce',
    },
    global: {
        headers: {
            'x-client-info': 'kanban-app',
        },
    },
});
