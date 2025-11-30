'use client';

import { useState } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useNotifications } from '@/providers/NotificationProvider';

interface PanicButtonProps {
    userId: string;
}

const PanicButton = ({ userId }: PanicButtonProps) => {
    const { socket, isConnected } = useSocket();
    const { addNotification } = useNotifications();
    const [isActive, setIsActive] = useState(false);

    const handlePanic = () => {
        if (!socket || !isConnected) {
            alert('Not connected to server. Please try again.');
            return;
        }

        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                socket.emit('panic', { userId, lat: latitude, lng: longitude });
                setIsActive(true);

                addNotification({
                    type: 'success',
                    title: '✅ Alarm Terkirim!',
                    message: 'Bantuan sedang dalam perjalanan. Tetap tenang.',
                });

                // Reset after 5 seconds for demo
                setTimeout(() => setIsActive(false), 5000);
            }, (error) => {
                console.error(error);
                alert('Could not get location. Alarm sent without precise location.');
                socket.emit('panic', { userId, lat: 0, lng: 0 });

                addNotification({
                    type: 'panic',
                    title: '⚠️ Alarm Terkirim (Tanpa Lokasi)',
                    message: 'Lokasi tidak dapat dideteksi, tapi alarm telah dikirim.',
                });
            });
        }
    };

    return (
        <button
            onClick={handlePanic}
            disabled={!isConnected}
            className={`w-48 h-48 rounded-full text-white font-bold text-2xl shadow-lg transition-transform transform active:scale-95 ${!isConnected
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isActive
                        ? 'bg-red-700 animate-pulse'
                        : 'bg-red-600 hover:bg-red-700'
                }`}
        >
            {!isConnected ? 'OFFLINE' : isActive ? 'ALARM ACTIVE' : 'PANIC BUTTON'}
        </button>
    );
};

export default PanicButton;
