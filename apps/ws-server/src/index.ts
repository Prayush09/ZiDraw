import { WebSocketServer, WebSocket } from "ws";
import jwt, {JwtPayload} from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from '@repo/db-package/prisma';

const websocketserver = new WebSocketServer({host: '0.0.0.0', port: 8080 }, () => {
    console.log("Websocket server is running on port 8080");
});

function checkUser(token: string): string | null {
    try{
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        if(decoded.userId === 'string'){
            return null;
        }

        if(!decoded || !decoded.userId){
            return null;
        }

        return decoded.userId;
    }
    catch(e){
        return null;
    }
}

interface User{
    ws: WebSocket, 
    rooms: string[],
    userid: string
}

//ugly state management using a global array that stores the rooms and ws socket connection of those rooms for each user.
const users: User[] = [];



websocketserver.on("connection", function connection(ws, request){
    const url = request.url;

    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token") || "";
    const userid = checkUser(token);
    
    if(!userid){
        ws.send("Invalid token");
        ws.close();
        return;
    }

    users.push({
        userid, 
        rooms: [],
        ws
    })
    
    ws.on('message', async function message(data){
        const parsedData = JSON.parse(data as unknown as string);

        if(parsedData.type === 'join_room'){
            const user = users.find((user) => user.ws === ws);
            //you should add alot of error handling here, but for the sake of simplicity I'm not doing that.
            user?.rooms.push(parsedData.roomId);
        }


        if(parsedData.type === 'leave_room'){
            const user = users.find((user) => user.ws === ws);

            if(!user){
                return;
            }

            user.rooms = user.rooms.filter((room) => room !== parsedData.roomId);
        }

        if(parsedData.type === 'chat'){
            const roomId = Number(parsedData.roomId);
            const message = parsedData.message;

            await prismaClient.chat.create({
                data: {
                    roomId,
                    message,
                    userId: userid
                }
            })

            users.forEach(user => {
                if(user.rooms.includes(roomId.toString())){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message,
                        roomId
                    }))
                }
            })
        }

        if(parsedData.type === 'clearCanvas'){
            const roomId = parsedData.roomId;
            users.forEach(user => {
                if(user.rooms.includes(roomId.toString())){
                    user.ws.send(JSON.stringify({
                        type: "clearCanvas",
                        roomId
                    }));
                }
            });
        }
    })
})