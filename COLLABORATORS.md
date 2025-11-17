# UniConnect - Collaborators Guide

## 🤝 Adding Collaborators

### On GitHub:
1. Go to: https://github.com/green1210/Uniconnect-Student_Connectivity_Platform
2. Click **Settings** → **Collaborators**
3. Click **Add people**
4. Enter their GitHub username or email
5. Select permission level:
   - **Write**: Can push to repository
   - **Maintain**: Can manage issues and pull requests
   - **Admin**: Full access

### Collaborator Setup:

Once added, collaborators should:

```bash
# Clone the repository
git clone https://github.com/green1210/Uniconnect-Student_Connectivity_Platform.git
cd Uniconnect-Student_Connectivity_Platform

# Install dependencies
npm install

# Setup client
cd apps/client
npm install
cd ../..

# Setup server
cd apps/server
npm install
npx prisma generate
cd ../..

# Copy environment files
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env

# Contact admin for actual environment variables
```

## 🔐 Required Environment Variables

Collaborators will need:
- Database credentials (Neon PostgreSQL)
- Clerk API keys
- Cloudinary credentials
- Gemini AI API key

**Note**: Never commit `.env` files to the repository!

## 📋 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
```bash
# Make your changes
git add .
git commit -m "Description of changes"
```

### 3. Push to GitHub
```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request
- Go to GitHub repository
- Click "Pull requests" → "New pull request"
- Select your branch
- Add description and submit

### 5. Code Review
- Wait for review from admin/team
- Make requested changes if needed
- Once approved, it will be merged to main

## 🚀 Running Locally

```bash
# Start development server (client + server)
npm run dev

# Or separately:
npm run dev:client  # Frontend on localhost:5173
npm run dev:server  # Backend on localhost:4000
```

## 📁 Project Structure

```
Uniconnect/
├── apps/
│   ├── client/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/   # Page components
│   │   │   ├── components/
│   │   │   └── lib/
│   │   └── package.json
│   └── server/          # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── index.js
│       ├── prisma/      # Database schema
│       └── package.json
└── package.json         # Root package
```

## 🛠️ Common Tasks

### Database Changes
```bash
cd apps/server
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

### Add New Dependencies
```bash
# Frontend
npm --workspace apps/client install package-name

# Backend
npm --workspace apps/server install package-name
```

### Format Code
```bash
npm run format
```

### Lint Code
```bash
npm run lint
```

## 🐛 Troubleshooting

**Issue**: Database connection fails
- Check DATABASE_URL in apps/server/.env
- Ensure IP is whitelisted in Neon dashboard

**Issue**: Auth not working
- Verify Clerk keys in .env files
- Check Clerk dashboard allowed origins

**Issue**: Port already in use
- Kill process: `npx kill-port 4000` or `npx kill-port 5173`

## 📞 Contact

For access to environment variables or questions:
- Repository Admin: @green1210
- Create an issue on GitHub for bugs/features
