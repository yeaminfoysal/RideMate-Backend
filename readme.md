# 🚖 RideMate – Role-Based Ride Booking Backend API

A **secure, scalable, and role-based backend API** for a ride booking system (like Uber or Pathao) built with **Express.js**, **Mongoose**, and **TypeScript** for type safety.  

**RideMate** allows:
- Riders to request rides 🚘  
- Drivers to accept & complete rides 🚗  
- Admins to manage the entire system 🔐  

---

## 📌 Project Overview

RideMate is a **modular backend** that supports **JWT authentication**, **role-based authorization**, and a **full ride lifecycle** from request to completion.  

### 🔹 Key Features
- **🔐 Authentication** – JWT-based login system with three roles: `Admin`, `Rider`, `Driver`
- **🎭 Role-based Authorization** – Protect routes according to user roles
- **🚗 Ride Management** – Request, accept, update, and complete rides
- **🧍 Rider & Driver Logic** – Separate role-specific permissions and features
- **💾 Full Ride History** – Store and retrieve completed, pending, or canceled rides
- **📦 Modular Architecture** – Easy to maintain and scale
- **💰 Automatic Fare Calculation** – Fare is calculated **based on the distance** between pickup and destination when the rider requests a ride

---

## 👥 Features by Role

### 🧍 Rider
- Request rides *(only if drivers are available)*
- Cancel rides *(only before a driver accepts)*
- View ride history with filters *(completed, pending, canceled)*

### 🚗 Driver
- View and accept available rides
- Reject rides *(won’t be shown again)*
- Update ride status: `picked_up → in_transit → completed`
- View earnings & history
- Set availability *(auto online when searching for rides)*

### 🛡️ Admin
- View all users, drivers, and rides
- Approve / suspend drivers
- Block / unblock users
---

## 📂 API Endpoints Summary

### **Ride Management**
| Method | Endpoint                | Description |
|--------|------------------------|-------------|
| POST   | `/rides/request`        | Rider requests a ride |
| PATCH  | `/rides/cancel/:id`     | Cancel a ride |
| GET    | `/rides/me`             | View my rides |
| GET    | `/rides/available`      | Driver gets available rides |
| PATCH  | `/rides/reject/:id`     | Driver rejects a ride |
| PATCH  | `/rides/accept/:id`     | Driver accepts a ride |
| GET    | `/rides/all`            | Admin gets all rides |
| PATCH  | `/rides/status/:id`     | Driver updates ride status |

### **Driver Management**
| Method | Endpoint                  | Description |
|--------|---------------------------|-------------|
| POST   | `/drivers/`               | User applies to become a driver |
| PATCH  | `/drivers/availability`   | Driver sets availability |
| PATCH  | `/drivers/approval/:id`   | Admin approves/rejects driver |
| GET    | `/drivers/all`            | Admin gets all drivers |
| GET    | `/drivers/earnings`       | Driver views earnings |

### **User Management**
| Method | Endpoint                   | Description |
|--------|----------------------------|-------------|
| POST   | `/users/register`          | Register a new user |
| GET    | `/users/all-users`         | Admin gets all users |
| GET    | `/users/me`                | Get my profile |
| PATCH  | `/users/block/:id`         | Admin blocks a user |
| PATCH  | `/users/unblock/:id`       | Admin unblocks a user |

### **Authentication**
| Method | Endpoint                   | Description |
|--------|----------------------------|-------------|
| POST   | `/auth/login`              | Credentials login |
| GET    | `/auth/google`             | Google OAuth login |
| GET    | `/auth/google/callback`    | Google OAuth callback |

---

## 🛠 Setup & Environment Instructions

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/yeaminfoysal/RideMate-Backend
cd ridemate-backend
```
### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Create `.env` File**

Create a `.env` file in the root of the project with the following structure:

```bash
# Database
DB_URL=

# JWT Secrets
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# Express Session
EXPRESS_SESSION_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Frontend URL
FRONTEND_URL=
```
💡 Replace the values with your own configuration before running the project.

### **4️⃣ Run in Development Mode**
```bash
npm run dev
```

---
## 📦 Tech Stack

| Category           | Technologies Used |
|--------------------|-------------------|
| **Backend**        | [Express.js](https://expressjs.com/) |
| **Database**       | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) |
| **Language**       | [TypeScript](https://www.typescriptlang.org/) |
| **Authentication** | [JWT](https://jwt.io/) + [Passport.js](http://www.passportjs.org/) (Google OAuth) |
| **Validation**     | [Zod](https://zod.dev/) |
| **Security**       | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing |
| **Environment**    | [dotenv](https://github.com/motdotla/dotenv) |
| **Session**        | [express-session](https://www.npmjs.com/package/express-session) |
| **Others**         | [CORS](https://www.npmjs.com/package/cors), [cookie-parser](https://www.npmjs.com/package/cookie-parser) |

---

## 🌐 Live API URL

The backend server is deployed and accessible at:

**[🔗 Live API Base URL](https://your-deployed-server.com)**

> You can use this URL as the base for all API requests in your frontend or API testing tools like Postman.
---

## 🔮 Future Improvements

- Real-time ride updates with Socket.IO
- Advanced ride fare calculation
- Reporting & analytics dashboard
- Push notifications
