# Textament Setup Guide

Follow these steps to complete the setup of your Textament project.

## Step 1: Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gmail Configuration (for sending SMS via email gateway)
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Cron Job Security
CRON_SECRET=your_random_secret_string_for_cron_authentication
```

### Getting Your Credentials:

**Supabase:**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings → API
3. Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Gmail:**
1. Go to your Google Account settings
2. Navigate to **Security** → **2-Step Verification** (enable if not already enabled)
3. Go to **App passwords** (you may need to search for it)
4. Generate a new app password for "Mail"
5. Copy the generated password → `GMAIL_APP_PASSWORD`
6. Use your Gmail address → `GMAIL_USER`

**CRON_SECRET:**
- Generate a random string (e.g., use `openssl rand -hex 32` or any password generator)
- This will be used to secure your cron endpoint

## Step 2: Set Up Database

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Run the SQL query to create the `subscribers` table

## Step 3: Update Dependencies (if needed)

If you haven't already, run:
```bash
npm install
```

## Step 4: Test the Application

Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see your landing page.

## Step 5: Set Up Daily Cron Job

You need to configure a service to call your cron endpoint daily. Here are options:

### Option A: Vercel Cron (Recommended if deploying to Vercel)

Create `vercel.json` in your project root:
```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 9 * * *"
  }]
}
```

Then set the `CRON_SECRET` environment variable in Vercel dashboard.

### Option B: GitHub Actions

Create `.github/workflows/daily-cron.yml`:
```yaml
name: Daily SMS Cron
on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC daily
  workflow_dispatch:  # Allows manual trigger

jobs:
  send-sms:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cron Endpoint
        run: |
          curl -X GET https://your-domain.com/api/cron \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### Option C: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Cronitor](https://cronitor.io)

Configure them to call:
- URL: `https://your-domain.com/api/cron`
- Method: GET
- Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Schedule: Daily (your preferred time)

## Step 6: Deploy

Deploy to your preferred platform:
- **Vercel**: `vercel` (recommended for Next.js)
- **Netlify**: `netlify deploy`
- **Railway**: Connect your GitHub repo

Make sure to add all environment variables in your deployment platform's dashboard.

## Testing the Cron Endpoint

You can manually test the cron endpoint:
```bash
# Since authentication is removed for testing, you can access directly:
curl -X GET http://localhost:3000/api/cron

# Or visit in browser: http://localhost:3000/api/cron
```

Or use a tool like Postman or Thunder Client in VS Code.

## Troubleshooting

- **Supabase connection issues**: Verify your URL and anon key are correct
- **SMS not sending**: Verify your Gmail app password is correct and 2FA is enabled. Check that phone numbers are in correct format (+1234567890 for US numbers)
- **Cron endpoint returns 401**: Verify your `CRON_SECRET` matches in both `.env.local` and your cron service
- **Phone number validation fails**: Ensure phone numbers include country code (e.g., +1234567890)

