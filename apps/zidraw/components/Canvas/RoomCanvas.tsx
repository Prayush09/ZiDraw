"use client"

import {useEffect, useState, useRef } from 'react'
import Loading from '@/components/ui/loading'

/*
* Code to build and establish a web-sockeet connection between a user and a room
* After which the user will be guided to join the canvas and create drawings.
*/



export function RoomCanvas({roomId}: {roomId: string}){
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const url = `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
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

    //TODO: show the canvas here
    return (
        <>
            Show the paid canvas
        </>
    )
}