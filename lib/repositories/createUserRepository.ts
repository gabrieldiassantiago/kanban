import { supabase } from "../supabase";
import { CreateUserParams, ICreateUserRepository } from "./ICreateUserRepository";

export class CreateUserRepository implements ICreateUserRepository {
    async createUser(data: CreateUserParams): Promise<void> {
        const { data: user, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name
                },
            },
        }
        );

        if (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }

    }
}