# Migration Guide: localStorage to PocketBase

This guide helps you migrate from the localStorage-based authentication to the new PocketBase backend.

## What Changed?

### Before (localStorage)
- All data stored in browser localStorage
- No real authentication security
- Data only on one device
- No email features
- Manual data export needed for backup

### After (PocketBase)
- Data stored in PocketBase database
- Secure authentication with JWT tokens
- Access from multiple devices
- Email verification and password reset
- Automatic backups via PocketBase

## Breaking Changes

### 1. Data Structure

**User Object:**
```typescript
// Old
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// New
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created?: string;
  updated?: string;
}
```

**SavedProject Object:**
```typescript
// Old
interface SavedProject {
  id: string;
  userId: string;
  name: string;
  options: ProjectOptions;
  files: FileNode[];
  createdAt: string;
  updatedAt: string;
}

// New
interface SavedProject {
  id: string;
  user: string;  // Changed from userId
  name: string;
  description?: string;  // New field
  options: ProjectOptions;
  files: FileNode[];
  created?: string;  // Changed from createdAt
  updated?: string;  // Changed from updatedAt
}
```

### 2. Service Methods Now Async

All service methods now return Promises:

```typescript
// Old (synchronous)
const projects = projectHistoryService.getUserProjects(userId);
projectHistoryService.deleteProject(projectId);

// New (async)
const projects = await projectHistoryService.getUserProjects(userId);
await projectHistoryService.deleteProject(projectId);
```

### 3. Environment Variables Required

Create `.env.local`:
```bash
VITE_GEMINI_API_KEY=your_key
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

## Migration Steps

### Step 1: Export Old Data (Optional)

If you want to preserve localStorage data:

```javascript
// Run in browser console on the old version
const users = localStorage.getItem('app-users');
const projects = localStorage.getItem('saved-projects');
const currentUser = localStorage.getItem('current-user');

console.log('Users:', users);
console.log('Projects:', projects);
console.log('Current User:', currentUser);

// Copy and save this data somewhere safe
```

### Step 2: Setup PocketBase

Follow the [QUICKSTART.md](./QUICKSTART.md) guide to:
1. Download and start PocketBase
2. Create admin account
3. Setup collections

### Step 3: Install Dependencies

```bash
npm install
```

This will install the `pocketbase` package.

### Step 4: Update Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your keys
```

### Step 5: Start Fresh

The new version doesn't automatically migrate localStorage data. Users will need to:
1. Sign up again (same email works)
2. Projects will be auto-saved going forward

### Step 6: Import Old Projects (Manual)

If you saved old data, you can manually recreate important projects by:
1. Logging into the new system
2. Using the project generator to recreate them
3. They'll be auto-saved to PocketBase

## Code Migration for Developers

### Auth Service Changes

```typescript
// Old
import { authService } from './services/authService';

const user = authService.login(email, password);  // Sync
authService.logout();

// New
import { authService } from './services/authService';

const user = await authService.login(email, password);  // Async
authService.logout();
```

### Project Service Changes

```typescript
// Old
const project = projectHistoryService.saveProject(
  userId, name, options, files
);

// New
const project = await projectHistoryService.saveProject(
  userId, name, options, files
);
```

### Component Updates

```typescript
// Old
useEffect(() => {
  const projects = projectHistoryService.getUserProjects(user.id);
  setProjects(projects);
}, [user]);

// New
useEffect(() => {
  const loadProjects = async () => {
    try {
      const projects = await projectHistoryService.getUserProjects(user.id);
      setProjects(projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };
  loadProjects();
}, [user]);
```

## Rollback Instructions

If you need to rollback to the localStorage version:

```bash
# Checkout the previous commit
git checkout <previous-commit-hash>

# Or if using branches
git checkout main  # or whatever branch had the old version

# Reinstall dependencies
npm install

# Run the old version
npm run dev
```

## Testing the Migration

1. **Test Auth:**
   ```bash
   npm run check:pb  # Should show PocketBase is running
   ```

2. **Test Registration:**
   - Sign up with a new account
   - Verify email received (if SMTP configured)

3. **Test Projects:**
   - Generate a project
   - Check it appears in history
   - Delete and verify it's removed

4. **Test Persistence:**
   - Close browser
   - Open again
   - Should still be logged in (if token not expired)

## Common Issues

### "Cannot connect to PocketBase"
- Ensure PocketBase is running: `./pocketbase serve`
- Check URL in `.env.local`

### "Failed to save project"
- Verify `projects` collection exists
- Check API rules allow authenticated users to create
- Look at PocketBase logs for errors

### "Invalid token" after some time
- Tokens expire after time
- Re-login to get new token
- This is normal security behavior

## Benefits of New System

✅ **Security**: Proper password hashing, JWT tokens  
✅ **Multi-device**: Access from anywhere  
✅ **Backup**: Database backups via PocketBase  
✅ **Email**: Password reset, verification  
✅ **Scalability**: Can handle many users  
✅ **Admin UI**: Manage users and data  

## Support

- [README.md](./README.md) - Full documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick setup guide
- [pocketbase_schema.md](./pocketbase_schema.md) - Database schema
- [PocketBase Docs](https://pocketbase.io/docs/) - Official docs
