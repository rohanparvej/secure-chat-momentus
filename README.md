# 🔒 SecureChat: Real-Time Encrypted Messaging

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

A full-stack, real-time chat application built as an educational proof-of-concept. This project demonstrates web socket communication, monorepo architecture, cloud deployment, and frontend encryption principles.

***⚠️Demo is only limited to alpha users or testers. This web-app/project is **not recommended** for production or **real world** use.⚠️***

## 🚀 Features

* **Real-Time Messaging:** Instant communication powered by `Socket.io` with dynamic room creation.
* **Client-Side Encryption:** Messages are encrypted on the frontend using `crypto-js` before being transmitted, demonstrating the core concept of privacy-first communication.
* **Monorepo Architecture:** Clean separation of concerns with isolated `frontend` and `backend` directories within a single repository.
* **Cloud Deployment:** Fully automated CI/CD pipeline using **Cloudflare Pages** for the UI and **Render** for the Node.js API.
* **Persistent Storage:** Chat rooms and metadata safely managed via **MongoDB Atlas**.

## 🛡️ Security & Ethics Disclaimer
This application was developed strictly for educational purposes.

* **Encryption:** While the app uses AES encryption, it is a basic implementation for demonstration. A production-grade app would require a more robust Key Management System.

* **Authentication:** This version focuses on real-time architecture; future iterations would include JWT-based user authentication and rate limiting.

* **Privacy:** This project proves that privacy can be a default setting in modern web applications.

## 🛠️ Tech Stack

**Frontend**
* React (Vite)
* Socket.io-client
* Crypto-js (AES Encryption)

**Backend**
* Node.js & Express
* Socket.io
* Mongoose (MongoDB ODM)

**Infrastructure**
* **Database:** MongoDB Atlas (M0 Free Cluster)
* **Backend Hosting:** Render (Web Service)
* **Frontend Hosting:** Cloudflare Pages

## 📁 Project Structure

```text
.
├── backend/                # Node.js API & Socket.io Logic
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # Express API Endpoints
│   ├── server.js           # Server Entry & Socket Setup
│   └── package.json
├── frontend/               # React/Vite Application
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── context/        # Socket & State Management
│   │   └── App.jsx         # Main Logic
│   ├── public/
│   │   └── _redirects      # Cloudflare SPA Routing Fix
│   └── package.json
└── README.md
```
## 💻 Local Development Setup
* 1. Clone the repository
Bash
git clone <>
cd <secure-chat-momentus>
* 2. Backend Setup
Bash
cd backend
npm install
Create a .env file in the backend folder:

Code snippet
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
Start server: npm run dev
```

* 3. Frontend Setup
Bash
cd ../frontend
npm install
Create a .env.local file in the frontend folder:

Code snippet
VITE_BACKEND_URL=http://localhost:5000
Start app: npm run dev
