import { RoomCanvas } from '@/components/Canvas/RoomCanvas';

type Params = Promise<{ roomId: string }>;

export default async function CanvasPage({ params }: { params: Params }) {
    const { roomId } = await params;

    return <RoomCanvas roomId={roomId} />;
}
