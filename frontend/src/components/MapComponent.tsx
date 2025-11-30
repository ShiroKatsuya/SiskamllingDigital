'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
    center?: [number, number];
    zoom?: number;
    markers?: Array<{ id: string; lat: number; lng: number; title?: string }>;
}

const MapComponent = ({ center = [-6.200000, 106.816666], zoom = 13, markers = [] }: MapProps) => {
    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} className="z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
                <Marker key={marker.id} position={[marker.lat, marker.lng]}>
                    {marker.title && <Popup>{marker.title}</Popup>}
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;
