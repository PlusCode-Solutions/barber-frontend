import axios from "../../../lib/axios";

export const registerRequest = (data: {
    name: string;
    email: string;
    password: string;
    tenantId: string;
}) => axios.post("/users", data);
