import Link from 'next/link';
import { Shield, Bell, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-700 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Siskamling Digital
          </h1>
          <p className="mt-4 text-xl text-indigo-100">
            Aman Bersama, Waspada Bersama.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/dashboard" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10">
              Masuk Dashboard
            </Link>
            <Link href="/lapor" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-800 md:py-4 md:text-lg md:px-10">
              Lapor Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Panic Button</h3>
            <p className="mt-2 text-base text-gray-500">
              Alarm darurat yang terhubung ke warga sekitar dan petugas keamanan dalam radius 500m.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Peta Real-time</h3>
            <p className="mt-2 text-base text-gray-500">
              Pantau lokasi petugas dan daerah rawan kejahatan secara langsung di peta digital.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Lapor Cepat</h3>
            <p className="mt-2 text-base text-gray-500">
              Laporkan jalan rusak, lampu mati, atau aktivitas mencurigakan dengan mudah dan cepat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
