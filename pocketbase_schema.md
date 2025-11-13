# PocketBase Schema Setup

This document describes the required PocketBase collections and their configuration.

## Collections

### 1. users (auth collection)

This is the default auth collection. Enable these options:

**Collection Name:** `users`  
**Type:** Auth

**Fields:**
- `email` (Email) - Required, Unique
- `name` (Text) - Required
- `avatar` (File) - Optional, single file

**Options:**
- Enable "Email/Password authentication"
- Enable "Email visibility"
- Optional: Enable "Email verification" for production

**API Rules:**
- List/View: `@request.auth.id != ""`
- Create: Public (anyone can register)
- Update: `@request.auth.id = id`
- Delete: `@request.auth.id = id`

### 2. projects (base collection)

**Collection Name:** `projects`  
**Type:** Base

**Fields:**
- `user` (Relation) - Required
  - Collection: users
  - Type: Single
  - Cascade delete: Yes
- `name` (Text) - Required
  - Min: 1, Max: 200
- `description` (Text) - Optional
  - Max: 500
- `options` (JSON) - Required
  - Stores ProjectOptions
- `files` (JSON) - Required
  - Stores FileNode[]

**API Rules:**
- List/View: `user = @request.auth.id`
- Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- Update: `user = @request.auth.id`
- Delete: `user = @request.auth.id`

## Quick Setup

### Using PocketBase Admin UI

1. Start PocketBase:
   ```bash
   ./pocketbase serve
   ```

2. Open http://127.0.0.1:8090/_/ in your browser

3. Create an admin account

4. Create the collections:
   - The `users` collection already exists by default
   - Create the `projects` collection with the fields and rules above

### Using PocketBase Import (Alternative)

If you have a `pb_schema.json` file, you can import it:

```bash
./pocketbase migrate collections pb_schema.json
```

## Email Configuration (Optional but Recommended)

For production, configure SMTP in PocketBase settings:

1. Go to Settings > Mail settings
2. Configure your SMTP provider (Gmail, SendGrid, Mailgun, etc.)
3. Enable email verification and password reset features

## Test the Setup

After setup, test the API:

```bash
# Register a user
curl -X POST http://127.0.0.1:8090/api/collections/users/records \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"12345678","passwordConfirm":"12345678","name":"Test User"}'

# Login
curl -X POST http://127.0.0.1:8090/api/collections/users/auth-with-password \\
  -H "Content-Type: application/json" \\
  -d '{"identity":"test@example.com","password":"12345678"}'
```
