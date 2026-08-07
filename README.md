# 🚍 Smart Transit Hub

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4%2B-6DB33F.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.2.0-1C3C3C.svg?style=for-the-badge&logo=chainlink)](https://www.langchain.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama3-f34f29.svg?style=for-the-badge)](https://groq.com/)
[![Firebase FCM](https://img.shields.io/badge/Firebase_FCM-Push_Alerts-FFCA28.svg?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/docs/cloud-messaging)
[![Redis](https://img.shields.io/badge/Redis-Live_Cache-DC382D.svg?style=for-the-badge&logo=redis)](https://redis.io/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1.svg?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

---

> **Smart Transit Hub** is an end-to-end, multi-tier intelligent school bus & public transit tracking ecosystem. It integrates real-time GPS telemetry, role-based dashboards (Admin, Driver, Parent), high-speed geospatial caching with Redis, real-time push notifications via Firebase Cloud Messaging (FCM), and an AI-powered conversational assistant with live weather tool calling capabilities.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Database & Cache Setup](#1-database--cache-setup)
  - [2. Backend Service (Spring Boot)](#2-backend-service-spring-boot)
  - [3. AI Service (Python FastAPI & LangChain)](#3-ai-service-python-fastapi--langchain)
  - [4. Frontend Application (React & Vite)](#4-frontend-application-react--vite)
- [Environment Configurations](#-environment-configurations)
- [API Documentation](#-api-documentation)
- [License](#-license)

---

## ✨ Key Features

### 👑 Admin Dashboard
- **Fleet & Route Management**: Register buses, assign drivers to routes, and configure bus stops.
- **Live Transit Monitoring**: Interactive Leaflet maps displaying real-time positions of all active buses.
- **System Analytics & Alerts**: Monitor active trips, driver schedules, system health, and emergency alerts.

### 🚌 Driver Portal
- **GPS Telemetry Broadcasting**: One-tap start/stop trip streaming live location coordinates to Redis & MySQL.
- **Route Navigation & Stop Checklist**: Interactive map route display with sequential passenger pickup/drop-off tracking.
- **Emergency Alert Trigger**: Dispatch instant emergency notifications to admins and parents via FCM.

### 👨‍👩‍👧 Parent Portal
- **Live Bus Tracking**: Real-time vehicle location streaming with Leaflet map visualization.
- **ETA & Distance Estimates**: Live distance updates to destination bus stops.
- **Push Notifications (FCM)**: Real-time mobile/browser push notifications when the bus approaches student stops or enters geofenced zones.
- **Integrated AI Transport Assistant**: Embedded chatbot widget to inquire about bus schedules, weather conditions along the route, and trip status.

### 🔔 Firebase Cloud Messaging (FCM) Integration
- **Automated Proximity Notifications**: Instant FCM push alerts sent to parents when a bus is within a designated distance threshold of a stop.
- **Geofence Breach Alerts**: Real-time push messages dispatched on route deviations or delayed stops.
- **Asynchronous Delivery**: Integrated via Spring Boot `FcmService` and Google Firebase Admin SDK for reliable message dispatch.

### 🤖 AI Transport Assistant (`ai-service`)
- **LangChain + Groq LLM**: High-speed conversational AI customized with role-specific system prompts (Parent vs Driver).
- **OpenWeather API Integration**: Built-in tool calling for live weather queries (temperature, condition, wind, humidity) to inform commuters about route weather impact.

---

## 🏗️ System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          React 18 + Vite Frontend            │
                  │   (Admin, Driver & Parent Dashboards + Chat)  │
                  └──────────────────────┬───────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
                   ▼                                           ▼
  ┌─────────────────────────────────┐         ┌─────────────────────────────────┐
  │   Spring Boot 3.4 REST Backend   │         │    FastAPI AI Microservice     │
  │      (Port 8080 / Port 9090)    │         │           (Port 8000)           │
  └────────┬───────────────┬────────┘         └────────┬───────────────┬────────┘
           │               │                           │               │
           ▼               ▼                           ▼               ▼
    ┌─────────────┐ ┌─────────────┐             ┌─────────────┐ ┌─────────────┐
    │ MySQL Database│ │Redis Location│             │  Groq LLM   │ │ OpenWeather │
    │ (Relational)│ │   Cache     │             │     API     │ │     API     │
    └─────────────┘ └─────────────┘             └─────────────┘ └─────────────┘
```

---

## 🛠️ Tech Stack

| Domain | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Leaflet & React-Leaflet, Lucide React Icons, Axios, Custom Vanilla CSS |
| **Core Backend** | Java 21, Spring Boot 3.4+, Spring Security (JWT), Spring Data JPA, Hibernate, ModelMapper, Lombok, OpenAPI / Swagger |
| **AI Microservice** | Python 3.10+, FastAPI, Uvicorn, LangChain, `langchain-groq`, Pydantic, HTTPX, `python-dotenv` |
| **Data & Cache** | MySQL 8.x, Redis 6+ (Spring Data Redis), Firebase Admin SDK |
| **Build Tools** | Maven (`mvnw`), Node.js (npm), Python VirtualEnv (`venv`) |

---

## 📂 Project Directory Structure

```text
Smart-Transit-Hub/
├── Backend/
│   └── smarttransithub/              # Java Spring Boot Microservice
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/backend/smarttransithub/   # Controllers, Services, Models, Security
│       │   │   └── resources/
│       │   │       └── application.properties          # Spring Boot Database & Redis Configs
│       ├── mvnw / mvnw.cmd           # Maven Wrapper
│       └── pom.xml                   # Maven Dependencies (Spring Boot, JWT, Redis, MySQL, Swagger)
│
├── ai-service/                       # Python FastAPI AI Chatbot Service
│   ├── main.py                       # LangChain, Groq LLM & OpenWeather Tool API Routes
│   ├── requirements.txt              # Python Dependencies
│   └── .env                          # Groq & OpenWeather API Keys
│
└── smarttransithub-frontend/         # React + Vite Frontend Web App
    ├── src/
    │   ├── api/                      # Axios API Clients
    │   ├── components/               # Leaflet Maps, Chatbot Widget, Navbar, Simulators
    │   ├── pages/                    # Admin, Driver, Parent Dashboards & Login
    │   ├── index.css                 # Master Design Tokens & Utility Styles
    │   ├── App.jsx                   # Router & Main Application Wrapper
    │   └── main.jsx                  # Entrypoint
    ├── package.json                  # Frontend Dependencies & Scripts
    └── vite.config.js                # Vite Server Configuration
```

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed:

- **Java JDK 21** or later
- **Node.js 18+** & **npm**
- **Python 3.10+**
- **MySQL Server 8.0+**
- **Redis Server 6.0+**

---

## 🚀 Getting Started

### 1. Database & Cache Setup

Ensure **MySQL** and **Redis** services are running locally on their default ports:

1. **MySQL**: Ensure MySQL service is running on default port `3306`.
2. **Redis**: Ensure Redis service is running on default port `6379`.
3. **Firebase Cloud Messaging (FCM)**:
   - Download your service account credentials JSON file from the [Firebase Console](https://console.firebase.google.com/).
   - Place the file inside `Backend/smarttransithub/src/main/resources/` (e.g. `serviceAccountKey.json`).
   - Configure `firebase.config.file=serviceAccountKey.json` in `application.properties`.

---

### 2. Backend Service (Spring Boot)

```bash
# Navigate to the backend project directory
cd Backend/smarttransithub

# Verify application properties in src/main/resources/application.properties
# Default credentials: username=root, password=root

# Run the Spring Boot application using Maven Wrapper
# On Windows:
.\mvnw.cmd spring-boot:run

# On Linux/macOS:
./mvnw spring-boot:run
```

The Spring Boot backend server will start at `http://localhost:8080`.
Access Swagger API documentation at: `http://localhost:8080/swagger-ui.html`

---

### 3. AI Service (Python FastAPI & LangChain)

```bash
# Navigate to the ai-service directory
cd ai-service

# Create and activate a Python virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On Linux/macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Configure your API keys in .env file
# GROQ_API_KEY=your_groq_api_key_here
# OPENWEATHER_API_KEY=your_openweather_api_key_here

# Start the FastAPI server
python main.py
```

The AI service will start at `http://localhost:8000`. You can test docs at `http://localhost:8000/docs`.

---

### 4. Frontend Application (React & Vite)

```bash
# Navigate to the frontend directory
cd smarttransithub-frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```

The React web application will start at `http://localhost:5173`.

---

## ⚙️ Environment Configurations

### `ai-service/.env`

```env
# Groq API Key (https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# OpenWeather API Key (https://home.openweathermap.org/api_keys)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

### `Backend/smarttransithub/src/main/resources/application.properties`

```properties
spring.application.name=smarttransithub

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/smarttransithub?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password

# Redis Cache Configuration
spring.data.redis.host=your_redis_url / localhost
spring.data.redis.port=6379

# Firebase Cloud Messaging (FCM) Configuration
firebase.config.file=serviceAccountKey.json

# JWT Configuration
jwt.secret.key=your_256_bit_secret_key_here
jwt.exp.time=7200000
```

---

## 📖 API Documentation

### Key Backend Endpoints (`http://localhost:8080`)
- `POST /api/auth/login` — Authenticate user and issue JWT token.
- `GET /api/routes` — Retrieve active bus routes and assigned stops.
- `POST /api/tracking/location` — Broadcast current driver GPS coordinates to Redis cache.
- `GET /api/tracking/bus/{busId}` — Fetch current live location and ETA of a specific bus.

### AI Service Endpoints (`http://localhost:8000`)
- `POST /chat` — AI Chat Assistant endpoint supporting user queries, role context (`parent` / `driver`), and live OpenWeather tool execution.
- `GET /health` — Service health check and API status verification.

---


