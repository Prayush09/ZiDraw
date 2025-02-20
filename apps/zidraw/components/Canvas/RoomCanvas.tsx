"use client"

import {useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import { ClosedCanvas } from './ClosedCanvas';
import { WS_URL } from '@/config'

/*
* Code to build and establish a web-sockeet connection between a user and a room
* After which the user will be guided to join the canvas and create drawings.
*/



export function RoomCanvas({roomId}: {roomId: string}){
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const url = `${WS_URL}?token=${token}`
        const ws = new WebSocket(`${url}`);
        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            ws.send(data);
        }
    },[]);

    if(!socket){
        return <Loading />
    }

    return (
        <>
            <ClosedCanvas roomId={roomId} socket={socket} />
        </>
    )
}