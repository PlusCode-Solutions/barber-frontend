export interface Professional {
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

export interface CreateProfessionalDto {
    name: string;
    email?: string | null;
    phone?: string | null;
    specialty?: string;
    avatar?: string;
    isActive?: boolean;
}

export interface UpdateProfessionalDto extends Partial<CreateProfessionalDto> {
    isActive?: boolean;
}
