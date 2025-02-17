import { RoomCanvas } from '@/components/Canvas/RoomCanvas';

export default async function CanvasPage({ params }: { params: { roomId: string } }) {
    const roomId = params.roomId;

    return <RoomCanvas roomId={roomId} />;
}
