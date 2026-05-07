# TaskFlow - Team Task Manager

I built TaskFlow because I was tired of juggling tasks across multiple spreadsheets and chat apps. It's a simple yet powerful task management app that helps teams stay on the same page without the complexity of enterprise tools.

Think of it as the sweet spot between a basic to-do list and a full-blown project management system - perfect for small to medium teams who want to get things done without the headache.

## What's Under the Hood?

**Frontend (the pretty stuff):**
- React 19 with Vite - Fast, modern, and a joy to work with
- TailwindCSS 4 - Because I hate writing CSS from scratch
- React Router DOM - For smooth navigation between pages
- Axios - Handles all the API calls like a champ

**Backend (the brains):**
- Node.js with Express 5 - Lightweight and reliable
- MongoDB with Mongoose - Flexible database that grows with your needs
- JWT authentication - Keeps your data safe without being complicated
- bcryptjs - Because passwords should never be stored in plain text (duh!)

## What You'll Need

Before we dive in, make sure you have:
- **Node.js 18+ and npm** - The JavaScript runtime and package manager
- **MongoDB** - Either running locally or a free MongoDB Atlas account (I recommend Atlas for beginners)
- **Git** - For cloning the repo (and because you should be using version control anyway)

## How It's Organized

I kept the structure simple and logical:

```
├── team-task-manager/     # The React frontend (what users see)
│   ├── src/
│   │   ├── components/    # Reusable UI bits and pieces
│   │   ├── context/       # Global state management (React Context)
│   │   ├── pages/         # The actual pages like Login, Projects, etc.
│   │   └── ...
│   └── package.json

├── server/                # The Node.js backend (the magic happens here)
│   ├── config/           # Database connection stuff
│   ├── controllers/      # The logic that handles requests
│   ├── middleware/       # Authentication and validation checks
│   ├── models/           # MongoDB schemas (data blueprints)
│   └── package.json
```

## Getting It Running Locally

Ready to dive in? Let's get this thing running on your machine.

### Step 1: Grab the Code

```bash
git clone <repository-url>
cd pratik
```

### Step 2: Fire Up the Backend

```bash
cd server
cp .env.example .env
npm install
```

Now, let's set up your environment variables in `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-task-manager
# Or if you're using MongoDB Atlas (recommended for beginners):
# mongodb+srv://username:password@cluster.mongodb.net/team-task-manager
JWT_SECRET=make_this_something_random_and_secure_please
```

Time to start the backend server:
```bash
# For development (auto-restarts when you save files)
npm run dev

# Or for production
npm start
```

### Step 3: Get the Frontend Going

```bash
cd ../team-task-manager
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

And start the frontend:
```bash
npm run dev
```

**Boom!** 🎉 Your app should now be running at `http://localhost:5173` with the backend humming along at `http://localhost:5000`.

## Handy Commands

Here are the commands I use most often:

### Backend Stuff (`server/` directory)
- `npm start` - Run it in production mode
- `npm run dev` - Development mode (my go-to - restarts automatically when you save)
- `npm run seed` - Populate the database with some sample data to play with

### Frontend Stuff (`team-task-manager/` directory)
- `npm run dev` - Start the development server (you'll use this 99% of the time)
- `npm run build` - Create the production build
- `npm run preview` - See what the production build looks like locally
- `npm run lint` - Check your code for style issues

## API Endpoints (What the Backend Can Do)

### User Stuff
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Sign in to your account
- `GET /api/auth/me` - Get your profile info

### Project Management
- `GET /api/projects` - See all your projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get details for a specific project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project (be careful!)

### Task Management
- `GET /api/tasks` - See all tasks (you can filter by project too)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Taking It Live (Deployment)

Want to put this on the real internet? Here's how I do it:

### Deploying the Backend (I like Render, but Railway/Heroku work too)

1. **Set up MongoDB Atlas** - Get a free cluster and grab that connection string
2. **Configure your environment variables** on whatever platform you're using:
   - `NODE_ENV=production`
   - `PORT=5000` (or let the platform decide)
   - `MONGO_URI=your_atlas_connection_string`
   - `JWT_SECRET=something_super_secure_and_random`
3. **Push it live** - Most platforms have Git integration, which is the easiest way

### Deploying the Frontend (Vercel is my favorite, Netlify works great too)

1. **Point it to your backend** - Update `team-task-manager/.env`:
   ```env
   VITE_API_URL=https://your-backend-url.com/api
   ```

2. **Build it**:
   ```bash
   cd team-task-manager
   npm run build
   ```

3. **Deploy** - Either upload the `dist/` folder or connect your Git repo

### Quick Reference: Environment Variables

| Variable | Frontend | Backend | What It Does |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ | ❌ | Where the frontend finds the backend |
| `NODE_ENV` | ❌ | ✅ | Tells the app if it's in dev or production |
| `PORT` | ❌ | ✅ | What port the backend listens on |
| `MONGO_URI` | ❌ | ✅ | How to connect to your database |
| `JWT_SECRET` | ❌ | ✅ | Keeps your authentication secure |

## Keeping Things Secure

Just a few quick security reminders (because nobody wants to get hacked):

- **Never, ever commit `.env` files** to Git - I mean it!
- **Use strong JWT secrets** in production - `password123` won't cut it
- **Lock down CORS** to only your trusted domains
- **Always use HTTPS** in production - no exceptions
- **Passwords are already hashed** with bcryptjs, so we're good there

## When Things Go Wrong (Troubleshooting)

Hit a snag? Here are the most common issues I run into:

**"Frontend can't talk to the backend!"**
- Is the backend actually running? Check your terminal
- Did you set `VITE_API_URL` correctly in the frontend?
- CORS issues? Make sure your backend allows requests from your frontend URL

**"Database won't connect!"**
- Local MongoDB running? Try `mongod` in another terminal
- Using Atlas? Double-check your IP whitelist and connection string
- Typos in your `MONGO_URI`? Happens to the best of us

**"Authentication is being weird!"**
- Did you set a `JWT_SECRET` in your backend `.env`?
- Make sure it's the same secret on both frontend and backend
- Check if your JWT token has expired (they don't last forever)

---

**That's it!** 🚀 If you run into something not covered here, feel free to open an issue or reach out. Happy coding!
