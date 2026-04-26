export interface Service {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    durationMinutes: number;
    createdAt?: string;
    updatedAt?: string;
}
