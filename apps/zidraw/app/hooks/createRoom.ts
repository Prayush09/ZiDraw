import { BACKEND_URL } from '@/config'
import axios from 'axios'

export async function createRoom(roomName: string) {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/room`, {roomName});
        if (!response.data) {
            throw new Error("Invalid room creation response");
        }
        return response.data;
    } catch (error) {   
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 409) {
                throw new Error("Room already exists");
            }
        }
        throw error;
    }
}