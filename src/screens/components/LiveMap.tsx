import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet'in varsayılan ikon hatasını düzeltme
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function LiveMap({ users }: { users: any[] }) {
    // Sadece konumu olan kullanıcıları filtrele
    const validUsers = users.filter(u => u.lastLocation && u.lastLocation.latitude);

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '15px', overflow: 'hidden', border: '1px solid #ddd', marginBottom: '20px' }}>
            <MapContainer center={[39.9334, 32.8597]} zoom={3} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validUsers.map(user => (
                    <Marker key={user.id} position={[user.lastLocation.latitude, user.lastLocation.longitude]}>
                        <Popup>
                            <b>{user.email}</b><br />
                            Son Görülme: {user.lastSeen?.toDate().toLocaleString()}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}