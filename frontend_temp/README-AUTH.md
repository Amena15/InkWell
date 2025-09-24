# Authentication System Setup

This guide will help you set up the authentication system for the InkWell application.

## Prerequisites

- Node.js 16.14.0 or later
- PostgreSQL database
- Google OAuth 2.0 credentials (for Google login)
- GitHub OAuth App (for GitHub login)

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/inkwell?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

## Setting Up OAuth Providers

### Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Configure the consent screen if prompted
6. Set the authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env.local` file

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set the Homepage URL to `http://localhost:3000`
4. Set the Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
5. Register the application
6. Generate a new client secret
7. Copy the Client ID and Client Secret to your `.env.local` file

## Database Setup

1. Make sure you have PostgreSQL installed and running
2. Create a new database for the application
3. Update the `DATABASE_URL` in your `.env.local` file with your database credentials

## Running Migrations

After setting up your database, run the following commands to apply the database schema:

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev --name init
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`

## Available Routes

- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Protected dashboard (requires authentication)
- `/api/auth/*` - Authentication API routes

## Authentication Methods

The application supports the following authentication methods:

- Email/Password
- Google OAuth
- GitHub OAuth

## Session Management

Sessions are managed using JSON Web Tokens (JWT) and are stored in HTTP-only cookies for security.

## Security Considerations

- Always use HTTPS in production
- Keep your environment variables secure and never commit them to version control
- Use strong passwords for your database and OAuth applications
- Regularly update your dependencies to include security patches
