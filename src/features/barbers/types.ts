export interface Barber {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    specialty?: string;
    avatar?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBarberDto {
    name: string;
    email?: string | null;
    phone?: string | null;
    specialty?: string;
    avatar?: string;
    isActive?: boolean;
}

export interface UpdateBarberDto extends Partial<CreateBarberDto> {
    isActive?: boolean;
}
