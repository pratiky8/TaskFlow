# TaskFlow - Team Task Manager

A full-stack task management application for teams to collaborate on projects, assign tasks, and track progress in real-time.

## Tech Stack

**Frontend:**
- React 19 with Vite
- TailwindCSS 4
- React Router DOM
- Axios for API communication

**Backend:**
- Node.js with Express 5
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

## Project Structure

```
├── team-task-manager/     # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context for state management
│   │   ├── pages/         # Page components
│   │   └── ...
│   └── package.json
│
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth & validation middleware
│   ├── models/           # Mongoose schemas
│   └── package.json
```

## Local Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd pratik
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
npm install
```

Configure `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-task-manager
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/team-task-manager
JWT_SECRET=your_secure_jwt_secret_key_here
```

Start the backend:
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

### 3. Frontend Setup

```bash
cd ../team-task-manager
npm install
```

Configure `team-task-manager/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` with the backend running on `http://localhost:5000`.

## Available Scripts

### Backend (`server/`)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Frontend (`team-task-manager/`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Projects
- `GET /api/projects` - Get all projects for user
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Create MongoDB Atlas cluster** and get connection string
2. **Set environment variables** on hosting platform:
   - `NODE_ENV=production`
   - `PORT=5000` (or let platform set it)
   - `MONGO_URI=your_mongodb_atlas_uri`
   - `JWT_SECRET=your_secure_secret`
3. **Deploy** via Git integration or CLI

### Frontend Deployment (Vercel/Netlify)

1. **Update API URL** in `team-task-manager/.env`:
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   ```

2. **Build and deploy**:
   ```bash
   cd team-task-manager
   npm run build
   ```

3. **Upload `dist/` folder** to hosting platform or use Git-based deployment

### Environment Variables for Production

| Variable | Frontend | Backend | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ | ❌ | Backend API URL |
| `NODE_ENV` | ❌ | ✅ | Environment mode |
| `PORT` | ❌ | ✅ | Server port |
| `MONGO_URI` | ❌ | ✅ | MongoDB connection string |
| `JWT_SECRET` | ❌ | ✅ | JWT signing secret |

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique JWT secrets in production
- Enable CORS only for trusted domains
- Use HTTPS in production
- Store passwords hashed (already handled by bcryptjs)

## Troubleshooting

**Frontend can't connect to backend:**
- Verify backend is running on correct port
- Check `VITE_API_URL` points to correct backend URL
- Ensure CORS is properly configured

**Database connection errors:**
- Verify MongoDB is running (local) or Atlas IP whitelist
- Check `MONGO_URI` format and credentials

**JWT authentication issues:**
- Ensure `JWT_SECRET` is set and consistent
- Check token expiration on client side
