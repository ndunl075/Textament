# Environment Variables Setup

## Create `.env.local` file

Create a file named `.env.local` in the root directory with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://riogzhmcokdurcfciibz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_OIxuj5rsejI-yQyrTQD1nQ__s1rjW-M

# Gmail Configuration (for sending SMS via email gateway)
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Cron Job Security
CRON_SECRET=8dda0f96f95599ad7a48955832f1308d673a5462a0834ba0cbe945288313571
```

## Important Notes:

### Supabase Key Format
The key you provided (`sb_publishable_...`) might need to be the **anon/public key** instead. 

**To get the correct key:**
1. Go to your Supabase dashboard: https://riogzhmcokdurcfciibz.supabase.co
2. Navigate to **Settings** → **API**
3. Look for **"anon public"** key (usually starts with `eyJ...` - a JWT token)
4. Use that key instead if the current one doesn't work

### Next Steps:

1. **Set up the database table:**
   - Go to your Supabase dashboard
   - Navigate to **SQL Editor**
   - Copy and paste the contents of `schema.sql`
   - Click **Run** to create the `subscribers` table

2. **Get Gmail App Password:**
   - Go to your Google Account settings
   - Navigate to **Security** → **2-Step Verification** (enable if not already enabled)
   - Go to **App passwords** (you may need to search for it)
   - Generate a new app password for "Mail"
   - Copy the generated password → `GMAIL_APP_PASSWORD`
   - Use your Gmail address → `GMAIL_USER`
   - Replace the placeholder values in `.env.local`

3. **Test the connection:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` and try subscribing with a test phone number.

