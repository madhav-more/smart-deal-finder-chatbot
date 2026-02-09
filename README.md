# Smart Deal Finder

AI-powered shopping assistant that compares prices across multiple e-commerce platforms.

## Features

- 🤖 AI chatbot for natural product search
- 💰 Price comparison across Amazon, Flipkart, eBay, and more
- 🔐 Secure JWT-based authentication
- ⚡ Real-time price updates with Redis caching
- 📊 Price history tracking
- 🎯 Best deal recommendations

## Tech Stack

**Frontend:**
- React 19 + Vite
- React Router v6
- Zustand (state management)
- Tailwind CSS
- Lucide icons
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Redis caching
- JWT authentication
- Winston logging
- Bull (job queues)

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd smart-deal-finder
```

2. **Install backend dependencies**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start MongoDB** (if local)
```bash
mongod
```

2. **Start Redis**
```bash
redis-server
```

3. **Start backend server**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

4. **Start frontend**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get user profile

### Chat
- `POST /api/chat/message` - Send message to AI chatbot
- `GET /api/chat/conversations` - Get user's conversations
- `GET /api/chat/conversations/:id` - Get specific conversation

### Health
- `GET /api/health` - Server health check

## Project Structure

```
smart-deal-finder/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, Logger config
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, rate limiting
│   │   ├── services/        # Business logic
│   │   └── server.js        # Express app
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components  
    │   ├── services/        # API service
    │   ├── store/           # Zustand store
    │   └── App.jsx
    └── package.json
```

## Development Status

### ✅ Completed
- Backend infrastructure (Express, MongoDB, Redis)
- Authentication system (JWT)
- Database models (User, Product, Price, Conversation)
- Frontend UI (Login, Signup, Chat interface)
- Basic chatbot placeholder

### 🚧 In Progress
- AI integration (Google Gemini)
- Web scraping modules
- Price comparison engine

### 📋 Planned
- Real-time price updates
- Price history tracking
- Deal alerts
- Advanced product matching

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
