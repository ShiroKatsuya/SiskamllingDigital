import ReportForm from '@/components/ReportForm';
import ReportsFeed from '@/components/ReportsFeed';

export default function ReportPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Sistem Laporan Masyarakat
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Laporkan kejadian dan lihat laporan terbaru secara real-time
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Report Form */}
                    <div className="order-2 lg:order-1">
                        <ReportForm />
                    </div>

                    {/* Right Column - Reports Feed */}
                    <div className="order-1 lg:order-2">
                        <div className="sticky top-8">
                            <ReportsFeed />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
