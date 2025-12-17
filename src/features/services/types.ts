export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number; // Campo del backend
    createdAt?: string;
    updatedAt?: string;
}
