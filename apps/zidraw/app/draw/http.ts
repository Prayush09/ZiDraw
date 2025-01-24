import { BACKEND_URL } from "@/config";
import axios from 'axios';

export async function getExistingShapes(roomId: string){
    const response = await axios.get(`${BACKEND_URL}/chat/${roomId}`);
    const savedShapes = response.data.messages;

    const shapes = savedShapes.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message);

        return messageData.shape;
    })

    return shapes;
}