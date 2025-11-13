# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- Terminal/Command line access

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup PocketBase

### Download PocketBase

**macOS/Linux:**
```bash
# Download and extract PocketBase
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_amd64.zip -o pb.zip
unzip pb.zip
rm pb.zip

# Make it executable
chmod +x pocketbase
```

**Windows:**
Download from: https://github.com/pocketbase/pocketbase/releases/latest

### Start PocketBase

```bash
./pocketbase serve
```

**First time setup:**
1. Open http://127.0.0.1:8090/_/
2. Create an admin account
3. You'll see the admin dashboard

### Create the Projects Collection

In the PocketBase admin UI:

1. Click **"Collections"** in the sidebar
2. Click **"New collection"** → Choose **"Base collection"**
3. Name it **`projects`**

4. Add these fields:

   **Field 1: user (Relation)**
   - Type: Relation
   - Collection: users
   - Type: Single
   - Required: Yes
   - Check "Cascade delete"

   **Field 2: name (Text)**
   - Type: Text
   - Required: Yes
   - Min: 1, Max: 200

   **Field 3: description (Text)**
   - Type: Text
   - Required: No
   - Max: 500

   **Field 4: options (JSON)**
   - Type: JSON
   - Required: Yes

   **Field 5: files (JSON)**
   - Type: JSON
   - Required: Yes

5. Click **"API Rules"** tab and set:
   - **List/View**: `user = @request.auth.id`
   - **Create**: `@request.auth.id != "" && @request.data.user = @request.auth.id`
   - **Update**: `user = @request.auth.id`
   - **Delete**: `user = @request.auth.id`

6. Click **"Create"**

## Step 3: Configure Environment

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your keys
# VITE_GEMINI_API_KEY=your_actual_api_key_here
# VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

Get your Gemini API key from: https://aistudio.google.com/apikey

## Step 4: Verify PocketBase Connection

```bash
npm run check:pb
```

You should see: ✅ PocketBase is running!

## Step 5: Start the App

```bash
npm run dev
```

Visit: http://localhost:3000

## Step 6: Create Your First Account

1. Click "Sign up" on the login screen
2. Enter your email, name, and password
3. You're in! Start generating projects

## Troubleshooting

### Can't connect to PocketBase?

**Check if PocketBase is running:**
```bash
curl http://127.0.0.1:8090/api/health
```

Should return: `{"code":200,"message":"API is healthy."}`

**Common issues:**
- PocketBase not started: Run `./pocketbase serve`
- Wrong URL in `.env.local`: Check `VITE_POCKETBASE_URL`
- Port 8090 in use: PocketBase will show an error, try a different port

### Projects not saving?

1. Check you're logged in
2. Verify the `projects` collection exists in PocketBase admin
3. Check the API rules are set correctly
4. Look at browser console for errors (F12)

### Registration failing?

- Email might already be registered
- Password too short (PocketBase requires 8+ characters)
- Check PocketBase logs in the terminal

## Next Steps

- Generate your first project!
- Check out the project history button (clock icon)
- Save projects with custom names
- Try the dark mode toggle

## Need Help?

- Full documentation: [README.md](./README.md)
- PocketBase docs: https://pocketbase.io/docs/
- Schema details: [pocketbase_schema.md](./pocketbase_schema.md)
