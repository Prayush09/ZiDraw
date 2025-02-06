import { PRIVATE_IP_BACKEND_URL } from "@/config";
import axios, { AxiosError } from 'axios';
import {prismaClient} from '../../../../packages/db-package/src/index'

export async function getExistingShapes(roomId: string){
    console.log(roomId);
    const response = await axios.get(`${PRIVATE_IP_BACKEND_URL}/api/chats/${roomId}`, {
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
        url: `${PRIVATE_IP_BACKEND_URL}/api/create-room`,
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


/*************  ✨ Codeium Command ⭐  *************/
    /**
     * Given a room name, this function will make a GET request to the server to try and join the room.
     * If the room does not exist, the server will return a 404 and this function will return undefined.
     * If the room exists, the server will return the room object and this function will return that object.
     * 
     * @param roomName The name of the room to try and join.
/******  a17a3010-bac8-470a-a5f5-e05816dc753d  *******/
export async function join_Room(roomName: string){
    try{
        const response = await axios.get(`${PRIVATE_IP_BACKEND_URL}/api/room/${roomName}`, {
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
            `${PRIVATE_IP_BACKEND_URL}/api/chat/delete`, 
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