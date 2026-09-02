import axios from "axios";
import { cookies } from "next/headers";
import { BASE_API_URL } from "./config/apiConfig";

export async function authClient() {
    const cookieStore = await cookies();
    const token = cookieStore.get("clientAccessToken")?.value;

    return axios.create({
        baseURL: BASE_API_URL,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        withCredentials: true,
        timeout: 30000,
    });
}
