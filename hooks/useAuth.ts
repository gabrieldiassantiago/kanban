'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '@/lib/services/AuthService';
import { Profile } from '@/types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authService.getSession()
            .then(async (session) => {
                setUser(session?.user ?? null);

                if (session?.user) {
                    try {
                        const userProfile = await authService.getProfile(session.user.id);
                        setProfile(userProfile);
                    } catch (e) {
                        console.error('Error fetching profile', e);
                    }
                }
            })
            .catch((err) => {
                console.error('Auth check failed', err);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });

        // Escuta mudanças de autenticação
        const { data: { subscription } } = authService.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);

                if (session?.user) {
                    const userProfile = await authService.getProfile(session.user.id);
                    setProfile(userProfile);
                } else {
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        user,
        profile,
        loading,
        isAuthenticated: !!user,
    };
}
