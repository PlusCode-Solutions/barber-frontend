import axios from "../../../lib/axios";
import type { Schedule } from "../types";

export async function getTenantSchedules(): Promise<Schedule[]> {
    const res = await axios.get('/schedules');
    return res.data;
}
