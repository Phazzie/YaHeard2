# Application Architecture

This document outlines the architecture for the multi-service AI audio transcription application. The design prioritizes modularity, scalability, and ease of integration for new services and features.

## 1. Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **File Storage:** [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces) (S3-Compatible)
- **SDKs:**
    - **AWS SDK for JS v3:** (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) for generating pre-signed URLs for DigitalOcean Spaces.
    - Individual SDKs for each transcription service as needed (e.g., `openai`, `assemblyai`).

## 2. Directory Structure

The project will follow a feature-driven directory structure to maintain a clear separation of concerns.

```
/
├── app/                  # Next.js App Router
│   ├── api/              # Backend API routes
│   │   ├── transcribe/   # Transcription orchestrator endpoint
│   │   └── upload/       # Pre-signed URL generation endpoint
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main application page
│
├── components/           # Reusable React components (e.g., Uploader, ResultsDisplay)
│
├── lib/                  # Core logic, utilities, and service integrations
│   ├── services/         # Modules for each external transcription service
│   │   ├── assemblyai.ts
│   │   ├── elevenlabs.ts
│   │   ├── gemini.ts
│   │   └── openai.ts
│   └── types.ts          # Shared TypeScript types and interfaces
│
├── public/               # Static assets
├── styles/               # Global styles
├── .env.example          # Example environment variables
└── ARCHITECTURE.md       # This file
└── STYLE_GUIDE.md        # UI/UX style guide
```

## 3. Core Modules & Data Flow

The application is composed of three primary modules: the Frontend UI, the Backend API, and the Transcription Service Integrations.

### Data Flow Diagram

1.  **Client (Browser)**: User selects an audio file.
2.  **Frontend UI**: Requests a secure upload URL from the Backend API.
    - `POST /api/upload { filename, fileType }`
3.  **Backend API (`/api/upload`)**: Generates a pre-signed URL using DigitalOcean credentials.
4.  **Frontend UI**: Receives the pre-signed URL and uploads the file directly to DigitalOcean Spaces.
5.  **Frontend UI**: After a successful upload, sends the public file URL to the transcription orchestrator.
    - `POST /api/transcribe { audioUrl }`
6.  **Backend API (`/api/transcribe`)**: Invokes the `transcribe` method on all available service modules in parallel.
7.  **Service Modules (`/lib/services/*`)**: Each module sends the `audioUrl` to its respective AI service API.
8.  **Backend API (`/api/transcribe`)**: Aggregates the results from all services.
9.  **Frontend UI**: Receives a JSON array of transcription results and displays them to the user.

## 4. API Contracts & Interfaces

To ensure modularity and standardization, all services will adhere to a common set of interfaces defined in `lib/types.ts`.

### `TranscriptionService` Interface

This is the contract that every new transcription service module must implement.

```typescript
// in lib/types.ts
export interface TranscriptionService {
  name: string;
  transcribe(audioUrl: string): Promise<TranscriptionResult>;
}
```

### `TranscriptionResult` Type

This is the standardized format for returning data from any transcription service.

```typescript
// in lib/types.ts
export interface TranscriptionResult {
  serviceName: string;
  transcription: string | null;
  error?: string;
}
```

## 5. Extensibility

This architecture is designed for future expansion.

-   **Adding a New Transcription Service**:
    1.  Create a new file in `/lib/services` (e.g., `new-service.ts`).
    2.  Implement the `TranscriptionService` interface.
    3.  The transcription orchestrator will automatically discover and use the new service.
-   **Adding Analysis Features**:
    1.  A new API endpoint (e.g., `/api/analyze`) can be created.
    2.  This endpoint would take the `TranscriptionResult[]` array as input.
    3.  New analysis modules (e.g., sentiment analysis, summarization) can be built to process this standardized data structure without needing to interact directly with the transcription services.
