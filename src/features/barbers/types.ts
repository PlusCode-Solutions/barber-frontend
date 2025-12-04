export interface Barber {
    id: string;
    name: string;
    email: string;
    phone?: string;
    specialty?: string;
    avatar?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBarberDto {
    name: string;
    email: string;
    phone?: string;
    specialty?: string;
    avatar?: string;
}
