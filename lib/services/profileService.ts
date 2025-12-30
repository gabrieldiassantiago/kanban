import { Profile } from '@/types';
import { IProfileRepository } from '../repositories/IProfileRepository';
import { profileRepository } from '../repositories/SupabaseProfileRepository';

export class ProfileService {
    constructor(private repository: IProfileRepository) { }


    async updateAvatar(userId: string, file: File): Promise<Profile> {
        // Validações de regra de negócio (ex: tamanho, tipo)
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            throw new Error('A imagem deve ter no máximo 5MB');
        }

        if (!file.type.startsWith('image/')) {
            throw new Error('O arquivo deve ser uma imagem');
        }

        return profileRepository.updateAvatar(userId, file);
    }

    async getProfile(userId: string): Promise<Profile> {
        return profileRepository.getProfile(userId);
    }

    async generateCodeIsKanban(userId: string): Promise<string> {
        return profileRepository.generateCodeIsKanban(userId);
    }
}

// Exporta instância já com o repositório injetado
export const profileService = new ProfileService(profileRepository);