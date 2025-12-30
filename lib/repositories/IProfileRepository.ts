import { Profile } from "@/types";

export interface IProfileRepository {
    updateAvatar(userId: string, file: File): Promise<Profile>;
    getProfile(userId: string): Promise<Profile>;
}