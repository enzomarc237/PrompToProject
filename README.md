<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally with full authentication and persistent storage powered by PocketBase.

View your app in AI Studio: https://ai.studio/apps/drive/1B_j3Rg4bgMVplt3Qhc7UDGB4XrmBeQf6

## Features

✨ **User Authentication** - Sign up and login with email/password powered by PocketBase  
📁 **Project History** - All generated projects are automatically saved to the cloud  
🔍 **Search Projects** - Quickly find your past projects  
💾 **Auto-save** - Projects are saved automatically after generation  
🎨 **Dark Mode** - Toggle between light and dark themes  
🚀 **AI-Powered** - Generate complete project structures using Gemini 2.5 Pro  
📧 **Email Support** - Password reset and email verification (configurable)

## Prerequisites

- Node.js (v18 or higher)
- PocketBase (download from https://pocketbase.io/docs/)

## Run Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PocketBase

Download PocketBase from https://pocketbase.io/docs/ and extract it.

Start PocketBase:
```bash
./pocketbase serve
```

Open http://127.0.0.1:8090/_/ and create an admin account.

Setup the database collections (see [pocketbase_schema.md](./pocketbase_schema.md) for detailed instructions):
- The `users` collection (auth) exists by default
- Create a `projects` collection with the required fields

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:
- `VITE_GEMINI_API_KEY` - Your Gemini API key
- `VITE_POCKETBASE_URL` - PocketBase URL (default: http://127.0.0.1:8090)

### 4. Run the App

```bash
npm run dev
```

Visit http://localhost:3000

## Architecture

### Backend (PocketBase)
- **Authentication**: Email/password with optional verification
- **Database**: SQLite with real-time subscriptions
- **Storage**: Projects stored as JSON in the database
- **API**: RESTful API with built-in authorization rules

### Frontend (React + Vite)
- **Auth Context**: Manages authentication state with auto-refresh
- **Services Layer**: Abstracts PocketBase API calls
- **Real-time Updates**: Auth state changes are reactive

## New in This Version

- **PocketBase Integration**: Real backend replacing localStorage
- **Cloud Storage**: All data stored in PocketBase database
- **Secure Authentication**: Proper auth with password hashing and JWT tokens
- **Email Support**: Password reset and verification capabilities
- **API-driven**: Full REST API for users and projects
- **Multi-device Sync**: Access your projects from any device

## Production Deployment

### PocketBase

1. Deploy PocketBase to a server (can use Docker, VPS, or PocketBase Cloud)
2. Configure SMTP for email functionality in PocketBase settings
3. Enable HTTPS and set proper CORS settings
4. Update `VITE_POCKETBASE_URL` to your production URL

### Frontend

1. Build the app:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to any static hosting (Vercel, Netlify, etc.)
3. Set environment variables in your hosting platform

## Development Notes

- PocketBase runs on port 8090 by default
- The admin UI is at http://127.0.0.1:8090/_/
- All API endpoints are at http://127.0.0.1:8090/api/
- Check [pocketbase_schema.md](./pocketbase_schema.md) for database schema details
- See [POCKETBASE_SECURITY.md](./POCKETBASE_SECURITY.md) for security configuration and best practices

## Troubleshooting

**Can't connect to PocketBase:**
- Ensure PocketBase is running (`./pocketbase serve`)
- Check that `VITE_POCKETBASE_URL` is correct
- Verify no firewall is blocking port 8090

**Authentication errors:**
- Clear browser storage and try again
- Check PocketBase logs for errors
- Verify the `users` collection is properly configured

**Projects not saving:**
- Ensure you're logged in
- Check the `projects` collection exists with proper fields
- Verify API rules allow authenticated users to create/update

## License

MIT
