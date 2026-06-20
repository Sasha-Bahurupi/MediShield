# 🛡️ MediShield AI: The Future of Pharmaceutical Authentication

**The Problem:** Counterfeit medicine is a $400 billion shadow industry that costs over 1 million lives annually. Current solutions rely on static QR codes, which counterfeiters simply photocopy and slap onto millions of fake boxes. If a QR code can be cloned, it is not secure.

**The Solution:** MediShield AI shifts the paradigm of anti-counterfeiting from static cryptography to **dynamic, multi-factor risk intelligence**. We don't just scan a code; we analyze *how* it was printed, *where* it is being scanned, and *how fast* it is traveling across the globe.

By combining **Computer Vision**, **Spatial-Temporal Velocity Tracking**, and an **Offline-First PWA**, MediShield AI creates an unbreakable ecosystem that protects patients and secures supply chains—even in rural areas with zero internet connectivity.

_(Note: This project is in active development for the hackathon.)_

---

## 🧠 The 3 Pillars of Intelligence (Core Features)

Instead of relying solely on one point of failure, MediShield AI leverages three distinct security layers:

### 1. Spatial-Temporal Velocity Engine (Spring Boot)
Counterfeiters often clone one legitimate QR code across thousands of boxes. When the Spring Boot orchestrator receives a scan payload, it queries the ledger for the previous scan of that same `skuId`. By calculating the geographic distance (via the Haversine formula) over the elapsed time, the system flags physical impossibilities. *If a medicine box travels from New Delhi to New York in 15 minutes, the system flags the entire batch as a cloned anomaly.*

### 2. Multi-Layer Computer Vision (FastAPI Engine)
A dedicated Python FastAPI microservice that handles the heavy machine learning inference. When a payload arrives at Spring Boot, the backend makes an internal Docker network request to this engine.
- Extracts and decodes the QR code directly from the raw camera image.
- Aligns and crops the image using OpenCV.
- Uses Structural Similarity Indexing (SSIM) to compare the packaging typography against a master manufacturer image.
- Uses OCR to ensure the physical printed expiration text matches the digital data encoded in the QR string.

### 3. Offline-First Vault Architecture (Next.js PWA)
Pharmacists often operate in rural areas with zero cellular connectivity. When the network drops, the React app uses the browser's `IndexedDB` to vault the scanned GPS coordinates, images, and raw timestamps securely on the device. When connectivity restores, the app executes a bulk background sync. The Spring Boot backend reconciles these based on their *historical* timestamps, ensuring the velocity logic isn't triggered falsely by sync delays.

---

## 🏗️ Architecture Overview

The platform is built on a hybrid, high-performance architecture separating business logic from heavy machine learning inference:

| Component | Technology | Primary Role |
| :--- | :--- | :--- |
| **Frontend PWA** | Next.js, Tailwind, Framer | Mobile-first Progressive Web App for offline capabilities, camera capture, and IndexedDB caching. |
| **Orchestrator** | Spring Boot 3, Java 21 | Core gateway handling business logic, relational integrity, spatial velocity calculations, and offline sync reconciliation. |
| **AI Engine** | Python FastAPI | Asynchronous inference engine running Siamese Networks, OpenCV structural matching, and OCR. |
| **Database** | PostgreSQL + PostGIS | Relational storage for pharmaceutical master registries and dynamic transaction logs, optimized for geospatial queries. |

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLATFORM ARCHITECTURE                             │
│                                                                             │
│  ┌──────────────────┐             HTTPS / JSON        ┌──────────────────┐  │
│  │   Next.js PWA    │ ──────────────────────────────► │    Spring Boot   │  │
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

---

## 🗄️ Database Architecture

We divide our database strictly between "The Ground Truth" (what the manufacturer prints) and "The Field" (what happens in the real world). We use PostGIS and Tiger extensions internally for complex geographical routing.

### 1. `product_registry` (The Ground Truth)
Populated by pharmaceutical manufacturers.
- `sku_id` (PK): The unique Serialized Key Unit (QR Code Payload).
- `product_name`, `batch_number`, `manufacturing_date`, `expiry_date`.
- `intended_region`: Used for strict geofencing (e.g., flagging medicine sold outside its intended region).
- `manufacturer_signature`: Cryptographic signature from the pharmaceutical company.

### 2. `scan_ledger` (The Field Scans)
The historical, immutable log of field verifications by pharmacists. 
- `scan_id` (PK): Auto-incrementing ledger ID.
- `sku_id` (FK): Links to the product registry.
- `pharmacist_id`: The ID of the logged-in clinic worker.
- `latitude` / `longitude`: GPS Coordinates grabbed securely from the React PWA.
- `scan_timestamp`: The *exact* historical time of the scan (to handle offline delays).
- `is_synced_offline`: Boolean flag indicating if this scan was queued offline via IndexedDB.
- `system_risk_score`: 0-100 score combining Velocity anomalies and CV defects.
- `ai_confidence_score`: Percentage score directly from the FastAPI Computer Vision model.
- `status_verdict`: The final system ruling (`VERIFIED`, `SUSPICIOUS`, or `COUNTERFEIT`).

---

## 🚀 Installation & Setup

This project uses a unified Docker Compose architecture to seamlessly build and run the entire 4-tier microservice stack.

1. Clone the repository and navigate to the root directory.
2. Build and start the entire stack using Docker:

```bash
docker compose up -d --build
```

This will automatically spin up four interconnected containers:
- `medishield_frontend`: **Next.js PWA** (Port 3000)
- `medishield_backend`: **Spring Boot Orchestrator** (Port 8080)
- `medishield_ai`: **Python FastAPI Engine** (Port 8000)
- `medishield_db`: **PostgreSQL + PostGIS** (Port 5432)

### Accessing the Applications
- **Pharmacist App (UI):** Open `http://localhost:3000` in your browser.
- **Backend API:** Running on `http://localhost:8080/api/v1`
- **Database Access:** 
  ```bash
  docker exec -it medishield_db psql -U postgres -d medishield
  ```

To stop the entire stack:
```bash
docker compose down
```

---

## 🔌 API Integration Workflow

The Next.js frontend communicates with the Spring Boot backend via standard REST payloads.

### Verification Route (`POST /api/v1/verify/qr`)
- **Purpose:** Ingests scan payloads from the React PWA, sends the raw image to FastAPI for CV evaluation and QR extraction, checks PostgreSQL for geographical velocity anomalies, and saves the final verdict to the `scan_ledger`.
- **Payload:** 
  ```json
  {
    "skuId": "", // Left empty; the backend AI engine decodes the QR from the image!
    "pharmacistId": "PHARM-101",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "scanTimestamp": "2026-06-20T10:00:00",
    "clientDeviceId": "DEVICE-A1B2",
    "isSyncedOffline": false,
    "imageBase64": "iVBORw0KGgo..."
  }
  ```
- **Returns:** A `VerificationResponseDTO` containing the calculated `systemRiskScore`, `aiConfidenceScore`, and a final `statusVerdict` (`VERIFIED`, `COUNTERFEIT`, or `SUSPICIOUS`).