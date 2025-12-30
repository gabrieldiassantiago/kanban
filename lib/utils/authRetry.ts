import { supabase } from '../supabase';

/**
 * Wrapper para executar operações do Supabase com retry automático em caso de falha de autenticação
 * Isso garante que se a sessão expirou, tentamos renová-la antes de reportar erro
 */
export async function withAuthRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 1
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Tenta executar a operação
            return await operation();
        } catch (error: any) {
            lastError = error;

            // Se é o primeiro erro e parece ser de autenticação, tenta refresh
            if (attempt === 0 && isAuthError(error)) {
                console.warn('Auth error detected, attempting to refresh session...');

                try {
                    // Força refresh da sessão
                    const { data, error: refreshError } = await supabase.auth.refreshSession();

                    if (refreshError) {
                        console.error('Session refresh failed:', refreshError);
                        throw error; // Re-throw o erro original
                    }

                    if (data.session) {
                        console.log('Session refreshed successfully, retrying operation...');
                        // Continua para a próxima iteração do loop para retry
                        continue;
                    }
                } catch (refreshError) {
                    console.error('Error during session refresh:', refreshError);
                    throw error; // Re-throw o erro original
                }
            }

            // Se não é erro de auth ou já tentamos refresh, throw
            throw error;
        }
    }

    throw lastError || new Error('Operation failed');
}

/**
 * Verifica se um erro é relacionado a autenticação
 */

function isAuthError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    // Códigos e mensagens comuns de erros de autenticação
    const authErrorIndicators = [
        'jwt',
        'token',
        'unauthorized',
        'authentication',
        'auth',
        'session',
        'expired',
        '401',
        'pgrst301', // PostgREST auth error
    ];

    return authErrorIndicators.some(indicator =>
        errorMessage.includes(indicator) || errorCode.includes(indicator)
    );
}
