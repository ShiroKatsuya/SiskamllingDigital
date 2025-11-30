'use client';

import dynamic from 'next/dynamic';
import PanicButton from '@/components/PanicButton';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">Loading Map...</div>
});

export default function Dashboard() {
    const [markers, setMarkers] = useState<Array<{ id: string; lat: number; lng: number; title?: string }>>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('userLocation', (data: { userId: string; lat: number; lng: number }) => {
            setMarkers((prev) => {
                const existing = prev.find((m) => m.id === data.userId);
                if (existing) {
                    return prev.map((m) => (m.id === data.userId ? { ...m, lat: data.lat, lng: data.lng } : m));
                }
                return [...prev, { id: data.userId, lat: data.lat, lng: data.lng, title: `User ${data.userId}` }];
            });
        });

        newSocket.on('panicAlert', (data: { userId: string; lat: number; lng: number }) => {
            alert(`PANIC ALERT FROM USER ${data.userId}!`);
            setMarkers((prev) => [
                ...prev,
                { id: `panic-${data.userId}-${Date.now()}`, lat: data.lat, lng: data.lng, title: `PANIC: ${data.userId}` }
            ]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Siskamling Dashboard</h1>
                <div className="text-sm text-gray-500">Lokasi Anda: Terdeteksi</div>
            </header>

            <main className="flex-1 relative">
                <div className="absolute inset-0 z-0">
                    <MapComponent markers={markers} />
                </div>

                {/* Panic Button Overlay */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                    <PanicButton userId="demo-user" />
                </div>

                {/* Stats Overlay */}
                <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-lg shadow-lg max-w-xs">
                    <h3 className="font-bold text-gray-700 mb-2">Status Lingkungan</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Petugas Aktif:</span>
                            <span className="font-bold text-green-600">5</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Laporan Hari Ini:</span>
                            <span className="font-bold text-blue-600">2</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
