import { RoleDTO } from "./role.dto";

export interface IPhoneDTO {
  type: string;
  number: string;
}


export interface CreateUserDTO {
    username: string;
    password: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    address?: {
        area?: string;
        street?: string;
        number?: string;
        po?: string;
    };
    phone?: IPhoneDTO[];
    roles?: string;
}

export interface UserResponseDTO {
    id: string;
    username: string;
    password: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    address?: {
        area?: string;
        street?: string;
        number?: string;
        po?: string;
    };
    phone?: IPhoneDTO[];
    roles?: string;
}

export interface UpdateUserDTO {
    password: string;
    firstname?: string;
    lastname?: string;
    email: string;
    address?: {
        area?: string;
        street?: string;
        number?: string;
        po?: string;
    };
    phone?: IPhoneDTO[];
    roles?: string[];
}