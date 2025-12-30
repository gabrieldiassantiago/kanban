'use server'

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function updateAvatarAction(formData: FormData) {
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
        throw new Error('Arquivo ou ID do usuário faltando');
    }

    const supabase = await createClient();

    // 1. Validar servidor
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 5MB');
    }

    // 2. Upload
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

    if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // 3. Obter URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

    // 4. Update Profile
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

    if (updateError) {
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
    }

    revalidatePath('/dashboard');

    return publicUrl;
}
