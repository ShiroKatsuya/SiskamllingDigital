'use client';

import { useState } from 'react';
import axios from 'axios';
import { Camera, Send, CheckCircle } from 'lucide-react';

const ReportForm = () => {
    const [type, setType] = useState('road_damage');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            // Check if geolocation is available
            if (!navigator.geolocation) {
                alert('Geolocation tidak didukung oleh browser Anda.');
                setLoading(false);
                return;
            }

            // Get location with improved error handling
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;

                        const formData = new FormData();
                        formData.append('type', type);
                        formData.append('description', description);
                        formData.append('location', JSON.stringify({
                            type: 'Point',
                            coordinates: [latitude, longitude],
                        }));

                        if (photo) {
                            formData.append('photo', photo);
                        }

                        await axios.post('http://localhost:3001/reports', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });

                        setSuccess(true);
                        setDescription('');
                        setPhoto(null);
                        setPhotoPreview(null);

                        // Reset success message after 3 seconds
                        setTimeout(() => setSuccess(false), 3000);

                        setLoading(false);
                    } catch (error) {
                        console.error('Submit error:', error);
                        alert('Gagal mengirim laporan. Silakan coba lagi.');
                        setLoading(false);
                    }
                },
                (err) => {
                    console.error('Geolocation error:', err);
                    let errorMessage = 'Gagal mendapatkan lokasi. ';

                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            errorMessage += 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda.';
                            break;
                        case err.POSITION_UNAVAILABLE:
                            errorMessage += 'Informasi lokasi tidak tersedia.';
                            break;
                        case err.TIMEOUT:
                            errorMessage += 'Waktu permintaan lokasi habis. Silakan coba lagi.';
                            break;
                        default:
                            errorMessage += 'Terjadi kesalahan yang tidak diketahui.';
                    }

                    alert(errorMessage);
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } catch (error) {
            console.error(error);
            alert('Failed to submit report.');
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            {/* Success Notification */}
            {success && (
                <div className="absolute -top-16 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 animate-slideDown z-10">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Laporan berhasil dikirim!</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Lapor Kejadian
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Laporkan masalah yang Anda temukan</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Laporan</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3 text-gray-800 bg-white shadow-sm"
                    >
                        <option value="road_damage">🚧 Jalan Rusak</option>
                        <option value="street_light">💡 Lampu Mati</option>
                        <option value="suspicious">⚠️ Aktivitas Mencurigakan</option>
                        <option value="other">📋 Lainnya</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3 text-gray-800 bg-white shadow-sm resize-none"
                        placeholder="Jelaskan detail kejadian yang Anda laporkan..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Foto (Opsional)</label>
                    <div className="flex items-center space-x-3">
                        <label htmlFor="photo-upload" className="flex items-center justify-center px-5 py-2.5 border-2 border-indigo-300 shadow-sm text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition-all duration-200 hover:scale-105">
                            <Camera className="h-5 w-5 mr-2" />
                            Ambil Foto
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                        {photo && <span className="text-sm text-green-600 font-medium">✓ Foto dipilih</span>}
                    </div>
                    {photoPreview && (
                        <div className="mt-4 relative inline-block">
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-full max-w-xs h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setPhoto(null);
                                    setPhotoPreview(null);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all duration-200 hover:scale-110"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                    {loading ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Mengirim...
                        </div>
                    ) : (
                        <>
                            <Send className="h-5 w-5 mr-2" />
                            Kirim Laporan
                        </>
                    )}
                </button>
            </form>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ReportForm;
