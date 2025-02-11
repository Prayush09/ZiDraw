import { BACKEND_URL } from "@/config";
import axios, { AxiosError } from 'axios';


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


export const createRoom = async (name: string) => {
  const response = await axios({
        method: 'POST',
        url: `${BACKEND_URL}/api/create-room`,
        headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        data: {
            name: name
        }
    });

  if (!response.data) {
    throw new Error('Failed to create room');
  }

  return response.data; 
};


export async function join_Room(roomName: string){
    try{
        const response = await axios.get(`${BACKEND_URL}/api/room/${roomName}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        })
        console.log(response.data);
        return response.data;
    }catch(error){
        console.error(error);
    }
}


export async function canvasCleared(roomId: string){
    try{
        
        const deleteReq = await axios.post(
            `${BACKEND_URL}/api/chat/delete`, 
            {
            roomId: roomId
            } ,{
            headers:{
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })

        console.log("canvas cleared from DB");
        console.log(deleteReq);
    } catch(error){
        console.error(error);
    }
}