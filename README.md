# SiskamllingDigital

**SiskamllingDigital** (Sistem Keamanan Lingkungan Digital) is a comprehensive digital platform designed to enhance neighborhood security. It empowers citizens to report incidents and trigger emergency alerts while providing authorities with real-time tools to manage and respond to security threats effectively.

## 🚀 Features

- **Real-time Incident Reporting**: Citizens can report security issues with detailed descriptions, photos, and precise geolocation.
- **Panic Button**: A one-click emergency alert system that instantly notifies authorities and nearby users.
- **Interactive Maps**: Integrated map interface (Leaflet) for pinning incident locations and visualizing safety hotspots.
- **Role-Based Access Control (RBAC)**:
  - **Citizens**: Report incidents, view public safety feeds.
  - **Government**: Monitor reports, update statuses, and view analytics.
  - **Admins**: Manage users, system settings, and oversee all operations.
- **Live Notifications**: Real-time updates via Socket.IO and Web Push notifications for immediate awareness.
- **Responsive Design**: Modern, mobile-friendly interface built with Next.js and Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript
- **Maps**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Real-time**: [Socket.IO Client](https://socket.io/)
- **Icons**: Lucide React

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Database**: PostgreSQL (via [TypeORM](https://typeorm.io/))
- **Authentication**: Passport.js (JWT)
- **Real-time**: Socket.IO (WebSockets)
- **Notifications**: Web Push

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SiskamllingDigital
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and configure your environment variables (database connection, JWT secret, VAPID keys, etc.).

Start the backend server:
```bash
npm run start:dev
```
The backend will run on `http://localhost:3001` (or your configured port).

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory if needed for public API keys.

Start the frontend development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the [MIT License](LICENSE).