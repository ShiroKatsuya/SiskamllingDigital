'use client';

import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { MapPin, Clock, FileText, Image as ImageIcon } from 'lucide-react';

interface Report {
    id: string;
    type: string;
    description: string;
    photoUrl?: string;
    createdAt: string;
    status: string;
}

const ReportsFeed = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const feedRef = useRef<HTMLDivElement>(null);

    // Fetch initial reports
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch('http://localhost:3001/reports');
                const data = await response.json();
                setReports(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Listen for real-time updates from global socket
    useEffect(() => {
        if (!socket) return;

        const handleNewReport = (newReport: Report) => {
            console.log('New report received:', newReport);
            setReports((prevReports) => [newReport, ...prevReports]);

            // Scroll to top smoothly when new report arrives
            if (feedRef.current) {
                feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        socket.on('newReport', handleNewReport);

        return () => {
            socket.off('newReport', handleNewReport);
        };
    }, [socket]);

    const getReportTypeLabel = (type: string) => {
        const types: { [key: string]: string } = {
            road_damage: 'Jalan Rusak',
            street_light: 'Lampu Mati',
            suspicious: 'Aktivitas Mencurigakan',
            other: 'Lainnya',
        };
        return types[type] || type;
    };

    const getReportTypeBadgeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            road_damage: 'bg-gradient-to-r from-orange-500 to-red-500',
            street_light: 'bg-gradient-to-r from-yellow-500 to-amber-500',
            suspicious: 'bg-gradient-to-r from-red-600 to-pink-600',
            other: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        };
        return colors[type] || 'bg-gradient-to-r from-gray-500 to-gray-600';
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            pending: 'text-yellow-600',
            in_progress: 'text-blue-600',
            resolved: 'text-green-600',
            rejected: 'text-red-600',
        };
        return colors[status] || 'text-gray-600';
    };

    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            pending: 'Pending',
            in_progress: 'Dalam Proses',
            resolved: 'Selesai',
            rejected: 'Ditolak',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-t-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-2">Laporan Real-Time</h2>
                <p className="text-indigo-100 text-sm">
                    {reports.length} laporan terbaru
                </p>
            </div>

            {/* Feed Container */}
            <div
                ref={feedRef}
                className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 space-y-4 rounded-b-2xl"
                style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
                {reports.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">Belum ada laporan</p>
                    </div>
                ) : (
                    reports.map((report, index) => (
                        <div
                            key={report.id}
                            className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fadeIn border border-gray-200 hover:border-indigo-300"
                            style={{
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            {/* Report Header */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <span
                                        className={`${getReportTypeBadgeColor(
                                            report.type
                                        )} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm`}
                                    >
                                        {getReportTypeLabel(report.type)}
                                    </span>
                                    <span className={`text-xs font-medium ${getStatusColor(report.status)}`}>
                                        {getStatusLabel(report.status)}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-3">
                                    {report.description}
                                </p>

                                {/* Photo Preview */}
                                {report.photoUrl && (
                                    <div className="mb-3 rounded-lg overflow-hidden shadow-sm bg-gray-100">
                                        <img
                                            src={`http://localhost:3001${report.photoUrl}`}
                                            alt="Report"
                                            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                console.error('Failed to load image:', report.photoUrl);
                                                console.error('Full URL:', `http://localhost:3001${report.photoUrl}`);
                                                // Hide broken image icon by replacing with placeholder
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = '<div class="flex items-center justify-center h-48 bg-gray-200 text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                                                }
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Footer Info */}
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>
                                            {formatDistanceToNow(new Date(report.createdAt), {
                                                addSuffix: true,
                                                locale: id,
                                            })}
                                        </span>
                                    </div>
                                    {report.photoUrl && (
                                        <div className="flex items-center space-x-1 text-indigo-600">
                                            <ImageIcon className="h-3.5 w-3.5" />
                                            <span>Dengan Foto</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }

                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Custom Scrollbar */
                div::-webkit-scrollbar {
                    width: 8px;
                }

                div::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }

                div::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #6366f1, #a855f7);
                    border-radius: 10px;
                }

                div::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #4f46e5, #9333ea);
                }
            `}</style>
        </div>
    );
};

export default ReportsFeed;
