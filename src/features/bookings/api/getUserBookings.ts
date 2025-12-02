import axios from "../../../lib/axios";

export async function getUserBookings(userId: string, token: string) {
    const res = await axios.get(`/bookings/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
}
