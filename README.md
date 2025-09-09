# Ya Heard? - AI Transcription Comparator

Ya Heard? is a full-stack web application designed to compare audio transcriptions from multiple leading AI services. Users can upload an audio file and see the transcribed text from services like OpenAI Whisper, Google Gemini, AssemblyAI, and ElevenLabs, side-by-side. The application also generates a "best-guess" consensus transcript by algorithmically combining the results.

This project was built from scratch with a focus on a highly modular and extensible architecture, making it easy to add new transcription or analysis services in the future.

## Key Features

-   **Multi-Service Comparison:** Get transcriptions from multiple AI providers with a single upload.
-   **Consensus Transcript:** An algorithm compares the individual results to generate a single, high-quality consensus transcript.
-   **Direct Cloud Uploads:** Large audio files are uploaded directly to a DigitalOcean Spaces bucket, ensuring fast and reliable uploads that don't overload the server.
-   **Service Health Checks:** The UI displays the operational status of each AI service, so you know which ones are available.
-   **Copy to Clipboard:** Easily copy the consensus or any individual transcript to your clipboard.
-   **Modular Architecture:** The backend is designed to be easily extensible. Adding a new transcription service is as simple as creating a new file that implements the standard `TranscriptionService` interface.

## Technology Stack

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **File Storage:** [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces) (S3-Compatible)
-   **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn
-   API keys for the transcription services you wish to use.
-   A configured DigitalOcean Spaces bucket with API credentials.

### Installation & Configuration

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Create an environment file:**
    Copy the example environment file to a new file named `.env`.
    ```sh
    cp .env.example .env
    ```

4.  **Fill in your environment variables** in the `.env` file. See the table below for details.

### Environment Variables

| Variable                  | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| `OPENAI_API_KEY`          | Your API key for OpenAI.                                                 |
| `OPENAI_MODEL`            | The Whisper model to use (e.g., `whisper-1`).                            |
| `ASSEMBLYAI_API_KEY`      | Your API key for AssemblyAI.                                             |
| `GEMINI_API_KEY`          | Your API key for Google Gemini.                                          |
| `GEMINI_MODEL`            | The Gemini model to use (e.g., `gemini-1.5-flash-latest`).               |
| `ELEVENLABS_API_KEY`      | Your API key for ElevenLabs.                                             |
| `ELEVENLABS_VOICE_ID`     | A default voice ID for the ElevenLabs API.                               |
| `SPACES_BUCKET_NAME`      | The name of your DigitalOcean Spaces bucket.                             |
| `SPACES_REGION`           | The region of your bucket (e.g., `nyc3`).                                |
| `SPACES_ENDPOINT`         | The endpoint URL for your bucket (e.g., `nyc3.digitaloceanspaces.com`).    |
| `SPACES_ACCESS_KEY_ID`    | Your public key for DigitalOcean Spaces.                                 |
| `SPACES_SECRET_ACCESS_KEY`| Your secret key for DigitalOcean Spaces.                                 |

### Available Scripts

-   **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

-   **Run tests:**
    ```sh
    npm run test
    ```

-   **Build for production:**
    ```sh
    npm run build
    ```

-   **Start the production server:**
    ```sh
    npm run start
    ```
