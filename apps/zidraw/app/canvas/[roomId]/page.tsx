"use client"

import { RoomCanvas } from '@/components/Canvas/RoomCanvas';
import { useSearchParams } from 'next/navigation';

export default function CanvasPage() {
    const params = useSearchParams();
    const roomId = params.get("roomId");

    return <RoomCanvas roomId={roomId!} />;
}