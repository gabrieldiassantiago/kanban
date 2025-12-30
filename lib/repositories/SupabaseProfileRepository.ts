import { Profile } from '@/types';
import { supabase } from '../supabase';
import { IProfileRepository } from './IProfileRepository';
import { withAuthRetry } from '../utils/authRetry';

export class SupabaseProfileRepository implements IProfileRepository {


    async updateAvatar(userId: string, file: File): Promise<Profile> {
        return withAuthRetry(async () => {

            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) {
                throw new Error(`Erro no upload da imagem: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId);

            if (updateError) {
                throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
            }

            return {
                id: userId,
                avatar_url: publicUrl,
                email: '',
                full_name: '',
                created_at: '',
                updated_at: '',
            };
        });
    }

    async getProfile(userId: string): Promise<Profile> {
        return withAuthRetry(async () => {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                throw new Error(`Erro ao buscar perfil: ${error.message}`);
            }

            return profile;
        });
    }




}

export const profileRepository = new SupabaseProfileRepository();