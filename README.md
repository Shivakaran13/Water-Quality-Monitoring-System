# 🌊 AquaMonitor: Autonomous Water Quality Monitoring System

![AquaMonitor](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-v10-yellow.svg)
![ThingSpeak](https://img.shields.io/badge/IoT-ThingSpeak-orange.svg)

AquaMonitor is a robust, full-stack Internet of Things (IoT) dashboard designed to track, analyze, and autonomously report water quality metrics in real-time. Designed for municipal authorities, water treatment facilities, and community administrators, this platform shifts water monitoring from reactive to **proactive**.

---

## ✨ Key Features

- **📡 Real-Time IoT Dashboard**: Live data visualization of critical metrics (Temperature, pH, Turbidity, Total Dissolved Solids) streaming directly from hardware sensors via **ThingSpeak**.
- **🤖 Autonomous Alert Server**: A background Node.js service continuously polls sensor readings 24/7. When dangerous parameters are detected (e.g., pH drops critically low), it autonomously fires off emergency emails instantly without manual intervention.
- **☁️ Cloud-Synced Data (Firebase)**:
  - **Firestore**: Persistently stores resident notification rosters, administrative settings, and a permanent history of generated alerts.
  - **Firebase Authentication**: Secures dashboard routes exclusively for verified administrators via email/password or Google Sign-In.
- **📈 Predictive Analytics Module**: Evaluates live sensor stability and categorizes water sources into safety risk tiers based on rolling heuristic analysis.
- **📱 Responsive, Polished UI**: Built using Vite, React, Framer Motion, and Tailwind CSS, providing a glass-morphic, accessible interface across all devices.

---

## 🛠️ Architecture Stack

### Front-End (Client)
- **Framework**: React.js (Vite + TypeScript)
- **Styling**: Tailwind CSS + Shadcn UI components
- **Animations**: Framer Motion
- **Data Fetching**: React Query (TanStack)
- **Charts**: Recharts

### Back-End & Services
- **IoT Data Sync**: ThingSpeak REST API
- **Database & Auth**: Google Firebase (Firestore + Firebase Authentication)
- **Email Server**: Custom Node.js & Express proxy running `Nodemailer`
- **Email Delivery**: Brevo SMTP Integration / Gmail Mailer

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed on your machine.

### 1. Clone & Install
```bash
git clone https://github.com/Shivakaran13/Water-Quality-Monitoring-System.git
cd Water-Quality-Monitoring-System
npm install
```

### 2. Configure Firebase & ThingSpeak
This system requires API configurations. The project currently ships with existing developmental keys in the frontend, but for production, ensure you supply your own credentials inside your environment variables (`.env`).
- Ensure Firestore Database rules are configured to allow read/writes.
- Ensure Firebase Authentication (Email/Password & Google) is enabled.

### 3. Run the Application
The platform has two distinct parts that must run simultaneously for full functionality.

**A. Start the Frontend Application**
In your first terminal:
```bash
npm run dev
```

**B. Start the Autonomous Alert Email Server**
In a separate terminal, launch the background proxy that handles the continuous autonomous polling and email delivery:
```bash
npm run email-server
```

Navigate to `http://localhost:5173` in your browser.

---

## 🔔 How the Autonomous Alert System Works

1. The `email-server.js` Node script polls your ThingSpeak channel every 15 seconds.
2. It processes the raw metric data locally. If any data point exceeds safe parameters (e.g., TDS > 500ppm), it is flagged as a `WARNING` or `CRITICAL` breach.
3. The server immediately looks up the Resident Contact Roster inside **Firestore Database**.
4. An HTML templated emergency email is dynamically generated and sent via NodeMailer/Brevo SMTP routing. 
5. The incident is logged into the `alert_history` Firestore collection, immediately triggering a real-time reactive update on all active Admin Dashboards globally.
6. A 30-minute cooldown timer is initiated for that specific parameter to prevent inbox spam.

---

## 📦 Deployment (Vercel)

The React Front-End is optimized and ready for zero-configuration deployment to [Vercel](https://vercel.com/).
Because this dashboard incorporates client-side routing, a `vercel.json` file is included in the root directory to automatically handle subpath rewriting.

> **Note**: While the frontend deploys easily to Vercel, the `email-server.js` continuous-loop script must be deployed to an "always-on" continuous execution environment (like Render, Heroku via Webhook, AWS EC2, or a local Raspberry Pi node) as Vercel specifically only supports Serverless HTTP request-driven endpoints.

---

## 🔐 Security Information
Administrative authentication is mandatory for system usage. Unauthenticated visitors are automatically routed to the Firebase Login gate. No sensor parameter modifications or email roster configurations can be accessed off-session.

---

*Developed for reliable, reactive, and transparent water quality assurance.*
