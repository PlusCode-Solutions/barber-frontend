import type { UserRole } from "../../config/roles";

export interface User {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    avatar?: string;
    tenantId?: string;
    createdAt: string;
    updatedAt: string;
    // Add other fields from UserResponseDto if needed
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
    avatar?: string;
}
