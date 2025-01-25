import { BACKEND_URL } from "@/config";
import axios from 'axios';

export async function getExistingShapes(roomId: string){
    console.log(roomId);
    const response = await axios.get(`${BACKEND_URL}/api/chats/${roomId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const savedShapes = response.data.messages;

    const shapes = savedShapes.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message);

        return messageData.shape;
    })

    return shapes;
}


export async function createRoom(roomName: string) {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/api/create-room`,
            { name: roomName }, 
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

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
        console.error(error);
    }
}


export async function join_Room(roomName: string){
    try{
        const response = await axios.get(`${BACKEND_URL}/api/room/${roomName}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        })
        
        return response.data;
    }catch(error){
        console.error(error);
    }
}