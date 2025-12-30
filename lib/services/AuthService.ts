import { supabase } from '../supabase';
import { Profile } from '@/types';

export class AuthService {

    /**
     * Realiza o login do usuário
     */

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Registra um novo usuário
     */

    async signUp(email: string, password: string, fullName?: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Realiza o logout
     */

    async signOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(error.message);
        }
    }

    /**
     * Obtém o usuário atual
     */

    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            throw new Error(error.message);
        }

        return user;
    }

    /**
     * Obtém a sessão atual
     */

    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            throw new Error(error.message);
        }

        return session;
    }

    /**
     * Obtém o perfil do usuário
     */

    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Atualiza o perfil do usuário
     */

    async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Observa mudanças no estado de autenticação
     */

    onAuthStateChange(callback: (event: string, session: any) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
}

export const authService = new AuthService();
