export interface CreateUserParams {
    email: string;
    password: string;
    name: string;
}

export interface ICreateUserRepository {
    createUser(data: CreateUserParams): Promise<void>;
}