# Objective
- Build an application for multi-service AI audio transcription comparison from scratch with a focus on simplicity, high modularity, and ease of integration.
- Prioritize robust integration and standardization using templates, blueprints, and well-defined contracts before developing other features.
# Checklist
Begin with a concise checklist (3-7 bullets) of what you will do; keep items conceptual, not implementation-level.
# Core Requirements
- The app should send audio files to multiple AI transcription services and display the transcriptions from each.
- UI must be visually engaging, with vibrant, modern styling (e.g., glows, bright, and eye-catching elements).
- The architecture should support adding analysis features for transcriptions in the future. Direct implementation of such features is not required in the initial build, but design should ensure they're easy to add or replace later.
- Four AI transcription services to support (using their most current available versions):
- OpenAI Whisper
- Gemini 2.5 Flash
- ElevenLabs
- AssemblyAI
# File Upload & Storage
- Large audio files should be uploaded directly to DigitalOcean Spaces. Credentials and storage info should be securely managed.
- Reduce upload size constraints by using DigitalOcean Spaces for storage backend.
# Credentials & Environment Configuration
## AI Transcription Service Keys
- `OPENAI_API_KEY`: OpenAI Whisper
- `ASSEMBLYAI_API_KEY`: AssemblyAI
- `DEEPGRAM_API_KEY`: Deepgram (if applicable)
- `GEMINI_API_KEY`: Gemini
- `ELEVENLABS_API_KEY`: ElevenLabs
- You can provide keys for some or all; the more keys, the more robust the consensus transcription.
## DigitalOcean Spaces (Storage) Keys
- `SPACES_BUCKET_NAME`: (e.g., yaheard)
- `SPACES_REGION`: (e.g., nyc3)
- `SPACES_ENDPOINT`: (e.g., nyc3.digitaloceanspaces.com)
- `SPACES_ACCESS_KEY_ID`: Public Spaces key
- `SPACES_SECRET_ACCESS_KEY`: Secret Spaces key (only shown once!)
## Application Settings
- `BODY_SIZE_LIMIT`: Server request size limit
- `NODE_ENV`: Set to `production` for deployed app
- `PORT`: Server port (e.g., 3000)
- All variables should be set in the DigitalOcean App Platform dashboard, or filled into `.env` for local development (copy from `.env.example`).
# Planning & Integration
- Before implementation, produce a comprehensive build plan outlining architecture, module boundaries, integration approach, and how modularity will be achieved and maintained.
- Emphasize clear, minimal contract interfaces for integrating new modules/services.
- Integration must remain smooth and standardized across all planned and future additions, including the potential addition of analysis modules at a later stage.
# Agentic Operation & Reasoning Effort
Attempt a first pass autonomously unless missing critical info; stop and ask if success criteria are unmet or conflicts arise. Set reasoning_effort = medium based on the complexity of architectural planning and integration; keep operational outputs concise, and present final deliverables with appropriate detail.
# Deliverables
- A project plan detailing modular breakdown, interface contracts, and integration strategy, ensuring extensibility for future analysis features.
- A record of all required API keys/environment variables and how they interact with app features.
- A UI/UX prototype or style guide illustrating the intended visual identity.
---
## Summary of Requested Flow
1. Plan integration and modular structure before coding.
2. Implement direct file uploads to DigitalOcean Spaces.
3. Send files to four (or more) AI services and display their separate transcriptions.
4. Provide a visually attractive, modern UI.
5. Design the system for future modular transcript analysis without implementing those features yet.
## Validation & Next Steps
After producing the architectural plan and integration outline, validate that all requirements are addressed and proceed or self-correct as needed. Await an approved plan before beginning implementation.
IT SAYS "BUILD THE APPLICAIGTON" THATS GTREAT BUT IT NEEDS TO SAY WHAT THE APPLICAGTION IS 
Prompt Optimizer will apply best practices to your prompt.
Draft
Model
text.format: text
effort: medium
verbosity: medium
store: true
Variables
Tools
Developer message


Prompt messages

Your conversation will appear here
No file chosen
Chat with your prompt...
No file chosen
