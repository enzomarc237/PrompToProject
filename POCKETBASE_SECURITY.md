# PocketBase Security Configuration

## Required API Rules Changes

The following changes should be made in the PocketBase Admin UI for improved security:

### Users Collection API Rules

**Current Issue:** Any authenticated user can view all users' data, including emails (due to `emailVisibility: true`).

**Recommended Changes:**

1. **List/View Rule:** Change from `@request.auth.id != ""` to `id = @request.auth.id`
   - This restricts users to only view their own profile
   - Prevents potential data exposure of other users

2. **Email Visibility:** Consider setting `emailVisibility = false` by default
   - Only enable if your app specifically needs users to see each other's emails
   - Can be configured per-user if needed

### How to Update in PocketBase Admin UI

1. Start PocketBase: `./pocketbase serve`
2. Open http://127.0.0.1:8090/_/
3. Navigate to Collections → users
4. Click on "API rules" tab
5. Update the **List/View rule** to: `id = @request.auth.id`
6. (Optional) In the collection settings, disable "Email visibility" if not needed
7. Save changes

### Projects Collection

Current API rules are secure:
- ✅ List/View: `user = @request.auth.id` (users see only their projects)
- ✅ Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- ✅ Update: `user = @request.auth.id`
- ✅ Delete: `user = @request.auth.id`

## Security Improvements Implemented

### 1. Filter Injection Prevention ✅
- Added `escapeFilter()` utility to sanitize user input
- Prevents malicious filter queries
- Applied to all user/search queries

### 2. Proper JSON Handling ✅
- Removed unnecessary `JSON.stringify()`/`JSON.parse()`
- PocketBase handles native JS objects directly
- Reduces parse errors and improves performance

### 3. Pagination ✅
- Replaced `getFullList` with `getList(page, perPage)`
- Default: 50 items per page
- Prevents performance issues with large datasets

### 4. Field Whitelisting ✅
- `updateUser()` only allows: name, email, avatar
- Prevents accidental updates to protected fields (id, created, etc.)
- Avatar uploads use FormData as required by PocketBase

### 5. Automatic Token Refresh ✅
- JWT decoded to get expiration time
- Refresh scheduled 1 minute before expiry
- Auto-logout on refresh failure
- Proper cleanup to prevent memory leaks

## Production Checklist

Before deploying to production:

- [ ] Update users collection API rules as documented above
- [ ] Configure SMTP for email verification/password reset
- [ ] Enable HTTPS (required for production)
- [ ] Set proper CORS origins in PocketBase settings
- [ ] Enable PocketBase automatic backups
- [ ] Consider rate limiting for auth endpoints
- [ ] Review and test all API rules
- [ ] Set strong admin password
- [ ] Configure environment-specific `VITE_POCKETBASE_URL`

## Additional Recommendations

### For Enhanced Security:
- Consider implementing 2FA (can be added via PocketBase hooks)
- Add rate limiting using PocketBase middleware
- Monitor failed login attempts
- Implement IP-based restrictions if needed
- Use HttpOnly cookies for tokens (requires backend proxy)

### For Better UX:
- Implement password strength requirements
- Add "remember me" functionality
- Show session expiry warnings
- Implement concurrent session management
