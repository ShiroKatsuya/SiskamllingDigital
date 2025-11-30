'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useSocket } from './SocketProvider';
import { AlertTriangle, Bell, CheckCircle, Info, X } from 'lucide-react';

interface Notification {
    id: string;
    type: 'panic' | 'report' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    addNotification: () => { },
    removeNotification: () => { },
    clearAll: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { socket } = useSocket();

    // Request browser notification permission on mount
    // Request browser notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const registerServiceWorker = async () => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    console.log('Service Worker registered with scope:', registration.scope);

                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        console.log('Notification permission denied');
                        return;
                    }

                    const VAPID_PUBLIC_KEY = 'BJanloAAX-s4i0B-tMS5YX4qJdAR9NKeZ7pHY34K1AsIaOrcakZ_urSWk-ZojhBuIt2p8ljWTTo11udPgHm8wHc';

                    function urlBase64ToUint8Array(base64String: string) {
                        const padding = '='.repeat((4 - base64String.length % 4) % 4);
                        const base64 = (base64String + padding)
                            .replace(/\-/g, '+')
                            .replace(/_/g, '/');

                        const rawData = window.atob(base64);
                        const outputArray = new Uint8Array(rawData.length);

                        for (let i = 0; i < rawData.length; ++i) {
                            outputArray[i] = rawData.charCodeAt(i);
                        }
                        return outputArray;
                    }

                    const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

                    let subscription = await registration.pushManager.getSubscription();
                    if (!subscription) {
                        subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey
                        });
                    }

                    // Send subscription to backend
                    const token = localStorage.getItem('token');
                    if (token) {
                        await fetch('http://localhost:3001/users/subscribe', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(subscription)
                        });
                        console.log('Push subscription sent to backend');
                    }

                } catch (error) {
                    console.error('Service Worker registration failed:', error);
                }
            }
        };

        registerServiceWorker();
    }, []);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
        };

        setNotifications((prev) => [newNotification, ...prev]);

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotif = new Notification(notification.title, {
                body: notification.message,
                icon: '/notification-icon.png', // You can add an icon later
                badge: '/notification-badge.png',
                tag: newNotification.id,
            });

            // Auto-close after 5 seconds
            setTimeout(() => browserNotif.close(), 5000);
        }

        // Auto-remove after 10 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
        }, 10000);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Listen for panic alerts
    useEffect(() => {
        if (!socket) return;

        socket.on('panicAlert', (data: { userId: string; lat: number; lng: number; address?: string }) => {
            console.log('🚨 PANIC ALERT received:', data);

            addNotification({
                type: 'panic',
                title: '🚨 PANIC ALERT!',
                message: `Emergency alert from user ${data.userId} at coordinates (${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}) - ${data.address || 'Address not available'}`,
            });

            // Play alert sound
            playAlertSound();
        });

        socket.on('newReport', (report: any) => {
            console.log('📢 New report received:', report);

            let locationInfo = '';
            if (report.location && report.location.coordinates) {
                const lat = report.location.coordinates[0];
                const lng = report.location.coordinates[1];
                locationInfo = `\nLokasi: (${lat.toFixed(4)}, ${lng.toFixed(4)}) - ${report.address || 'Address not available'}`;
            }

            addNotification({
                type: 'info',
                title: '📢 Laporan Baru',
                message: `Laporan baru: ${report.description?.substring(0, 50)}...${locationInfo}`,
            });
        });

        return () => {
            socket.off('panicAlert');
            socket.off('newReport');
        };
    }, [socket, addNotification]);

    const playAlertSound = () => {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
            {children}
            <NotificationDisplay notifications={notifications} removeNotification={removeNotification} />
        </NotificationContext.Provider>
    );
}

// Notification Display Component
function NotificationDisplay({
    notifications,
    removeNotification
}: {
    notifications: Notification[];
    removeNotification: (id: string) => void;
}) {
    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'panic':
                return <AlertTriangle className="h-5 w-5" />;
            case 'success':
                return <CheckCircle className="h-5 w-5" />;
            case 'info':
                return <Info className="h-5 w-5" />;
            case 'report':
                return <Bell className="h-5 w-5" />;
            default:
                return <Bell className="h-5 w-5" />;
        }
    };

    const getColor = (type: Notification['type']) => {
        switch (type) {
            case 'panic':
                return 'bg-red-600 text-white';
            case 'success':
                return 'bg-green-600 text-white';
            case 'info':
                return 'bg-blue-600 text-white';
            case 'report':
                return 'bg-purple-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`${getColor(notification.type)} rounded-lg shadow-2xl p-4 animate-slideIn flex items-start space-x-3 backdrop-blur-sm bg-opacity-95`}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
                        <p className="text-xs opacity-90 line-clamp-2">{notification.message}</p>
                    </div>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}
