import axios from "../../../lib/axios";
import type { User } from "../types";

export const getTenantUsers = async (): Promise<User[]> => {
    const { data } = await axios.get<User[]>("/users"); // Backend handles tenant filtering via token
    return data;
};
