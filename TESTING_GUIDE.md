# Testing Guide for Textament

## Current Configuration

### Schedule
- **Cron Schedule**: `0 12 * * *` (12:00 PM UTC daily)
- **Local Time Equivalent**: 
  - **7:00 AM EST** (Eastern Standard Time, UTC-5)
  - **8:00 AM EDT** (Eastern Daylight Time, UTC-4) 
  - Adjusts automatically with daylight saving time
- **Status**: ✅ Already configured for 7 AM EST!

### Message Format
The system now sends **one combined message** per day with this format:

```
Daily Textament

"bible verse text"

Daily Motivation

"motivational quote text"
```

### Who Receives Messages
✅ **All active subscribers** receive messages daily at 7 AM EST
- The cron job queries: `SELECT * FROM subscribers WHERE active = true`
- Sends to everyone in the database with `active = true`
- New subscribers are automatically set to `active = true` when they sign up

## How to Test

### Option 1: Test the Cron Endpoint Directly (Recommended)

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the cron endpoint in your browser:**
   ```
   http://localhost:3000/api/cron
   ```
   
   Or use curl:
   ```bash
   curl http://localhost:3000/api/cron
   ```

3. **Check the response** - You should see:
   - Number of subscribers found
   - Success/failure status for each send
   - Message IDs if successful

4. **Check the console logs** - The server will show:
   - Gmail connection verification
   - Each subscriber being processed
   - Message content being sent
   - Success/failure for each send

### Option 2: Test with Test SMS Endpoint

1. **Use the test endpoint with your phone number:**
   ```
   http://localhost:3000/api/test-sms?phone=+1234567890
   ```
   (Replace with your actual phone number)

2. **This will:**
   - Send a test message to your phone
   - Show you the exact format
   - Provide troubleshooting steps

### Option 3: Test the Full Flow

1. **Add a test subscriber:**
   - Visit `http://localhost:3000`
   - Enter your phone number in the format: `+1234567890`
   - Click subscribe

2. **Verify in database:**
   - Check your Supabase dashboard
   - Go to Table Editor → `subscribers`
   - Verify your phone number is there with `active = true`

3. **Trigger the cron manually:**
   - Visit `http://localhost:3000/api/cron`
   - Or wait for the scheduled time (7 AM EST)

4. **Check your phone** - You should receive:
   ```
   Daily Textament

   "For God so loved the world..."

   Daily Motivation

   "The only way to do great work..."
   ```

## What to Check

### ✅ Success Indicators

1. **Cron endpoint returns:**
   ```json
   {
     "success": true,
     "message": "Messages sent",
     "successful": 1,
     "failed": 0
   }
   ```

2. **Console logs show:**
   - `✓ Gmail transporter verified successfully`
   - `Found X subscribers.`
   - `✓ Message sent. MessageId: ...`
   - `Successful: X`

3. **Gmail Sent folder:**
   - Check the Gmail account used (`GMAIL_USER`)
   - Look for emails sent to `[10digits]@vtext.com`
   - Emails should be in the Sent folder

4. **Phone receives SMS:**
   - Message should arrive within 1-2 minutes
   - Format should match the expected format above

### ⚠️ Common Issues

1. **"No subscribers found"**
   - Check Supabase database has subscribers
   - Verify `active = true` in database
   - Try adding a test subscriber

2. **"Gmail authentication failed"**
   - Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env.local`
   - Check Gmail App Password is correct (16 characters)
   - Ensure 2-Step Verification is enabled

3. **"Message sent" but no SMS received**
   - Check Gmail Sent folder for the email
   - Verify phone number is Verizon (vtext.com only works for Verizon)
   - Text "Status" to 4040 to check if email-to-text is enabled
   - Text "On" to 4040 to enable email-to-text if disabled
   - See `VERIZON_TROUBLESHOOTING.md` for more details

4. **Messages too long**
   - SMS has a 160 character limit per message
   - The combined message format should stay under limits
   - Check console logs for message length

## Production Testing

When deployed to Vercel:

1. **Check Vercel Cron Jobs:**
   - Go to Vercel Dashboard → Your Project → Cron Jobs
   - Verify the cron job is scheduled correctly
   - Check execution logs

2. **Monitor logs:**
   - Vercel Dashboard → Your Project → Logs
   - Look for cron execution logs
   - Check for any errors

3. **Test endpoint:**
   ```
   https://your-domain.com/api/cron
   ```
   (Note: May require authentication if `CRON_SECRET` is enabled)

## Message Format Details

**Current Format:**
```
Daily Textament

"For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."

Daily Motivation

"The only way to do great work is to love what you do."
```

**Source:**
- Bible verse: Fetched from `https://beta.ourmanna.com/api/v1/get?format=json&order=daily`
- Motivation quote: Fetched from `https://zenquotes.io/api/today`
- Falls back to default values if APIs fail

## Schedule Timezone Reference

The cron schedule `0 12 * * *` means **12:00 PM UTC daily**.

This translates to:
- **7:00 AM EST** (UTC-5) - November to March
- **8:00 AM EDT** (UTC-4) - March to November
- **4:00 AM PST** (UTC-8) - November to March  
- **5:00 AM PDT** (UTC-7) - March to November

To change the time, modify `vercel.json`:
- `0 11 * * *` = 11:00 UTC = 6:00 AM EST
- `0 13 * * *` = 13:00 UTC = 8:00 AM EST
- Use [crontab.guru](https://crontab.guru) to calculate your desired time

