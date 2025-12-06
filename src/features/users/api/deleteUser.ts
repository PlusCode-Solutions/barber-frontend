import axios from "../../../lib/axios";

export const deleteUser = async (id: string): Promise<void> => {
    await axios.delete(`/users/${id}`);
};
