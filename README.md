# YaHeard2 - Multi-Service AI Audio Transcription Comparison

A modern, modular application for comparing audio transcriptions across multiple AI services. Upload your audio files and see how different AI models handle the same content side-by-side.

## 🚀 Features

- **Multi-Service Transcription**: Compare results from OpenAI Whisper, Gemini 2.5 Flash, ElevenLabs, and AssemblyAI
- **Direct Cloud Upload**: Large audio files uploaded directly to DigitalOcean Spaces
- **Modern UI**: Vibrant, responsive interface with animations and visual feedback
- **Modular Architecture**: Extensible design for future analysis features
- **Real-time Status**: Service availability monitoring and upload progress
- **Comparison Analysis**: Side-by-side results with confidence scores and metadata

## 🏗️ Architecture

### Core Components

- **TranscriptionService Interface**: Standardized contract for all AI services
- **Service Adapters**: Individual implementations for each AI provider
- **TranscriptionOrchestrator**: Manages multiple service calls
- **FileStorageService**: DigitalOcean Spaces integration
- **Analysis Framework**: Extensible interface for future features

### Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React with modern CSS
- **Storage**: DigitalOcean Spaces
- **AI Services**: OpenAI, AssemblyAI, Gemini, ElevenLabs

## 📋 Prerequisites

- Node.js 18+ 
- DigitalOcean Spaces account
- API keys for at least one AI transcription service

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd YaHeard2
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Build the client**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## ⚙️ Configuration

### Required Environment Variables

#### AI Service API Keys
```env
# At least one is required
OPENAI_API_KEY=your_openai_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key  
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

#### DigitalOcean Spaces (Required)
```env
SPACES_BUCKET_NAME=your_bucket_name
SPACES_REGION=nyc3
SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
SPACES_ACCESS_KEY_ID=your_access_key
SPACES_SECRET_ACCESS_KEY=your_secret_key
```

#### Application Settings
```env
NODE_ENV=development
PORT=3000
BODY_SIZE_LIMIT=100mb
```

## 🔌 API Endpoints

### Service Status
- `GET /api/services` - Get available transcription services
- `GET /health` - Health check and configuration status

### File Management  
- `POST /api/upload` - Upload audio file to DigitalOcean Spaces
- `GET /api/files` - List uploaded files
- `DELETE /api/files/:key` - Delete uploaded file

### Transcription
- `POST /api/transcribe` - Transcribe using all available services
- `POST /api/transcribe/:service` - Transcribe using specific service

## 🎨 UI/UX Design

The interface features a vibrant, modern design with:

- **Color Scheme**: Deep blues and purples with bright accent colors
- **Animations**: Smooth transitions, glowing effects, and loading states
- **Typography**: Inter font family for modern readability
- **Layout**: Responsive grid system with card-based components
- **Visual Feedback**: Progress bars, status indicators, and hover effects

## 🧪 Development

### Running in Development Mode

```bash
# Start backend server
npm run dev

# Start frontend development server (in another terminal)
cd client && npm start
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build client for production
- `npm run install:all` - Install all dependencies
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🔄 Future Extensibility

The application is designed for easy extension with analysis modules:

### Analysis Module Interface
```javascript
class AnalysisModule {
  async analyze(transcriptionResults) {
    // Implement analysis logic
    return analysisResult;
  }
  
  getCapabilities() {
    // Return supported analysis types
  }
}
```

### Planned Analysis Features
- Accuracy comparison algorithms
- Sentiment analysis across services  
- Topic extraction and categorization
- Translation quality assessment
- Speaker identification comparison

## 🚀 Deployment

### DigitalOcean App Platform

1. Connect your repository to DigitalOcean App Platform
2. Set environment variables in the dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`

### Docker Deployment

```dockerfile
# Dockerfile is ready for containerization
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠️ Troubleshooting

### Common Issues

1. **No services available**
   - Check API key configuration
   - Verify environment variables are loaded

2. **Upload failures**  
   - Confirm DigitalOcean Spaces credentials
   - Check file size limits (100MB max)

3. **Transcription timeouts**
   - Large files may take several minutes
   - Check network connectivity to AI services

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and stack traces.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes following the modular architecture
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙋‍♂️ Support

For issues and questions:
- Check the troubleshooting section
- Review API service documentation
- Open a GitHub issue with detailed information

---

**Built with ❤️ for the AI transcription community**