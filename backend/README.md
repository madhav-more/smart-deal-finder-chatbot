# Smart Deal Finder - Backend

AI-powered shopping assistant backend with price comparison across multiple e-commerce platforms.

## Features

- 🔐 JWT-based authentication
- 💾 MongoDB database with Mongoose ODM
- ⚡ Redis caching for performance
- 🔒 Rate limiting and security middleware
- 📝 Structured logging with Winston
- 🤖 AI product matching (in progress)
- 🕷️ Web scraping for price comparison (in progress)

## Prerequisites

- Node.js 20+ LTS
- MongoDB (local or MongoDB Atlas)
- Redis (local or cloud)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from template:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/smart-deal-finder
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile (protected)

### Health Check
- `GET /api/health` - Server health status

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (DB, Redis, Logger)
│   ├── models/          # Mongoose models
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   └── server.js        # Express app entry point
├── logs/                # Application logs
├── package.json
└── .env
```

## Database Models

- **Product**: Store product information across platforms
- **Price**: Track prices from different e-commerce sites
- **User**: User authentication and preferences
- **Conversation**: Chat history with AI assistant

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Helmet.js for HTTP headers security
- CORS configuration
- Input validation with Joi

## Development

### Running Tests (coming soon):
```bash
npm test
```

### Linting:
```bash
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for JWT signing | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `1h` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `GEMINI_API_KEY` | Google Gemini API key | Required for AI features |

## License

MIT
