import axios from "../../../lib/axios";

// loginRequest function
export const loginRequest = (email: string, password: string) =>
    axios.post("/auth/login", { email, password });
