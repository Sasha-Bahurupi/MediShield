# MediShield AI: Counterfeit Medicine Intelligence Ecosystem

This is a multi-layered, AI-powered pharmaceutical authentication platform built with **Spring Boot** (Backend Orchestrator), **React PWA** (Mobile Frontend), **Python FastAPI** (AI Engine), and **PostgreSQL + PostGIS** (Database). 

It shifts the paradigm of anti-counterfeiting from static QR verification to dynamic, multi-factor risk intelligence (Computer Vision, Spatial-Temporal Velocity tracking, and Offline-First logging).

_(Note: This project is in active development for the hackathon.)_

## 🏗️ Architecture Overview

The platform is built on a hybrid, high-performance architecture separating business logic from heavy machine learning inference:

| Component | Technology | Primary Role |
| :--- | :--- | :--- |
| **Frontend PWA** | React.js | Mobile-first Progressive Web App for offline capabilities, camera capture, QR scanning, and `IndexedDB` caching. |
| **Orchestrator** | Spring Boot 3, Java 21 | Core gateway handling business logic, relational integrity, spatial-temporal velocity calculations, and offline sync reconciliation. |
| **AI Engine** | Python FastAPI | Asynchronous inference engine running Siamese Networks, OpenCV structural matching, and OCR to validate packaging aesthetics. |
| **Database** | PostgreSQL + PostGIS | Relational storage for pharmaceutical master registries and dynamic transaction logs, optimized for geospatial queries. |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLATFORM ARCHITECTURE                             │
│                                                                             │
│  ┌──────────────────┐             HTTPS / JSON        ┌──────────────────┐  │
│  │   React PWA      │ ──────────────────────────────► │    Spring Boot   │  │
│  │   (Frontend)     │                                 │   Orchestrator   │  │
│  │                  │ ◄───────── Risk Score ───────── │ (Java + Maven)   │  │
│  │ ├─ UI/UX         │                                 │                  │  │
│  │ ├─ QR Scanner    │                                 │ ├─ REST API      │  │
│  │ ├─ Image Capture │                                 │ ├─ Velocity Math │  │
│  │ └─ Offline Sync  │                                 │ ├─ Data Sync     │  │
│  └──────────────────┘                                 │ └─ Risk Rules    │  │
│           ▲                                           └────────┬─────────┘  │
│           │                                                    │            │
│      Pharmacist                                                │            │
│   (Mobile Browser)                                     JPA / Hibernate      │
│                                                                │            │
│                                                                ▼            │
│                                                       ┌──────────────────┐  │
│  ┌──────────────────┐        Internal REST API        │    PostgreSQL    │  │
│  │ Python FastAPI   │ ◄─────────────────────────────► │   + PostGIS DB   │  │
│  │   (AI Engine)    │                                 │ ├─ ProductReg    │  │
│  │                  │                                 │ │  └─ intended_reg│  │
│  │ ├─ CV Pipeline   │                                 │ ├─ ScanLedger    │  │
│  │ ├─ OpenCV Align  │                                 │ │  └─ risk_score │  │
│  │ ├─ SSIM Compare  │                                 │ └────────────────┘  │
│  │ └─ OCR Text Match│                                 │                     │
│  └──────────────────┘                                 └─────────────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Installation & Setup

This project uses Docker Compose to seamlessly build and run the entire 3-tier microservice architecture (Spring Boot, FastAPI, and PostgreSQL).

1. Clone the repository and navigate to the root directory.
2. Build and start the entire stack using Docker:

```bash
docker compose up -d --build
```

This will spin up three interconnected containers:
- `medishield_db`: PostgreSQL Database with PostGIS (Port 5432)
- `medishield_backend`: Spring Boot Orchestrator (Port 8080)
- `medishield_ai`: Python FastAPI Engine (Port 8000)

To stop the entire stack:
```bash
docker compose down
```

---

## 🗄️ Database Architecture & Handling

The PostgreSQL database runs inside a Docker container. We expose it on port `5432`.

**Connect to the Database via Terminal:**

```bash
docker exec -it medishield_db psql -U postgres -d medishield
```

### Core Tables

- `ProductRegistry`: The "Ground Truth" table populated by pharmaceutical manufacturers. It contains valid `skuId`s, expiry dates, batch signatures, and the `intendedRegion` for geo-fencing.
- `ScanLedger`: The historical log of field verifications by pharmacists. Tracks GPS coordinates, timestamps, offline status, calculated risk scores, and the final status verdict (e.g., `COUNTERFEIT`, `VERIFIED`, `SUSPICIOUS`).

---

## 🔌 Backend API Routes

The Spring Boot backend is served at `http://localhost:8080`. All API routes are prefixed with `/api/v1`.

### Verification Routes (`VerificationController`)

- **`POST /api/v1/verify/qr`**
  - **Purpose:** Ingests scan payloads from the React PWA, optionally decodes QR codes from the raw image (via Google ZXing), checks the database, calls the FastAPI AI engine, runs anomaly algorithms, and saves the transaction to the ledger.
  - **Payload:** 
    ```json
    {
      "skuId": "", // Can be empty if relying on the backend to decode the QR image
      "pharmacistId": "PHARM-101",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "scanTimestamp": "2026-06-20T10:00:00",
      "clientDeviceId": "DEVICE-A1B2",
      "isSyncedOffline": false,
      "imageBase64": "..."
    }
    ```
  - **Returns:** `VerificationResponseDTO` containing the `systemRiskScore`, `aiConfidenceScore`, and `statusVerdict` (`VERIFIED`, `COUNTERFEIT`, `SUSPICIOUS`).

---

## 🧠 Core Intelligence Features

Instead of relying solely on one point of failure, MediShield AI leverages three distinct security layers:

### 1. Spatial-Temporal Velocity Engine (Spring Boot)
Counterfeiters often clone one legitimate QR code across thousands of boxes. When the Spring Boot engine receives a scan payload, it queries the `ScanLedger` for the previous scan of that same `skuId`. By calculating the geographic distance (via Haversine formula) over the elapsed time, the system can flag physical impossibility. If a medicine box travels from New Delhi to New York in 15 minutes, the system flags the batch as a cloned anomaly.

### 2. Multi-Layer Computer Vision (FastAPI Engine)
A dedicated Python FastAPI microservice that handles the heavy machine learning inference. When a payload arrives at Spring Boot, the backend makes an internal Docker network request to this engine.
- Extracts and decodes the QR code directly from the raw camera image.
- Aligns and crops the image using OpenCV.
- Uses Structural Similarity Indexing (SSIM) to compare the packaging typography against a master manufacturer image.
- Uses OCR to ensure the physical printed expiration text matches the digital data encoded in the QR string.

### 3. Offline-First Sync Architecture (React PWA)
Pharmacists often operate in rural areas with zero cellular connectivity. When the network drops, the React app uses `IndexedDB` to vault the scanned GPS coordinates, images, and raw timestamps. When connectivity restores, the app executes a bulk background sync to `/api/v1/medicines/sync`. The Spring Boot backend reconciles these based on their *historical* timestamps, ensuring velocity logic isn't triggered falsely by sync delays.