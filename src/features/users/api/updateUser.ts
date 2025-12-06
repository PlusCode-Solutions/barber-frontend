import axios from "../../../lib/axios";
import type { User, UpdateUserDto } from "../types";

export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
    const { data: updatedUser } = await axios.patch<User>(`/users/${id}`, data);
    return updatedUser;
};
