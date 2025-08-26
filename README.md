# Morag-UI Starter Template

<p align="center">
  <img src="app/favicon.svg" />
</p>

This is a Morag-UI project set up with
[Next.js](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/) and
[ShadCN](https://ui.shadcn.com).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Development Features

### Auto-Login

For development convenience, the application includes an auto-login mechanism that automatically signs you in with a default admin user.

**Configuration:**

Add the following to your `.env` file:

```env
# Development Auto-Login Configuration
ENABLE_AUTO_LOGIN=true
AUTO_LOGIN_EMAIL="admin@morag.local"
AUTO_LOGIN_PASSWORD="admin123"
AUTO_LOGIN_NAME="Development Admin"
```

**How it works:**

1. Auto-login is only enabled in development mode (`NODE_ENV=development`)
2. When you visit the login page, it automatically attempts to log you in
3. If the user doesn't exist, it creates one with admin privileges
4. You'll be redirected to the main application without manual login

**Security:**

- Auto-login is automatically disabled in production
- The password is never exposed to the frontend
- The feature can be disabled by setting `ENABLE_AUTO_LOGIN=false`

**Default Credentials:**

The auto-login user is created with:
- Email: `admin@morag.local`
- Role: `ADMIN`
- Default realm and API keys are automatically created
