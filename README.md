# Textament

A minimalist website where users enter their phone number to receive a daily SMS containing both a Bible verse and a motivational quote.

## Features

- **Landing Page**: Clean, brutalist design with phone number subscription form
- **Daily SMS**: Automated daily messages with Bible verses and motivational quotes
- **Supabase Integration**: Secure storage of subscriber phone numbers
- **Email-to-SMS**: SMS delivery via Gmail using Verizon's email gateway

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React
- **Backend**: Supabase (database)
- **SMS**: Nodemailer (Gmail) → Verizon SMS Gateway

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create `.env.local` and fill in your credentials:
   - Supabase URL and anon key
   - Gmail address and app password
   - CRON_SECRET for securing the cron endpoint (optional, currently disabled for testing)

3. **Set up Supabase**:
   - Create a new Supabase project
   - Run the SQL from `schema.sql` in your Supabase SQL editor
   - Copy your project URL and anon key to `.env.local`

4. **Set up Gmail App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Generate an App Password for "Mail"
   - Add your Gmail address and app password to `.env.local`

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Set up the cron job**:
   - Use a service like Vercel Cron, GitHub Actions, or a traditional cron service
   - Configure it to call: `GET https://your-domain.com/api/cron`
   - Note: Authentication is currently disabled for testing (can be re-enabled for production)

## Project Structure

```
├── app/
│   ├── actions.ts          # Server action for subscribing users
│   ├── api/
│   │   └── cron/
│   │       └── route.ts    # Daily cron job endpoint
│   ├── globals.css         # Global styles with fonts
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── lib/
│   └── supabase.ts         # Supabase client configuration
├── schema.sql              # Database schema
└── .env.example            # Environment variables template
```

## Design System

- **Background**: Tan/Beige (#F2E8CF)
- **Text**: Pure Black (#000000)
- **Fonts**: Merriweather (Serif) for headers, Inter (Sans) for inputs
- **UI Elements**: Square buttons, thick 2px black borders, no rounded corners

