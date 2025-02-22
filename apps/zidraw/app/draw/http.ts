import { BACKEND_URL } from "@/config";
import axios from 'axios';

//TODO: DO GIT PULL ON VM's

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

/*

    events {
    # Event directives...
}

http {
	server {
        listen 80;
        server_name dev-http.zidraw.com;

        location / {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
	}

	server {
        listen 80;
        server_name dev-ws.zidraw.com;

        location / {
            proxy_pass http://localhost:8080;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
	}

    server {
        listen 80;
        server_name dev.zidraw.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
	}
}

*/