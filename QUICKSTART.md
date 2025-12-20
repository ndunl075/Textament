# Quick Start Checklist

## ✅ Completed Steps

- [x] Project structure created
- [x] Dependencies installed
- [x] Next.js updated to patched version
- [x] All code files created

## 🔧 Remaining Setup Steps

### 1. Generate CRON Secret
```bash
npm run generate-secret
```
Copy the output and save it for your `.env.local` file.

### 2. Create `.env.local` File
Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key_here
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
CRON_SECRET=paste_generated_secret_here
```

### 3. Set Up Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Copy/paste contents of `schema.sql` and run it
5. Copy your Project URL and anon key to `.env.local`

### 4. Set Up Gmail App Password
1. Go to your Google Account settings
2. Navigate to **Security** → **2-Step Verification** (enable if not already enabled)
3. Go to **App passwords** (search for it if needed)
4. Generate a new app password for "Mail"
5. Copy the generated password → `GMAIL_APP_PASSWORD`
6. Use your Gmail address → `GMAIL_USER`
7. Add both to `.env.local`

### 5. Test Locally
```bash
npm run dev
```
Visit `http://localhost:3000` and test the subscription form.

### 6. Deploy & Set Up Cron
- Deploy to Vercel (recommended): `vercel`
- Add all environment variables in Vercel dashboard
- The `vercel.json` file is already configured for daily cron at 9 AM UTC

## 📝 Notes

- Phone numbers must include country code (e.g., +1234567890)
- The cron job runs daily at 9 AM UTC (configure in `vercel.json` if needed)
- Test the cron endpoint manually before deploying

## 🧪 Testing Cron Endpoint

Since authentication is removed for testing, you can test directly:
```bash
# Local testing
curl -X GET http://localhost:3000/api/cron

# Or visit in browser: http://localhost:3000/api/cron
```

For detailed setup instructions, see `SETUP.md`.

