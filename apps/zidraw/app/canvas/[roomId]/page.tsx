"use client"

import { RoomCanvas } from '@/components/Canvas/RoomCanvas';
import { useParams } from 'next/navigation';

export default function CanvasPage() {
    const params = useParams();
    const roomId = params.roomId as string;

    return <RoomCanvas roomId={roomId} />;
}